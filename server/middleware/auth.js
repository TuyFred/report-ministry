const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header (preferred), Authorization Bearer, or querystring (for downloads)
    const authHeader = req.header('authorization');
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
    const token = req.header('x-auth-token') || bearerToken || req.query?.token;

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
