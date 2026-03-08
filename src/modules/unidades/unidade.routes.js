const { Router } = require('express');
const controller = require('./unidade.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');
const { body, param, query } = require('express-validator');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Unidades Hospitalares
 *   description: Gerenciamento de hospitais, clínicas, laboratórios e home care
 */

/** @swagger
 * /unidades/dashboard:
 *   get:
 *     summary: Dashboard administrativo com estatísticas gerais
 *     tags: [Unidades Hospitalares]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Estatísticas das unidades hospitalares }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 */
router.get('/dashboard', roleMiddleware(['ADMIN']), controller.dashboard);

/** @swagger
 * /unidades:
 *   post:
 *     summary: Cadastrar nova unidade hospitalar
 *     tags: [Unidades Hospitalares]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, tipo, endereco, telefone]
 *             properties:
 *               nome: { type: string, example: "Hospital Central VidaPlus" }
 *               tipo: { type: string, enum: [HOSPITAL, CLINICA, LABORATORIO, HOME_CARE] }
 *               endereco: { type: string, example: "Av. Paulista, 1000 - São Paulo/SP" }
 *               telefone: { type: string, example: "(11) 3000-0000" }
 *     responses:
 *       201: { description: Unidade criada com sucesso }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 */
router.post('/', roleMiddleware(['ADMIN']),
    [body('nome').notEmpty(), body('tipo').isIn(['HOSPITAL', 'CLINICA', 'LABORATORIO', 'HOME_CARE']),
    body('endereco').notEmpty(), body('telefone').notEmpty()],
    auditLogger('CREATE', 'UnidadeHospitalar'), controller.criar);

/** @swagger
 * /unidades:
 *   get:
 *     summary: Listar unidades hospitalares
 *     tags: [Unidades Hospitalares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer } }
 *       - { in: query, name: limite, schema: { type: integer } }
 *       - { in: query, name: tipo, schema: { type: string, enum: [HOSPITAL, CLINICA, LABORATORIO, HOME_CARE] } }
 *     responses:
 *       200: { description: Lista de unidades }
 *       401: { description: Não autorizado. }
 */
router.get('/', controller.listar);

/** @swagger
 * /unidades/{id}:
 *   get:
 *     summary: Buscar unidade por ID
 *     tags: [Unidades Hospitalares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados da unidade com leitos e profissionais }
 *       401: { description: Não autorizado. }
 *       404: { description: Unidade não encontrada }
 */
router.get('/:id', [param('id').isUUID()], controller.buscarPorId);

/** @swagger
 * /unidades/{id}:
 *   put:
 *     summary: Atualizar unidade hospitalar
 *     tags: [Unidades Hospitalares]
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
 *               tipo: { type: string, enum: [HOSPITAL, CLINICA, LABORATORIO, HOME_CARE] }
 *               endereco: { type: string }
 *               telefone: { type: string }
 *     responses:
 *       200: { description: Unidade atualizada }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Unidade não encontrada }
 */
router.put('/:id', roleMiddleware(['ADMIN']),
    [param('id').isUUID(), body('tipo').optional().isIn(['HOSPITAL', 'CLINICA', 'LABORATORIO', 'HOME_CARE'])],
    auditLogger('UPDATE', 'UnidadeHospitalar'), controller.atualizar);

/** @swagger
 * /unidades/{id}:
 *   delete:
 *     summary: Remover unidade hospitalar
 *     tags: [Unidades Hospitalares]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Unidade removida }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN. }
 *       404: { description: Unidade não encontrada }
 */
router.delete('/:id', roleMiddleware(['ADMIN']), [param('id').isUUID()],
    auditLogger('DELETE', 'UnidadeHospitalar'), controller.remover);

module.exports = router;
