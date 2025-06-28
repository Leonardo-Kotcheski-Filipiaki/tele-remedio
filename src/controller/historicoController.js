import HistoricoPedidos from '../model/HistoricoPedidos.js';

const historicoModel = new HistoricoPedidos();

export default class HistoricoController {
    /**
     * Registra uma alteração no histórico
     */
    static async registrarAlteracao(req, res) {
        try {
            const { pedido_id, usuario_id, status_anterior, status_novo, alterado_por } = req.body;
            
            if (!pedido_id || !usuario_id || !status_anterior || !status_novo) {
                return res.status(400).json({
                    code: 400,
                    msg: 'Dados incompletos para registro no histórico'
                });
            }

            const resultado = await historicoModel.registrarAlteracao({
                pedido_id,
                usuario_id,
                status_anterior,
                status_novo,
                alterado_por_admin_id: alterado_por?.tipo === 'admin' ? alterado_por.id : null,
                alterado_por_user_id: alterado_por?.tipo === 'user' ? alterado_por.id : null
            });

            res.status(resultado.code).json(resultado);

        } catch (error) {
            console.error('Erro no controller (registrarAlteracao):', error);
            res.status(500).json({
                code: 500,
                msg: 'Erro interno ao registrar histórico',
                error: error.message
            });
        }
    }

    /**
     * Obtém o histórico de um pedido
     */
    static async listarPorPedido(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    code: 400,
                    msg: 'ID do pedido não fornecido'
                });
            }

            const resultado = await historicoModel.listarHistorico(id);
            res.status(resultado.code).json(resultado);

        } catch (error) {
            console.error('Erro no controller (listarPorPedido):', error);
            res.status(500).json({
                code: 500,
                msg: 'Erro interno ao consultar histórico',
                error: error.message
            });
        }
    }

    /**
     * Obtém todas as alterações feitas por um usuário/admin
     */
    static async listarPorResponsavel(req, res) {
        try {
            const { id, tipo } = req.params;
            
            if (!id || !tipo || !['admin', 'user'].includes(tipo)) {
                return res.status(400).json({
                    code: 400,
                    msg: 'Parâmetros inválidos'
                });
            }

            const resultado = await historicoModel.listarPorResponsavel(id, tipo);
            res.status(resultado.code).json(resultado);

        } catch (error) {
            console.error('Erro no controller (listarPorResponsavel):', error);
            res.status(500).json({
                code: 500,
                msg: 'Erro interno ao consultar histórico',
                error: error.message
            });
        }
    }
}