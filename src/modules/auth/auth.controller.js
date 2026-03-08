const { validationResult } = require('express-validator');
const authService = require('./auth.service');

class AuthController {
    /**
     * POST /auth/register
     * Registra um novo usuário
     */
    async registrar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            const { email, senha, perfil } = req.body;
            const usuario = await authService.registrar({ email, senha, perfil });

            return res.status(201).json(usuario);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /auth/login
     * Realiza login e retorna token JWT
     */
    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });
            }

            const { email, senha } = req.body;
            const resultado = await authService.login({ email, senha });

            return res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /auth/perfil
     * Retorna dados do usuário autenticado
     */
    async perfil(req, res, next) {
        try {
            const usuario = await authService.perfil(req.usuario.id);
            return res.status(200).json(usuario);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
