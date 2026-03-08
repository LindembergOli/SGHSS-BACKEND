const { Router } = require('express');
const authController = require('./auth.controller');
const { registerValidator, loginValidator } = require('./auth.validator');
const authMiddleware = require('../../middlewares/authMiddleware');
const auditLogger = require('../../middlewares/auditLogger');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e gerenciamento de usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - perfil
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@email.com"
 *               senha:
 *                 type: string
 *                 example: "senha123"
 *               perfil:
 *                 type: string
 *                 enum: [PACIENTE, PROFISSIONAL, ADMIN]
 *                 example: "PACIENTE"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: E-mail já cadastrado
 */
router.post('/register', registerValidator, auditLogger('CREATE', 'Usuario'), authController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realizar login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@email.com"
 *               senha:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginValidator, auditLogger('LOGIN', 'Usuario'), authController.login);

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get('/perfil', authMiddleware, authController.perfil);

module.exports = router;
