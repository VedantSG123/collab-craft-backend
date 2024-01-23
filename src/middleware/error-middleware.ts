import { Request, Response, NextFunction, Errback } from "express"

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`not found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode
  res.status(status)
  res.json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

export { notFound, errorHandler }
