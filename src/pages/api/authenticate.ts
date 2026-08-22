import { NextApiRequest, NextApiResponse } from 'next';
import { stringifySetCookie } from 'cookie';

/**
 * Password check for routes listed in `protectedRoutes`.
 *
 * The password is read from the environment. It used to be a string literal in
 * this file, which is a problem for a repository that is going public: the
 * "protection" would be readable by anyone browsing the source. When
 * SITE_PASSWORD is not configured the feature is off and every attempt is
 * rejected, which is the correct default — no configuration should never mean
 * no protection.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const correctPassword = process.env.SITE_PASSWORD;

    if (!correctPassword) {
        return res.status(503).json({ message: 'Password protection is not configured' });
    }

    const { password } = req.body;

    if (password !== correctPassword) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    // cookie v2 takes a single object rather than (name, value, options).
    res.setHeader(
        'Set-Cookie',
        stringifySetCookie({
            name: 'authToken',
            value: 'authenticated',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60,
            sameSite: 'strict',
            path: '/',
        })
    );

    return res.status(200).json({ success: true });
}
