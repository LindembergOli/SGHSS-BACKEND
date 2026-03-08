/**
 * Validadores do módulo de Consultas
 * 
 * Define regras de validação para agendamento de consultas,
 * usando express-validator.
 */

const { body, param } = require('express-validator');

// Validação para agendar uma nova consulta
const agendarConsultaValidator = [
    body('pacienteId').isUUID().withMessage('ID do paciente inválido.'),
    body('profissionalId').isUUID().withMessage('ID do profissional inválido.'),
    body('dataHora').isISO8601().withMessage('Data/hora inválida. Use formato ISO 8601.'),
    body('tipo').optional().isIn(['PRESENCIAL', 'ONLINE']).withMessage('Tipo deve ser PRESENCIAL ou ONLINE.'),
    body('observacoes').optional(),
];

// Validação do parâmetro de ID na URL
const idValidator = [param('id').isUUID().withMessage('ID inválido.')];

module.exports = { agendarConsultaValidator, idValidator };
