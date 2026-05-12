import type {Request, Response, NextFunction } from 'express';
import aj from '../config/arcjet';
import { ArcjetNodeRequest, slidingWindow } from '@arcjet/node';

const adminClient = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval : '1m',
    max: 20,
  })
);

const teacherClient = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval : '1m',
    max: 20,
  })
);

const studentClient = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval : '1m',
    max: 10,
  })
);

const guestClient = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval : '1m',
    max: 5,
  })
);

const clients = {
  admin: adminClient,
  teacher: teacherClient,
  student: studentClient,
  guest: guestClient,
} as const;

const messages = {
  admin: "Admin request limit exceeded (20 per  minute). Slow down",
  teacher: "Request limit exceeded (20 per  minute)",
  student: "User request limit exceeded (10 per  minute). Please wait. ",
  guest: "Guest request limit exceeded (5 per minute). Please sign up for higher limits.",
} as const;

const securityMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
  if (process.env.NODE_ENV === 'test')return next();
  try {
    const role: RateLimitRole = req.user?.role ?? 'guest';
    const client = (clients as any)[role] ?? guestClient;
    const message = (messages as any)[role] ?? messages.guest;

    const arcjetRequest : ArcjetNodeRequest  = {
      headers: req.headers,
      method: req.method,
      url : req.originalUrl ?? req.url,
      socket: {remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0'},
    }

    const decision = await client.protect(arcjetRequest);
    if (decision.isDenied() && decision.reason.isBot()) {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed.',
        });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Requests blocked by security policy.',
        });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res
        .status(403)
        .json({
          error: 'Too many requests',
          message
        });
    }
    next();
  }catch(e){
    console.error('Arcjet middleware error', e);
    res.status(500).json({error: 'Internal error', message: "Something went wrong with security middleware"});
  }
}
export default securityMiddleware;
