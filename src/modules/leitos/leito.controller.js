/**
 * Controller do módulo de Leitos
 */

const { validationResult } = require('express-validator');
const leitoService = require('./leito.service');

class LeitoController {
    /** POST /leitos — Cadastra novo leito */
    async criar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { unidadeId, numero, tipo } = req.body;
            const leito = await leitoService.criar({ unidadeId, numero, tipo });
            return res.status(201).json(leito);
        } catch (err) { next(err); }
    }

    /** GET /leitos — Lista leitos com filtros */
    async listar(req, res, next) {
        try {
            const { pagina, limite, unidadeId, status, tipo } = req.query;
            const resultado = await leitoService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10, unidadeId, status, tipo,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** GET /leitos/:id — Busca por ID */
    async buscarPorId(req, res, next) {
        try {
            const leito = await leitoService.buscarPorId(req.params.id);
            return res.status(200).json(leito);
        } catch (err) { next(err); }
    }

    /** PATCH /leitos/:id/status — Atualiza status */
    async atualizarStatus(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const leito = await leitoService.atualizarStatus(req.params.id, req.body.status);
            return res.status(200).json(leito);
        } catch (err) { next(err); }
    }

    /** DELETE /leitos/:id — Remove leito */
    async remover(req, res, next) {
        try {
            const resultado = await leitoService.remover(req.params.id);
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }
}

module.exports = new LeitoController();
