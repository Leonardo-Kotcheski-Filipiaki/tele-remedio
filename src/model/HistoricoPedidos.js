import { conn } from '../../server.js';

export default class HistoricoPedidos {
    /**
     * Registra uma alteração no histórico de pedidos
     * @param {Object} data - Dados da alteração
     * @param {number} data.pedido_id - ID do pedido
     * @param {number} data.usuario_id - ID do usuário
     * @param {string} data.status_anterior - Status anterior
     * @param {string} data.status_novo - Novo status
     * @param {number|null} data.alterado_por_admin_id - ID do admin que alterou
     * @param {number|null} data.alterado_por_user_id - ID do usuário que alterou
     */
    async registrarAlteracao(data) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO historico_pedidos (
                    pedido_id, 
                    usuario_id, 
                    status_anterior, 
                    status_novo,
                    alterado_por_admin_id,
                    alterado_por_user_id
                ) VALUES (?, ?, ?, ?, ?, ?)`;
            
            conn.query(query, [
                data.pedido_id,
                data.usuario_id,
                data.status_anterior,
                data.status_novo,
                data.alterado_por_admin_id || null,
                data.alterado_por_user_id || null
            ], (err, result) => {
                if (err) {
                    console.error('Erro ao registrar histórico:', err);
                    reject({
                        msg: 'Falha ao registrar no histórico',
                        code: 500,
                        error: err.message
                    });
                } else {
                    resolve({
                        msg: 'Alteração registrada no histórico',
                        code: 200,
                        registro_id: result.insertId
                    });
                }
            });
        });
    }

    /**
     * Lista todo o histórico de um pedido
     * @param {number} pedido_id - ID do pedido
     */
        async listarHistorico(pedido_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    hp.*,
                    COALESCE(a.nome, u.nome) as responsavel,
                    DATE_FORMAT(hp.data_alteracao, '%d/%m/%Y %H:%i:%s') as data_formatada
                FROM historico_pedidos hp
                LEFT JOIN administradores a ON hp.alterado_por_admin_id = a.idadministradores
                LEFT JOIN usuarios u ON hp.alterado_por_user_id = u.user_id
                WHERE hp.pedido_id = ?
                ORDER BY hp.data_alteracao DESC`;
            
            conn.query(query, [pedido_id], (err, results) => {
                if (err) {
                    console.error('Erro no SQL:', err);
                    reject({
                        code: 500,
                        msg: 'Erro ao consultar histórico no banco de dados',
                        error: err.message
                    });
                } else if (results.length === 0) {
                    resolve({
                        code: 404,
                        msg: 'Nenhum registro de histórico encontrado para este pedido',
                        content: []
                    });
                } else {
                    resolve({
                        code: 200,
                        msg: 'Histórico recuperado com sucesso',
                        content: results
                    });
                }
            });
        });
    }
    /**
     * Lista todas as alterações feitas por um usuário/admin
     * @param {number} usuario_id - ID do usuário/admin
     * @param {string} tipo - 'admin' ou 'user'
     */
    async listarPorResponsavel(usuario_id, tipo = 'admin') {
        return new Promise((resolve, reject) => {
            const campo = tipo === 'admin' 
                ? 'alterado_por_admin_id' 
                : 'alterado_por_user_id';
            
            const query = `
                SELECT * FROM historico_pedidos
                WHERE ${campo} = ?
                ORDER BY data_alteracao DESC`;
            
            conn.query(query, [usuario_id], (err, results) => {
                if (err) {
                    reject({
                        msg: `Erro ao buscar histórico do ${tipo}`,
                        code: 500
                    });
                } else {
                    resolve({
                        content: results,
                        code: 200
                    });
                }
            });
        });
    }
}