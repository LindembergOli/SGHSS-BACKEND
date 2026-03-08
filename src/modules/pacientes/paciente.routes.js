const { Router } = require('express');
const pacienteController = require('./paciente.controller');
const { criarPacienteValidator, atualizarPacienteValidator, idValidator } = require('./paciente.validator');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');

const router = Router();

// Todas as rotas de pacientes exigem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Pacientes
 *   description: Gerenciamento de pacientes
 */

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Cadastrar novo paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *               - dataNasc
 *               - telefone
 *               - endereco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João Silva"
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               dataNasc:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               telefone:
 *                 type: string
 *                 example: "11999998888"
 *               endereco:
 *                 type: string
 *                 example: "Rua A, 123 - São Paulo/SP"
 *               sexo:
 *                 type: string
 *                 enum: [M, F, OUTRO]
 *                 example: "M"
 *     responses:
 *       201:
 *         description: Paciente cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado. O token não foi fornecido ou é inválido.
 *       409:
 *         description: CPF já cadastrado
 */
router.post('/', criarPacienteValidator, auditLogger('CREATE', 'Paciente'), pacienteController.criar);

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Listar todos os pacientes
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de pacientes com paginação
 *       401:
 *         description: Não autorizado. O token não foi fornecido ou é inválido.
 *       403:
 *         description: Acesso negado. Apenas ADMIN ou PROFISSIONAL podem listar todos os pacientes.
 */
router.get('/', roleMiddleware(['ADMIN', 'PROFISSIONAL']), pacienteController.listar);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Buscar paciente por ID
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados do paciente
 *       401:
 *         description: Não autorizado. O token não foi fornecido ou é inválido.
 *       404:
 *         description: Paciente não encontrado
 */
router.get('/:id', idValidator, pacienteController.buscarPorId);

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Atualizar paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               dataNasc:
 *                 type: string
 *                 format: date
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: string
 *               sexo:
 *                 type: string
 *                 enum: [M, F, OUTRO]
 *     responses:
 *       200:
 *         description: Paciente atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado. O token não foi fornecido ou é inválido.
 *       404:
 *         description: Paciente não encontrado
 */
router.put('/:id', atualizarPacienteValidator, auditLogger('UPDATE', 'Paciente'), pacienteController.atualizar);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Remover paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paciente removido com sucesso
 *       401:
 *         description: Não autorizado. O token não foi fornecido ou é inválido.
 *       403:
 *         description: Acesso negado. Apenas o perfil ADMIN tem permissão para remover pacientes.
 *       404:
 *         description: Paciente não encontrado
 */
router.delete('/:id', idValidator, roleMiddleware(['ADMIN']), auditLogger('DELETE', 'Paciente'), pacienteController.remover);

module.exports = router;
