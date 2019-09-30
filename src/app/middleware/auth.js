const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        res.status(401).send({ error: 'No token provided' });

    const tokenParts = authHeader.split(' ');

    if (!tokenParts.length === 2)
        return res.status(401).send({ error: 'Token error'} );

    const [ scheme, token ] = tokenParts;

    if (!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token formatted error' })

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) res.status(401).send({ error: 'Invalid token' });

        req.userId = decoded.id;
        return next();
    })
};