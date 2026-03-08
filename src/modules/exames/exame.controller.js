/**
 * Controller do módulo de Exames
 * 
 * Recebe as requisições HTTP de exames médicos,
 * valida os dados e chama o service correspondente.
 */

const { validationResult } = require('express-validator');
const exameService = require('./exame.service');

class ExameController {
    /**
     * POST /exames
     * Solicita um novo exame vinculado a uma consulta
     */
    async solicitar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const exame = await exameService.solicitar(req.body);
            return res.status(201).json(exame);
        } catch (err) { next(err); }
    }

    /**
     * GET /exames
     * Lista exames com filtros opcionais por consulta e status
     */
    async listar(req, res, next) {
        try {
            const resultado = await exameService.listar({
                pagina: parseInt(req.query.pagina) || 1, limite: parseInt(req.query.limite) || 10,
                consultaId: req.query.consultaId, status: req.query.status,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /**
     * GET /exames/:id
     * Busca um exame por ID com dados da consulta e paciente
     */
    async buscarPorId(req, res, next) {
        try {
            const exame = await exameService.buscarPorId(req.params.id);
            return res.status(200).json(exame);
        } catch (err) { next(err); }
    }

    /**
     * PATCH /exames/:id/resultado
     * Registra o resultado de um exame (laudo)
     */
    async registrarResultado(req, res, next) {
        try {
            const exame = await exameService.registrarResultado(req.params.id, req.body);
            return res.status(200).json(exame);
        } catch (err) { next(err); }
    }
}

module.exports = new ExameController();
