const { Router } = require('express');
const controller = require('./internacao.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Internações
 *   description: Controle de internação e alta hospitalar de pacientes
 */

/** @swagger
 * /internacoes:
 *   post:
 *     summary: Registrar nova internação (admissão hospitalar)
 *     tags: [Internações]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId, leitoId, profissionalId, motivo]
 *             properties:
 *               pacienteId: { type: string, format: uuid, description: "ID do paciente" }
 *               leitoId: { type: string, format: uuid, description: "ID do leito (deve estar LIVRE)" }
 *               profissionalId: { type: string, format: uuid, description: "ID do profissional responsável" }
 *               motivo: { type: string, example: "Cirurgia cardíaca programada" }
 *               diagnostico: { type: string, example: "Estenose aórtica severa" }
 *               observacoes: { type: string, example: "Paciente em jejum desde 22h" }
 *     responses:
 *       201: { description: Internação registrada e leito marcado como OCUPADO }
 *       400: { description: Leito indisponível ou dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 *       404: { description: Paciente, leito ou profissional não encontrado }
 *       409: { description: Paciente já possui internação ativa }
 */
router.post('/', roleMiddleware(['ADMIN', 'PROFISSIONAL']),
    [body('pacienteId').isUUID(), body('leitoId').isUUID(), body('profissionalId').isUUID(), body('motivo').notEmpty()],
    auditLogger('CREATE', 'Internacao'), controller.internar);

/** @swagger
 * /internacoes:
 *   get:
 *     summary: Listar internações com filtros
 *     tags: [Internações]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer } }
 *       - { in: query, name: limite, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string, enum: [ATIVA, ALTA_MEDICA, TRANSFERIDA, OBITO] } }
 *       - { in: query, name: pacienteId, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Lista de internações }
 *       401: { description: Não autorizado. }
 */
router.get('/', controller.listar);

/** @swagger
 * /internacoes/{id}:
 *   get:
 *     summary: Buscar internação por ID
 *     tags: [Internações]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados completos da internação }
 *       401: { description: Não autorizado. }
 *       404: { description: Internação não encontrada }
 */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /internacoes/{id}/alta:
 *   patch:
 *     summary: Registrar alta médica (libera o leito automaticamente)
 *     tags: [Internações]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnostico: { type: string, example: "Recuperação pós-operatória satisfatória" }
 *               observacoes: { type: string, example: "Retorno em 15 dias para reavaliação" }
 *     responses:
 *       200: { description: Alta registrada e leito liberado }
 *       400: { description: Internação já finalizada }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 *       404: { description: Internação não encontrada }
 */
router.patch('/:id/alta', roleMiddleware(['ADMIN', 'PROFISSIONAL']),
    [param('id').isUUID()],
    auditLogger('UPDATE', 'Internacao'), controller.darAlta);

module.exports = router;
