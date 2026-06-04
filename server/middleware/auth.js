// Simple session middleware — no JWT, just pass userId from header
module.exports = (req, res, next) => {
    const userId = req.header('X-User-Id');

    if (!userId) {
        return res.status(401).json({ msg: 'Not authenticated' });
    }

    req.user = { userId };
    next();
};
