import type { SessionOptions } from 'iron-session';

export interface SessionData {
  authorized?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'mad_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 8 * 60 * 60,
  },
};
