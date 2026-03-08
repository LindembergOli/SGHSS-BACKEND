/**
 * Controller do módulo de Internações
 */

const { validationResult } = require('express-validator');
const internacaoService = require('./internacao.service');

class InternacaoController {
    /** POST /internacoes — Registra nova internação */
    async internar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { pacienteId, leitoId, profissionalId, motivo, diagnostico, observacoes } = req.body;
            const internacao = await internacaoService.internar({ pacienteId, leitoId, profissionalId, motivo, diagnostico, observacoes });
            return res.status(201).json(internacao);
        } catch (err) { next(err); }
    }

    /** PATCH /internacoes/:id/alta — Registra alta médica */
    async darAlta(req, res, next) {
        try {
            const { diagnostico, observacoes } = req.body || {};
            const internacao = await internacaoService.darAlta(req.params.id, { diagnostico, observacoes });
            return res.status(200).json(internacao);
        } catch (err) { next(err); }
    }

    /** GET /internacoes — Lista internações */
    async listar(req, res, next) {
        try {
            const { pagina, limite, status, pacienteId } = req.query;
            const resultado = await internacaoService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10, status, pacienteId,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /** GET /internacoes/:id — Busca por ID */
    async buscarPorId(req, res, next) {
        try {
            const internacao = await internacaoService.buscarPorId(req.params.id);
            return res.status(200).json(internacao);
        } catch (err) { next(err); }
    }
}

module.exports = new InternacaoController();
