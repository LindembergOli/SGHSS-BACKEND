const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../shared/prisma');
const { jwtSecret, jwtExpiresIn } = require('../../config/auth');
const logger = require('../../shared/utils/logger');

class AuthService {
    /**
     * Registra um novo usuário
     */
    async registrar({ email, senha, perfil }) {
        // Verifica se o e-mail já está cadastrado
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExistente) {
            const error = new Error('E-mail já cadastrado.');
            error.statusCode = 409;
            throw error;
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria o usuário
        const usuario = await prisma.usuario.create({
            data: {
                email,
                senhaHash,
                perfil,
            },
            select: {
                id: true,
                email: true,
                perfil: true,
                ativo: true,
                createdAt: true,
            },
        });

        logger.info('Novo usuário registrado', { id: usuario.id, perfil: usuario.perfil });

        return usuario;
    }

    /**
     * Realiza login e retorna o token JWT
     */
    async login({ email, senha }) {
        // Busca o usuário pelo e-mail
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario) {
            const error = new Error('E-mail ou senha incorretos.');
            error.statusCode = 401;
            throw error;
        }

        if (!usuario.ativo) {
            const error = new Error('Usuário desativado. Entre em contato com o administrador.');
            error.statusCode = 403;
            throw error;
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaValida) {
            const error = new Error('E-mail ou senha incorretos.');
            error.statusCode = 401;
            throw error;
        }

        // Gera o token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                perfil: usuario.perfil,
            },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        logger.info('Login realizado', { id: usuario.id });

        return {
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                perfil: usuario.perfil,
            },
        };
    }

    /**
     * Retorna os dados do usuário autenticado
     */
    async perfil(usuarioId) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                email: true,
                perfil: true,
                ativo: true,
                createdAt: true,
                paciente: true,
                profissional: true,
            },
        });

        if (!usuario) {
            const error = new Error('Usuário não encontrado.');
            error.statusCode = 404;
            throw error;
        }

        return usuario;
    }
}

module.exports = new AuthService();
