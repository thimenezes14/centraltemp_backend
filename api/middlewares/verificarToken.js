const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        res.locals.token = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).send("Sua sessão foi invalidada ou expirada. ");
    }
}