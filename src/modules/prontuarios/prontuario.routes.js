const { Router } = require('express');
const controller = require('./prontuario.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Prontuários
 *   description: Registro e histórico clínico dos pacientes
 */

/** @swagger
 * /prontuarios:
 *   post:
 *     summary: Criar prontuário vinculado a uma consulta
 *     tags: [Prontuários]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId, consultaId, descricao]
 *             properties:
 *               pacienteId: { type: string, format: uuid }
 *               consultaId: { type: string, format: uuid }
 *               descricao: { type: string }
 *               diagnostico: { type: string }
 *     responses:
 *       201: { description: Prontuário criado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 */
router.post('/', roleMiddleware(['PROFISSIONAL', 'ADMIN']),
    [body('pacienteId').isUUID(), body('consultaId').isUUID(), body('descricao').notEmpty()],
    auditLogger('CREATE', 'Prontuario'), controller.criar);

/** @swagger
 * /prontuarios/paciente/{pacienteId}:
 *   get:
 *     summary: Listar prontuários de um paciente (histórico clínico)
 *     tags: [Prontuários]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: pacienteId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Histórico clínico do paciente }
 *       401: { description: Não autorizado. }
 *       404: { description: Paciente não encontrado }
 */
router.get('/paciente/:pacienteId', controller.listarPorPaciente);

/** @swagger
 * /prontuarios/{id}:
 *   get:
 *     summary: Buscar prontuário por ID
 *     tags: [Prontuários]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados do prontuário }
 *       401: { description: Não autorizado. }
 *       404: { description: Prontuário não encontrado }
 */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /prontuarios/{id}:
 *   put:
 *     summary: Atualizar prontuário
 *     tags: [Prontuários]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao: { type: string, example: "Paciente apresentou melhora no quadro clínico." }
 *               diagnostico: { type: string, example: "Resfriado comum (em recuperação)" }
 *     responses:
 *       200: { description: Prontuário atualizado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 *       404: { description: Prontuário não encontrado }
 */
router.put('/:id', roleMiddleware(['PROFISSIONAL', 'ADMIN']),
    [param('id').isUUID(), body('descricao').optional().isString(), body('diagnostico').optional().isString()],
    auditLogger('UPDATE', 'Prontuario'), controller.atualizar);

module.exports = router;
