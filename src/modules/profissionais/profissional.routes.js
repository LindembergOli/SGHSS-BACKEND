const { Router } = require('express');
const controller = require('./profissional.controller');
const { criarProfissionalValidator, atualizarProfissionalValidator, idValidator } = require('./profissional.validator');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const auditLogger = require('../../middlewares/auditLogger');

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Profissionais
 *   description: Gerenciamento de profissionais de saúde
 */

/**
 * @swagger
 * /profissionais:
 *   post:
 *     summary: Cadastrar novo profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuarioId, nome, registroConselho, especialidade, tipo]
 *             properties:
 *               usuarioId: { type: string, format: uuid, description: "ID do usuário que foi criado previamente" }
 *               nome: { type: string, example: "Dr. Carlos Mendes" }
 *               registroConselho: { type: string, example: "CRM-SP 123456" }
 *               especialidade: { type: string, example: "Cardiologia" }
 *               tipo: { type: string, enum: [MEDICO, ENFERMEIRO, TECNICO] }
 *               unidadeId: { type: string, format: uuid }
 *     responses:
 *       201: { description: Profissional cadastrado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN possui permissão de cadastro. }
 *       409: { description: Registro do conselho já cadastrado. }
 */
router.post('/', roleMiddleware(['ADMIN']), criarProfissionalValidator, auditLogger('CREATE', 'Profissional'), controller.criar);

/**
 * @swagger
 * /profissionais:
 *   get:
 *     summary: Listar profissionais
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: pagina, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limite, schema: { type: integer, default: 10 } }
 *       - { in: query, name: especialidade, schema: { type: string } }
 *       - { in: query, name: tipo, schema: { type: string, enum: [MEDICO, ENFERMEIRO, TECNICO] } }
 *     responses:
 *       200: { description: Lista de profissionais }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 */
router.get('/', controller.listar);

/**
 * @swagger
 * /profissionais/{id}:
 *   get:
 *     summary: Buscar profissional por ID
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Dados do profissional com agenda }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       404: { description: Profissional não encontrado }
 */
router.get('/:id', idValidator, controller.buscarPorId);

/**
 * @swagger
 * /profissionais/{id}:
 *   put:
 *     summary: Atualizar profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Profissional atualizado }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN pode realizar atualizações de profissionais. }
 *       404: { description: Profissional não encontrado }
 */
router.put('/:id', roleMiddleware(['ADMIN']), atualizarProfissionalValidator, auditLogger('UPDATE', 'Profissional'), controller.atualizar);

/**
 * @swagger
 * /profissionais/{id}:
 *   delete:
 *     summary: Remover profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Profissional removido }
 *       401: { description: Não autorizado. O token não foi fornecido. }
 *       403: { description: Acesso negado. Apenas o perfil ADMIN tem permissão para remover profissionais. }
 *       404: { description: Profissional não encontrado }
 */
router.delete('/:id', idValidator, roleMiddleware(['ADMIN']), auditLogger('DELETE', 'Profissional'), controller.remover);

// === AGENDA ===

/**
 * @swagger
 * /profissionais/{id}/agendas:
 *   post:
 *     summary: Criar horário na agenda do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [diaSemana, horaInicio, horaFim]
 *             properties:
 *               diaSemana: { type: string, enum: [SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO, DOMINGO] }
 *               horaInicio: { type: string, example: "08:00" }
 *               horaFim: { type: string, example: "12:00" }
 *     responses:
 *       201: { description: Horário criado }
 *       400: { description: Dados inválidos da agenda ou conflito. }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 */
router.post('/:id/agendas', roleMiddleware(['ADMIN', 'PROFISSIONAL']), controller.criarAgenda);

/**
 * @swagger
 * /profissionais/{id}/agendas:
 *   get:
 *     summary: Listar agenda do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Agenda do profissional }
 *       401: { description: Não autorizado. }
 */
router.get('/:id/agendas', controller.listarAgendas);

/**
 * @swagger
 * /profissionais/{id}/agendas/{agendaId}:
 *   delete:
 *     summary: Remover horário da agenda
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: agendaId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Horário removido }
 *       401: { description: Não autorizado. }
 *       403: { description: Acesso negado. Apenas ADMIN ou PROFISSIONAL. }
 *       404: { description: Agenda não encontrada }
 */
router.delete('/:id/agendas/:agendaId', roleMiddleware(['ADMIN', 'PROFISSIONAL']), controller.removerAgenda);

module.exports = router;
