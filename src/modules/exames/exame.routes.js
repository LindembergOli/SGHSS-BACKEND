const { Router } = require('express');
const controller = require('./exame.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/** @swagger
 * tags:
 *   name: Exames
 *   description: Solicitação e resultado de exames */

/** @swagger
 * /exames:
 *   post:
 *     summary: Solicitar exame
 *     tags: [Exames]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consultaId, tipo]
 *             properties:
 *               consultaId: { type: string, format: uuid }
 *               tipo: { type: string, example: "Hemograma" }
 *     responses:
 *       201: { description: Exame solicitado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       403: { description: Acesso negado. Apenas PROFISSIONAL ou ADMIN. } */
router.post('/', roleMiddleware(['PROFISSIONAL', 'ADMIN']),
    [body('consultaId').isUUID(), body('tipo').notEmpty()],
    auditLogger('CREATE', 'Exame'), controller.solicitar);

/** @swagger
 * /exames:
 *   get:
 *     summary: Listar exames
 *     tags: [Exames]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: consultaId, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string, enum: [SOLICITADO, EM_ANALISE, RESULTADO_DISPONIVEL] } }
 *     responses:
 *       200: { description: Lista de exames }
 *       401: { description: Não autorizado. O token não foi fornecido. } */
router.get('/', controller.listar);

/** @swagger
 * /exames/{id}:
 *   get:
 *     summary: Buscar exame por ID
 *     tags: [Exames]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados do exame }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       404: { description: Exame não encontrado } */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /exames/{id}/resultado:
 *   patch:
 *     summary: Registrar resultado do exame
 *     tags: [Exames]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resultado]
 *             properties:
 *               resultado: { type: string, example: "Valores normais" }
 *     responses:
 *       200: { description: Resultado registrado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       403: { description: Acesso negado. Apenas PROFISSIONAL ou ADMIN. }
 *       404: { description: Exame não encontrado } */
router.patch('/:id/resultado', roleMiddleware(['PROFISSIONAL', 'ADMIN']),
    [param('id').isUUID(), body('resultado').notEmpty()],
    auditLogger('UPDATE', 'Exame'), controller.registrarResultado);

module.exports = router;
