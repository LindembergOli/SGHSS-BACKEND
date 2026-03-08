const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

/**
 * Middleware de Autenticação JWT
 * 
 * Intercepta todas as requisições protegidas e verifica se o token
 * JWT enviado no cabeçalho Authorization é válido.
 * Se válido, decodifica o token e anexa os dados do usuário em req.usuario.
 * Se inválido, retorna erro 401 (Não autorizado).
 * 
 * Formato esperado do cabeçalho: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
    // Obtém o cabeçalho de autorização da requisição
    const authHeader = req.headers.authorization;

    // Verifica se o cabeçalho foi enviado
    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    // Separa o esquema (Bearer) do token em si
    const parts = authHeader.split(' ');

    // Verifica se o formato tem exatamente 2 partes
    if (parts.length !== 2) {
        return res.status(401).json({ erro: 'Formato de token inválido.' });
    }

    const [scheme, token] = parts;

    // Verifica se o esquema é 'Bearer' (case insensitive)
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ erro: 'Token mal formatado.' });
    }

    try {
        // Decodifica e valida o token JWT usando a chave secreta
        const decoded = jwt.verify(token, jwtSecret);

        // Anexa os dados do usuário à requisição para uso nos controllers
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            perfil: decoded.perfil,
        };
        return next();
    } catch (err) {
        // Token expirado ou assinatura inválida
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
