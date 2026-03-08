const { Router } = require('express');
const controller = require('./prescricao.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/** @swagger
 * tags:
 *   name: Prescrições
 *   description: Receitas digitais e prescrições médicas */

/** @swagger
 * /prescricoes:
 *   post:
 *     summary: Emitir prescrição (receita digital)
 *     tags: [Prescrições]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consultaId, medicamento, dosagem]
 *             properties:
 *               consultaId: { type: string, format: uuid }
 *               medicamento: { type: string, example: "Amoxicilina 500mg" }
 *               dosagem: { type: string, example: "1 comprimido a cada 8 horas" }
 *               instrucoes: { type: string, example: "Tomar por 7 dias após as refeições" }
 *     responses:
 *       201: { description: Prescrição emitida }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       403: { description: Acesso negado. Apenas usuários com perfil PROFISSIONAL (médicos) podem emitir prescrições médicas. } */
router.post('/', roleMiddleware(['PROFISSIONAL']),
    [body('consultaId').isUUID(), body('medicamento').notEmpty(), body('dosagem').notEmpty()],
    auditLogger('CREATE', 'Prescricao'), controller.criar);

/** @swagger
 * /prescricoes:
 *   get:
 *     summary: Listar prescrições
 *     tags: [Prescrições]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: consultaId, schema: { type: string } }
 *       - { in: query, name: profissionalId, schema: { type: string } }
 *     responses:
 *       200: { description: Lista de prescrições }
 *       401: { description: Não autorizado. O token não foi fornecido. } */
router.get('/', controller.listar);

/** @swagger
 * /prescricoes/{id}:
 *   get:
 *     summary: Buscar prescrição por ID
 *     tags: [Prescrições]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados da prescrição }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       404: { description: Prescrição não encontrada } */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

module.exports = router;
