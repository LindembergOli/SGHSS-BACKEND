const { Router } = require('express');
const controller = require('./consulta.controller');
const { agendarConsultaValidator, idValidator } = require('./consulta.validator');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Consultas
 *   description: Agendamento e gerenciamento de consultas
 */

/**
 * @swagger
 * /consultas:
 *   post:
 *     summary: Agendar consulta
 *     tags: [Consultas]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId, profissionalId, dataHora]
 *             properties:
 *               pacienteId: { type: string, format: uuid }
 *               profissionalId: { type: string, format: uuid }
 *               dataHora: { type: string, format: date-time, example: "2026-03-15T10:00:00Z" }
 *               tipo: { type: string, enum: [PRESENCIAL, ONLINE], default: PRESENCIAL }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Consulta agendada }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. O token não foi fornecido ou é inválido. }
 *       409: { description: Conflito de horário }
 */
router.post('/', agendarConsultaValidator, auditLogger('CREATE', 'Consulta'), controller.agendar);

/**
 * @swagger
 * /consultas:
 *   get:
 *     summary: Listar consultas
 *     tags: [Consultas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pacienteId, schema: { type: string } }
 *       - { in: query, name: profissionalId, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string, enum: [AGENDADA, REALIZADA, CANCELADA] } }
 *       - { in: query, name: tipo, schema: { type: string, enum: [PRESENCIAL, ONLINE] } }
 *     responses:
 *       200: { description: Lista de consultas }
 *       401: { description: Não autorizado. O token não foi fornecido ou é inválido. }
 */
router.get('/', controller.listar);

/**
 * @swagger
 * /consultas/{id}:
 *   get:
 *     summary: Buscar consulta por ID (inclui prontuário, exames e prescrições)
 *     tags: [Consultas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados completos da consulta }
 *       401: { description: Não autorizado. O token não foi fornecido ou é inválido. }
 *       404: { description: Consulta não encontrada }
 */
router.get('/:id', idValidator, controller.buscarPorId);

/**
 * @swagger
 * /consultas/{id}/cancelar:
 *   patch:
 *     summary: Cancelar consulta
 *     tags: [Consultas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Consulta cancelada }
 *       400: { description: A consulta já foi cancelada ou realizada. }
 *       401: { description: Não autorizado. O token não foi fornecido ou é inválido. }
 *       404: { description: Consulta não encontrada }
 */
router.patch('/:id/cancelar', idValidator, auditLogger('CANCEL', 'Consulta'), controller.cancelar);

/**
 * @swagger
 * /consultas/{id}/realizar:
 *   patch:
 *     summary: Marcar consulta como realizada
 *     tags: [Consultas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Consulta marcada como realizada }
 *       400: { description: A consulta não está em status de agendada. }
 *       401: { description: Não autorizado. O token não foi fornecido ou é inválido. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL podem marcar consultas como realizadas. }
 *       404: { description: Consulta não encontrada }
 */
router.patch('/:id/realizar', idValidator, roleMiddleware(['ADMIN', 'PROFISSIONAL']), auditLogger('REALIZE', 'Consulta'), controller.realizar);

module.exports = router;
