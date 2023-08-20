export const expressPingMiddleware = (req: any, res: any) => {
  res.json({ts: Date.now()})
}
