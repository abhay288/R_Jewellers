export const generateProductId = (lastId?: string): string => {
  if (!lastId) return 'RJ-000001';
  const num = parseInt(lastId.replace('RJ-', ''), 10) + 1;
  return `RJ-${num.toString().padStart(6, '0')}`;
};

export const generateOrderId = (): string => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
};
