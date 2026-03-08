const { Router } = require('express');
const controller = require('./suprimento.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Suprimentos
 *   description: Gerenciamento de estoque hospitalar (medicamentos, materiais, EPIs)
 */

/** @swagger
 * /suprimentos:
 *   post:
 *     summary: Cadastrar novo item de suprimento
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unidadeId, nome, categoria, unidadeMedida]
 *             properties:
 *               unidadeId: { type: string, format: uuid, description: "ID da unidade hospitalar" }
 *               nome: { type: string, example: "Dipirona Sódica 500mg" }
 *               categoria: { type: string, example: "MEDICAMENTO", description: "MEDICAMENTO, MATERIAL_CIRURGICO, EPI, LIMPEZA, EQUIPAMENTO" }
 *               quantidade: { type: integer, example: 500 }
 *               unidadeMedida: { type: string, example: "CX", description: "UN, CX, PCT, L, KG" }
 *               estoqueMinimo: { type: integer, example: 50 }
 *               lote: { type: string, example: "LOTE-2026-A1" }
 *               validade: { type: string, format: date, example: "2027-06-30" }
 *               fornecedor: { type: string, example: "Distribuidora MedSupply LTDA" }
 *     responses:
 *       201: { description: Suprimento cadastrado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Unidade não encontrada }
 */
router.post('/', roleMiddleware(['ADMIN']),
    [body('unidadeId').isUUID(), body('nome').notEmpty(), body('categoria').notEmpty(), body('unidadeMedida').notEmpty()],
    auditLogger('CREATE', 'Suprimento'), controller.criar);

/** @swagger
 * /suprimentos:
 *   get:
 *     summary: Listar suprimentos com filtros
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer } }
 *       - { in: query, name: limite, schema: { type: integer } }
 *       - { in: query, name: unidadeId, schema: { type: string, format: uuid }, description: "Filtrar por unidade" }
 *       - { in: query, name: categoria, schema: { type: string }, description: "Filtrar por categoria" }
 *       - { in: query, name: estoqueBaixo, schema: { type: string, enum: [true, false] }, description: "Exibir apenas itens com estoque abaixo do mínimo" }
 *     responses:
 *       200: { description: Lista de suprimentos com alerta de estoque baixo }
 *       401: { description: Não autorizado. }
 */
router.get('/', controller.listar);

/** @swagger
 * /suprimentos/{id}:
 *   get:
 *     summary: Buscar suprimento por ID
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados do suprimento com alerta de estoque }
 *       401: { description: Não autorizado. }
 *       404: { description: Suprimento não encontrado }
 */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /suprimentos/{id}:
 *   put:
 *     summary: Atualizar dados do suprimento
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               categoria: { type: string }
 *               unidadeMedida: { type: string }
 *               estoqueMinimo: { type: integer }
 *               lote: { type: string }
 *               validade: { type: string, format: date }
 *               fornecedor: { type: string }
 *     responses:
 *       200: { description: Suprimento atualizado }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Suprimento não encontrado }
 */
router.put('/:id', roleMiddleware(['ADMIN']),
    [param('id').isUUID()],
    auditLogger('UPDATE', 'Suprimento'), controller.atualizar);

/** @swagger
 * /suprimentos/{id}/entrada:
 *   patch:
 *     summary: Registrar entrada de estoque (adição)
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantidade]
 *             properties:
 *               quantidade: { type: number, example: 100, description: "Quantidade sendo adicionada" }
 *               lote: { type: string, example: "LOTE-2026-B2" }
 *               fornecedor: { type: string, example: "Distribuidora MedSupply LTDA" }
 *     responses:
 *       200: { description: Entrada registrada com novo total }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Suprimento não encontrado }
 */
router.patch('/:id/entrada', roleMiddleware(['ADMIN']),
    [param('id').isUUID(), body('quantidade').isInt({ min: 1 })],
    auditLogger('UPDATE', 'Suprimento'), controller.registrarEntrada);

/** @swagger
 * /suprimentos/{id}/saida:
 *   patch:
 *     summary: Registrar saída de estoque (subtração)
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantidade]
 *             properties:
 *               quantidade: { type: number, example: 10, description: "Quantidade sendo retirada" }
 *               motivo: { type: string, example: "Uso em cirurgia na UTI-3" }
 *     responses:
 *       200: { description: Saída registrada com estoque restante }
 *       400: { description: Estoque insuficiente }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Suprimento não encontrado }
 */
router.patch('/:id/saida', roleMiddleware(['ADMIN']),
    [param('id').isUUID(), body('quantidade').isInt({ min: 1 })],
    auditLogger('UPDATE', 'Suprimento'), controller.registrarSaida);

/** @swagger
 * /suprimentos/{id}:
 *   delete:
 *     summary: Remover suprimento do cadastro
 *     tags: [Suprimentos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Suprimento removido }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Suprimento não encontrado }
 */
router.delete('/:id', roleMiddleware(['ADMIN']), [param('id').isUUID()],
    auditLogger('DELETE', 'Suprimento'), controller.remover);

module.exports = router;
