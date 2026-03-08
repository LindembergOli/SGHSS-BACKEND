/**
 * Controller do módulo de Consultas
 * 
 * Recebe as requisições HTTP relacionadas a consultas médicas,
 * valida os dados e chama o service correspondente.
 */

const { validationResult } = require('express-validator');
const consultaService = require('./consulta.service');

class ConsultaController {
    /**
     * POST /consultas
     * Agenda uma nova consulta entre paciente e profissional
     */
    async agendar(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: errors.array() });

            const { pacienteId, profissionalId, dataHora, tipo, observacoes } = req.body;
            const consulta = await consultaService.agendar({ pacienteId, profissionalId, dataHora, tipo, observacoes });
            return res.status(201).json(consulta);
        } catch (err) { next(err); }
    }

    /**
     * GET /consultas
     * Lista consultas com filtros opcionais por paciente, profissional, status e tipo
     */
    async listar(req, res, next) {
        try {
            const { pagina, limite, pacienteId, profissionalId, status, tipo } = req.query;
            const resultado = await consultaService.listar({
                pagina: parseInt(pagina) || 1, limite: parseInt(limite) || 10,
                pacienteId, profissionalId, status, tipo,
            });
            return res.status(200).json(resultado);
        } catch (err) { next(err); }
    }

    /**
     * GET /consultas/:id
     * Busca uma consulta por ID com prontuário, exames e prescrições
     */
    async buscarPorId(req, res, next) {
        try {
            const consulta = await consultaService.buscarPorId(req.params.id);
            return res.status(200).json(consulta);
        } catch (err) { next(err); }
    }

    /**
     * PATCH /consultas/:id/cancelar
     * Cancela uma consulta agendada
     */
    async cancelar(req, res, next) {
        try {
            const consulta = await consultaService.cancelar(req.params.id);
            return res.status(200).json(consulta);
        } catch (err) { next(err); }
    }

    /**
     * PATCH /consultas/:id/realizar
     * Marca uma consulta como realizada
     */
    async realizar(req, res, next) {
        try {
            const consulta = await consultaService.realizar(req.params.id);
            return res.status(200).json(consulta);
        } catch (err) { next(err); }
    }
}

module.exports = new ConsultaController();
