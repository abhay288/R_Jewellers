export const requestLogger = (req: Request) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
};
