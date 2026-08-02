import dbConnect from './mongodb';
import { SettingService } from '@/backend/services/SettingService';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  source: 'env' | 'db' | 'none';
  mode: 'live' | 'test' | 'unknown';
}

export function sanitizeKey(val: any): string {
  if (!val) return '';
  return String(val)
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
}

/**
 * Resolves Razorpay Key ID and Secret as a matched pair.
 * Prioritizes process.env environment variables if present,
 * falling back to MongoDB Admin settings.
 */
export async function getRazorpayCredentials(): Promise<RazorpayCredentials> {
  const envKeyId = sanitizeKey(process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  const envKeySecret = sanitizeKey(process.env.RAZORPAY_KEY_SECRET);

  // If environment variables are set for both, use environment credentials
  if (envKeyId && envKeySecret) {
    const mode = envKeyId.startsWith('rzp_live_') ? 'live' : envKeyId.startsWith('rzp_test_') ? 'test' : 'unknown';
    return {
      keyId: envKeyId,
      keySecret: envKeySecret,
      source: 'env',
      mode,
    };
  }

  // Fallback to database admin settings
  try {
    await dbConnect();
    const settingService = new SettingService();
    const dbKeyId = sanitizeKey(await settingService.getSettingByKey('razorpayKeyId', ''));
    const dbKeySecret = sanitizeKey(await settingService.getSettingByKey('razorpayKeySecret', ''));

    if (dbKeyId && dbKeySecret) {
      const mode = dbKeyId.startsWith('rzp_live_') ? 'live' : dbKeyId.startsWith('rzp_test_') ? 'test' : 'unknown';
      return {
        keyId: dbKeyId,
        keySecret: dbKeySecret,
        source: 'db',
        mode,
      };
    }

    // If partial DB setting exists, combine with env
    const keyId = dbKeyId || envKeyId;
    const keySecret = dbKeySecret || envKeySecret;
    if (keyId || keySecret) {
      const mode = keyId.startsWith('rzp_live_') ? 'live' : keyId.startsWith('rzp_test_') ? 'test' : 'unknown';
      return {
        keyId,
        keySecret,
        source: dbKeyId ? 'db' : 'env',
        mode,
      };
    }
  } catch (err) {
    console.error('[RazorpayConfig] Failed to fetch DB credentials:', err);
  }

  const keyId = envKeyId;
  const keySecret = envKeySecret;
  const mode = keyId.startsWith('rzp_live_') ? 'live' : keyId.startsWith('rzp_test_') ? 'test' : 'unknown';

  return {
    keyId,
    keySecret,
    source: keyId || keySecret ? 'env' : 'none',
    mode,
  };
}

/**
 * Resolves Razorpay Webhook Secret or Key Secret
 */
export async function getRazorpayWebhookSecret(): Promise<string> {
  const envWebhookSecret = sanitizeKey(process.env.RAZORPAY_WEBHOOK_SECRET);
  if (envWebhookSecret) return envWebhookSecret;

  try {
    await dbConnect();
    const settingService = new SettingService();
    const dbWebhookSecret = sanitizeKey(await settingService.getSettingByKey('razorpayWebhookSecret', ''));
    if (dbWebhookSecret) return dbWebhookSecret;
  } catch (err) {
    console.error('[RazorpayConfig] Failed to fetch DB webhook secret:', err);
  }

  const creds = await getRazorpayCredentials();
  return creds.keySecret;
}
