import jwt from 'jsonwebtoken';
import autoCatchFn from '../lib/autoCatchFn.js';

const jwtSecret = process.env.JWT_SECRET;

export const ensureUser = autoCatchFn(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please login",
        });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);

        if (!payload?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication payload",
            });
        }

        req.user = payload;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
});
