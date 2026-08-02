import logger from '@/shared/lib/logger';
import Setting from '../models/Setting';
import { IOrder } from '../models/Order';
import { IReturn } from '../models/Return';

export interface CourierServiceabilityResponse {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
  rating: number;
  cod: number;
}

function sanitizeKey(val: any): string {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '').trim();
}

export class ShiprocketService {
  private email: string;
  private password: string;
  private baseUrl: string;
  private timeoutMs = 12000;

  constructor() {
    this.email = sanitizeKey(process.env.SHIPROCKET_EMAIL);
    this.password = sanitizeKey(process.env.SHIPROCKET_PASSWORD);
    this.baseUrl = sanitizeKey(process.env.SHIPROCKET_BASE_URL) || 'https://apiv2.shiprocket.in/v1/external';
  }

  /**
   * Helper to execute a fetch request with timeout, retries, and logging
   */
  private async request(
    endpoint: string,
    options: RequestInit = {},
    retries = 3,
    delay = 1000
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Auto authentication bypass for login itself
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (endpoint !== '/auth/login') {
      const token = await this.getToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    logger.info(`Shiprocket API Request: ${options.method || 'GET'} ${url}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(id);

        if (!response.ok) {
          const errText = await response.text();
          let errData;
          try {
            errData = JSON.parse(errText);
          } catch {
            errData = { message: errText };
          }
          
          logger.error(`Shiprocket API Error (Attempt ${attempt}/${retries}): Status ${response.status} - ${JSON.stringify(errData)}`);
          
          if (response.status === 401 && endpoint !== '/auth/login') {
            // Force refresh token on next attempt
            logger.warn('Token unauthorized (401). Retrying with fresh login...');
            await Setting.deleteOne({ key: 'shiprocket_token' });
            headers['Authorization'] = `Bearer ${await this.getToken()}`;
            fetchOptions.headers = headers;
            continue;
          }

          let detailedMessage = errData?.message || `Shiprocket error: Status ${response.status}`;
          if (errData?.errors && typeof errData.errors === 'object') {
            const fieldErrors = Object.entries(errData.errors)
              .map(([key, msgs]: [string, any]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('; ');
            if (fieldErrors) {
              detailedMessage += ` (${fieldErrors})`;
            }
          }

          throw new Error(detailedMessage);
        }

        const data = await response.json();
        logger.debug(`Shiprocket API Success: ${endpoint}`);
        return data;
      } catch (err: any) {
        clearTimeout(id);
        if (attempt === retries) {
          logger.error(`Shiprocket Request failed permanently on attempt ${attempt}: ${err.message}`);
          throw err;
        }
        logger.warn(`Shiprocket Retry ${attempt}/${retries} after error: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  /**
   * Fetch cached Shiprocket token or log in to get a new one
   */
  private async getToken(): Promise<string> {
    const cached = await Setting.findOne({ key: 'shiprocket_token' });
    
    if (cached && cached.value?.token && new Date(cached.value.expiresAt) > new Date()) {
      return cached.value.token;
    }

    logger.info('Shiprocket JWT token expired or missing. Initializing login...');
    if (!this.email || !this.password) {
      throw new Error('Shiprocket credentials SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured.');
    }

    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.email,
        password: this.password,
      }),
    }, 2, 500);

    if (!res.token) {
      throw new Error('Failed to retrieve token from Shiprocket response.');
    }

    // Tokens expire in 10 days, we set cache expiration to 9 days to be safe
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 9);

    await Setting.findOneAndUpdate(
      { key: 'shiprocket_token' },
      {
        value: {
          token: res.token,
          expiresAt: expiresAt.toISOString(),
        },
        group: 'shipping',
      },
      { upsert: true }
    );

    logger.info('Shiprocket JWT token successfully refreshed and cached.');
    return res.token;
  }

  /**
   * Helper to split fullName into first & last name
   */
  private splitName(fullName: string): { first: string; last: string } {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      return { first: parts[0] || 'Customer', last: '' };
    }
    const last = parts.pop() || '';
    const first = parts.join(' ');
    return { first, last };
  }

  /**
   * Create a shipment in Shiprocket
   */
  async createShipment(
    order: any, 
    dimensions: { weight: number; length: number; width: number; height: number }
  ): Promise<{ shipment_id: string; order_id: string }> {
    const addr = (typeof order.shippingAddress === 'object' && order.shippingAddress && (order.shippingAddress.postalCode || order.shippingAddress.city))
      ? order.shippingAddress 
      : (order.shippingAddressSnapshot || {});

    const nameToUse = addr.fullName || order.user?.name || 'Valued Customer';
    const { first, last } = this.splitName(nameToUse);
    
    // Address splitting (must be min 10 chars per Shiprocket specifications)
    let houseNo = (addr.houseNo || addr.flatNo || '').trim();
    let street = (addr.street || addr.address || addr.road || '').trim();
    let area = (addr.area || addr.landmark || '').trim();

    let addressLine1 = [houseNo, street].filter(Boolean).join(', ').trim();
    let addressLine2 = area;

    if (addressLine1.length < 10) {
      addressLine1 = [addressLine1, addressLine2, addr.city].filter(Boolean).join(', ').trim();
      addressLine2 = '';
      if (addressLine1.length < 10) {
        addressLine1 = `${addressLine1} Main Street Area`.trim();
      }
    }

    const items = (order.products || []).map((p: any) => ({
      name: p.name || p.product?.name || 'Jewelry Item',
      sku: p.product?.sku || p.sku || `JEWEL-${p.product?._id || 'GENERIC'}`,
      units: Number(p.quantity || 1),
      selling_price: Number(p.finalPrice || p.price || 100),
      discount: Number(p.discount || 0),
      tax: 0,
      hsn: '',
    }));

    const isCod = order.paymentMethod === 'COD';
    
    // Format YYYY-MM-DD HH:mm for Shiprocket order_date
    const d = new Date(order.createdAt || Date.now());
    const pad = (n: number) => String(n).padStart(2, '0');
    const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const rawPhone = String(addr.phone || addr.mobile || order.user?.phone || '9999999999').replace(/\D/g, '');
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '9999999999';

    const city = addr.city || 'Ahmedabad';
    const state = addr.state || 'Gujarat';
    const pincode = String(addr.postalCode || addr.pincode || '380001').replace(/\D/g, '').trim() || '380001';

    // Shiprocket rejects duplicate order_ids. Append a timestamp epoch suffix to guarantee uniqueness
    // while keeping the readable orderId intact in MongoDB. E.g. "RJ-2025-0001-1753600000"
    const shiprocketOrderId = `${order.orderId}-${Math.floor(Date.now() / 1000)}`;

    const payload = {
      order_id: shiprocketOrderId,
      order_date: orderDate,
      pickup_location: sanitizeKey(process.env.SHIPROCKET_PICKUP_LOCATION_NAME) || 'Home',
      channel_id: '',
      comment: 'Premium Luxury Jewelry',
      billing_customer_name: first,
      billing_last_name: last,
      billing_address: addressLine1,
      billing_address_2: addressLine2 || undefined,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: addr.email || order.user?.email || 'customer@radhikajewellers.com',
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: Number(order.totalAmount || 100),
      length: Number(dimensions.length || 10),
      width: Number(dimensions.width || 10),
      height: Number(dimensions.height || 10),
      weight: Number(dimensions.weight || 0.5),
    };

    try {
      const res = await this.request('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && (res.shipment_id || res.order_id)) {
        return {
          shipment_id: String(res.shipment_id || res.order_id),
          order_id: String(res.order_id || order.orderId),
        };
      }
      throw new Error(`Invalid response from Shiprocket: ${JSON.stringify(res)}`);
    } catch (err: any) {
      logger.error(`Shiprocket API shipment creation failed: ${err.message}`);
      throw new Error(`Shiprocket Order Creation Error: ${err.message}`);
    }
  }

  /**
   * Fetch available couriers for order serviceability
   */
  async fetchCouriers(
    deliveryPincode: string,
    weight: number,
    isCod: boolean,
    orderValue: number,
    pickupPincode = '380001'
  ): Promise<CourierServiceabilityResponse[]> {
    const codParam = isCod ? 1 : 0;
    const url = `/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${codParam}&order_value=${orderValue}`;
    
    const res = await this.request(url, { method: 'GET' });

    if (!res.data || !res.data.available_courier_companies) {
      return [];
    }

    return res.data.available_courier_companies.map((c: any) => ({
      courier_company_id: c.courier_company_id,
      courier_name: c.courier_name,
      rate: Number(c.rate),
      etd: c.etd || `${c.estimated_delivery_days || 5} Days`,
      rating: Number(c.rating || 4.0),
      cod: c.cod || 0,
    }));
  }

  /**
   * Assign courier and generate AWB
   */
  async assignCourier(
    shipmentId: string,
    courierId: string
  ): Promise<{ awb_code: string; courier_name: string; routing_code: string }> {
    const res = await this.request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentId,
        courier_id: courierId,
      }),
    });

    const data = res.response?.data;
    if (!data || !data.awb_code) {
      throw new Error(res.response?.message || 'Failed to assign AWB from selected courier.');
    }

    return {
      awb_code: String(data.awb_code),
      courier_name: String(data.courier_name),
      routing_code: String(data.routing_code || ''),
    };
  }

  /**
   * Schedule pickup for shipment
   */
  async schedulePickup(
    shipmentId: string,
    pickupDate: string
  ): Promise<{ pickup_id: string; pickup_status: string }> {
    const res = await this.request('/courier/generate/pickup', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [shipmentId],
        pickup_date: [pickupDate],
      }),
    });

    // Pickup scheduled successfully when response contains pickup details
    if (res.pickup_status === 'scheduled' || res.pickup_id || res.response?.pickup_id) {
      return {
        pickup_id: String(res.pickup_id || res.response?.pickup_id || 'PICKUP-OK'),
        pickup_status: String(res.pickup_status || 'scheduled'),
      };
    }

    throw new Error(res.response?.message || 'Failed to schedule pickup.');
  }

  /**
   * Fetch shipping labels URL
   */
  async generateLabel(shipmentId: string): Promise<string> {
    const res = await this.request('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    if (!res.label_url) {
      throw new Error('Label URL not found in Shiprocket response.');
    }

    return res.label_url;
  }

  /**
   * Fetch manifest PDF link
   */
  async generateManifest(shipmentId: string): Promise<string> {
    const res = await this.request('/manifests/generate', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    if (res.manifest_url) {
      return res.manifest_url;
    }

    // Print manifest endpoint as fallback
    const printRes = await this.request('/manifests/print', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    if (!printRes.manifest_url) {
      throw new Error('Failed to generate manifest.');
    }

    return printRes.manifest_url;
  }

  /**
   * Cancel shipment in Shiprocket
   */
  async cancelShipment(awbNumber: string): Promise<boolean> {
    const res = await this.request('/orders/cancel/shipment/awbs', {
      method: 'POST',
      body: JSON.stringify({
        awbs: [awbNumber],
      }),
    });

    return res.status === 200 || res.success === true;
  }

  /**
   * Get live tracking updates from Shiprocket AWB tracking API
   */
  async trackShipment(awbNumber: string): Promise<any> {
    const res = await this.request(`/courier/track/awb/${awbNumber}`, {
      method: 'GET',
    });

    const trackingData = res.tracking_data;
    if (!trackingData || !trackingData.track_status) {
      throw new Error('No tracking data found for this AWB.');
    }

    return trackingData;
  }

  /**
   * Create a Return pickup shipment
   */
  async createReturnShipment(
    returnReq: any,
    order: any,
    dimensions = { weight: 0.5, length: 10, width: 10, height: 10 }
  ): Promise<{ shipment_id: string; awb_code: string; courier_name: string }> {
    const { first, last } = this.splitName(order.shippingAddress.fullName);
    
    // Address splitting (must be min 10 chars per Shiprocket specifications)
    let pickupAddress = `${order.shippingAddress.houseNo}, ${order.shippingAddress.street}`.trim();
    let pickupAddress2 = `${order.shippingAddress.area || ''} ${order.shippingAddress.landmark || ''}`.trim();
    if (pickupAddress.length < 10) {
      pickupAddress = `${pickupAddress} ${pickupAddress2}`.trim();
      pickupAddress2 = '';
      if (pickupAddress.length < 10) {
        pickupAddress = `${pickupAddress} Near Central`.trim();
      }
    }

    const items = returnReq.products.map((p: any) => ({
      name: p.product?.name || 'Jewelry Product',
      sku: p.product?.sku || `JEWEL-RET-${p.product?._id}`,
      units: p.quantity,
      selling_price: p.refundAmount / p.quantity,
      discount: 0,
      tax: 0,
      hsn: '',
    }));

    const returnDate = new Date(returnReq.createdAt).toISOString().slice(0, 16).replace('T', ' ');

    const payload = {
      order_id: returnReq.returnId,
      order_date: returnDate,
      channel_id: '',
      pickup_customer_name: first,
      pickup_last_name: last,
      pickup_address: pickupAddress,
      pickup_address_2: pickupAddress2 || undefined,
      pickup_city: order.shippingAddress.city,
      pickup_state: order.shippingAddress.state,
      pickup_pincode: order.shippingAddress.postalCode,
      pickup_country: 'India',
      pickup_phone: order.shippingAddress.phone,
      pickup_email: order.user?.email || 'customer@radhikajewellers.com',
      shipping_customer_name: 'Radhika Jewellers',
      shipping_last_name: 'Admin',
      shipping_address: process.env.SHIPROCKET_WAREHOUSE_ADDRESS || 'Radhika Jewellers Main Showroom, CG Road',
      shipping_address_2: '',
      shipping_city: 'Ahmedabad',
      shipping_pincode: '380009',
      shipping_state: 'Gujarat',
      shipping_country: 'India',
      shipping_phone: process.env.SHIPROCKET_WAREHOUSE_PHONE || '9999999999',
      order_items: items,
      payment_method: 'Prepaid',
      sub_total: returnReq.totalRefundAmount,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: dimensions.weight,
    };

    const res = await this.request('/orders/create/return', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.shipment_id) {
      throw new Error(`Failed to create return shipment: ${JSON.stringify(res)}`);
    }

    // Auto assign AWB for returns if available in the create return response
    return {
      shipment_id: String(res.shipment_id),
      awb_code: String(res.awb_code || ''),
      courier_name: String(res.courier_name || 'Shiprocket Return Partner'),
    };
  }
}
