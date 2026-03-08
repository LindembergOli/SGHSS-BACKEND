const { Router } = require('express');
const controller = require('./leito.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Leitos
 *   description: Controle de leitos hospitalares (UTI, Enfermaria, Isolamento)
 */

/** @swagger
 * /leitos:
 *   post:
 *     summary: Cadastrar novo leito em uma unidade
 *     tags: [Leitos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unidadeId, numero, tipo]
 *             properties:
 *               unidadeId: { type: string, format: uuid, description: "ID da unidade hospitalar" }
 *               numero: { type: string, example: "UTI-001" }
 *               tipo: { type: string, example: "UTI", description: "UTI, ENFERMARIA ou ISOLAMENTO" }
 *     responses:
 *       201: { description: Leito criado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       409: { description: Leito com número duplicado }
 */
router.post('/', roleMiddleware(['ADMIN']),
    [body('unidadeId').isUUID(), body('numero').notEmpty(), body('tipo').notEmpty()],
    auditLogger('CREATE', 'Leito'), controller.criar);

/** @swagger
 * /leitos:
 *   get:
 *     summary: Listar leitos com filtros opcionais
 *     tags: [Leitos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer } }
 *       - { in: query, name: limite, schema: { type: integer } }
 *       - { in: query, name: unidadeId, schema: { type: string, format: uuid }, description: "Filtrar por unidade" }
 *       - { in: query, name: status, schema: { type: string, enum: [LIVRE, OCUPADO, MANUTENCAO] } }
 *       - { in: query, name: tipo, schema: { type: string }, description: "Filtrar por tipo (ex UTI)" }
 *     responses:
 *       200: { description: Lista de leitos }
 *       401: { description: Não autorizado. }
 */
router.get('/', controller.listar);

/** @swagger
 * /leitos/{id}:
 *   get:
 *     summary: Buscar leito por ID com histórico de internações
 *     tags: [Leitos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados do leito }
 *       401: { description: Não autorizado. }
 *       404: { description: Leito não encontrado }
 */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /leitos/{id}/status:
 *   patch:
 *     summary: Atualizar status do leito (LIVRE, OCUPADO, MANUTENCAO)
 *     tags: [Leitos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [LIVRE, OCUPADO, MANUTENCAO] }
 *     responses:
 *       200: { description: Status atualizado }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 *       404: { description: Leito não encontrado }
 */
router.patch('/:id/status', roleMiddleware(['ADMIN', 'PROFISSIONAL']),
    [param('id').isUUID(), body('status').isIn(['LIVRE', 'OCUPADO', 'MANUTENCAO'])],
    auditLogger('UPDATE', 'Leito'), controller.atualizarStatus);

/** @swagger
 * /leitos/{id}:
 *   delete:
 *     summary: Remover leito (apenas se não estiver ocupado)
 *     tags: [Leitos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Leito removido }
 *       400: { description: Leito ocupado — realize a alta antes }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Leito não encontrado }
 */
router.delete('/:id', roleMiddleware(['ADMIN']), [param('id').isUUID()],
    auditLogger('DELETE', 'Leito'), controller.remover);

module.exports = router;
