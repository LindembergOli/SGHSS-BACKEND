/**
 * Controller do módulo de Profissionais de Saúde
 * 
 * Recebe as requisições HTTP, valida os dados de entrada,
 * chama o service correspondente e retorna a resposta ao cliente.
 * Inclui operações de CRUD e gerenciamento de agendas.
 */

const { validationResult } = require('express-validator');
const profissionalService = require('./profissional.service');

class ProfissionalController {
    /**
     * POST /profissionais
     * Cadastra um novo profissional de saúde
     */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { usuarioId, nome, registroConselho, especialidade, tipo, unidadeId } = req.body;
            const profissional = await profissionalService.criar({
                usuarioId, nome, registroConselho, especialidade, tipo, unidadeId,
            });
            return res.status(201).json(profissional);
        } catch (err) { next(err); }
    }

    /**
     * GET /profissionais
     * Lista profissionais com paginação e filtros opcionais
     */
    async listar(req, res, next) {
        try {
            const { pagina, limite, especialidade, tipo } = req.query;
            const resultado = await profissionalService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10, especialidade, tipo,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /**
     * GET /profissionais/:id
     * Busca um profissional por ID com agenda e consultas recentes
     */
    async buscarPorId(req, res, next) {
        try {
            const profissional = await profissionalService.buscarPorId(req.params.id);
            return res.status(200).json(profissional);
        } catch (err) { next(err); }
    }

    /**
     * PUT /profissionais/:id
     * Atualiza os dados de um profissional existente
     */
    async atualizar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            // Monta o objeto apenas com os campos enviados
            const { nome, registroConselho, especialidade, tipo, unidadeId } = req.body;
            const dados = {};
            if (nome) dados.nome = nome;
            if (registroConselho) dados.registroConselho = registroConselho;
            if (especialidade) dados.especialidade = especialidade;
            if (tipo) dados.tipo = tipo;
            if (unidadeId) dados.unidadeId = unidadeId;

            const profissional = await profissionalService.atualizar(req.params.id, dados);
            return res.status(200).json(profissional);
        } catch (err) { next(err); }
    }

    /**
     * DELETE /profissionais/:id
     * Remove um profissional do sistema
     */
    async remover(req, res, next) {
        try {
            const resultado = await profissionalService.remover(req.params.id);
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    // =============================================
    // Endpoints de gerenciamento da AGENDA
    // =============================================

    /**
     * POST /profissionais/:id/agendas
     * Cria um novo horário na agenda do profissional
     */
    async criarAgenda(req, res, next) {
        try {
            const { diaSemana, horaInicio, horaFim } = req.body;
            const agenda = await profissionalService.criarAgenda(req.params.id, { diaSemana, horaInicio, horaFim });
            return res.status(201).json(agenda);
        } catch (err) { next(err); }
    }

    /**
     * GET /profissionais/:id/agendas
     * Lista os horários de atendimento de um profissional
     */
    async listarAgendas(req, res, next) {
        try {
            const agendas = await profissionalService.listarAgendas(req.params.id);
            return res.status(200).json(agendas);
        } catch (err) { next(err); }
    }

    /**
     * DELETE /profissionais/:id/agendas/:agendaId
     * Remove um horário específico da agenda
     */
    async removerAgenda(req, res, next) {
        try {
            const resultado = await profissionalService.removerAgenda(req.params.id, req.params.agendaId);
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }
}

module.exports = new ProfissionalController();
