/**
 * Basic input sanitization utility to prevent XSS and NoSQL injections
 */

export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) {
        // Prevent NoSQL injection
        continue;
      }
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  return obj;
};
