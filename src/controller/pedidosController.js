/**
 * Imports
 */
import Pedidos from "../model/Pedidos.js";
import HistoricoPedidos from "../model/HistoricoPedidos.js";
import { conn } from "../../server.js";

const historicoModel = new HistoricoPedidos();

/**
 * Função no controller para registro do pedido
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do pedido para registro, é esperado um objeto.
 */
export async function registrarReq(data){
    const e = new Pedidos();
    let result;
    await e.registrarPedido(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

/**
 * Função para modificar status do pedido com histórico
 */
export async function modificarStatus(status, id, userId, alteradoPor) {
    const e = new Pedidos();
    const statusValidos = ["em andamento", "concluído", "cancelado", "sem sucesso"];
    
    try {
        // 1. Validação básica do status
        if (!statusValidos.includes(status.toLowerCase())) {
            return {
                msg: `Status inválido. Use um dos: ${statusValidos.join(", ")}`,
                code: 400
            };
        }

        // 2. Valida a transição
        const validacao = await e.validarPedido(status, id);
        
        if (validacao !== true) {
            return validacao; // Retorna o erro específico da validação
        }

        // 3. Atualiza no banco de dados
        const query = "UPDATE pedidos SET status = ? WHERE pedidos_id = ?";
        await new Promise((resolve, reject) => {
            conn.query(query, [status, id], (err, res) => {
                if (err) reject({
                    msg: "Erro ao atualizar status no banco de dados",
                    code: 500
                });
                else resolve(res);
            });
        });

        // 4. Registra no histórico
        const statusAtual = await e.getStatusAtual(id); // Obtém o novo status atual
        await historicoModel.registrarAlteracao({
            pedido_id: id,
            usuario_id: userId,
            status_anterior: statusAtual,
            status_novo: status,
            alterado_por_admin_id: alteradoPor?.tipo === 'admin' ? alteradoPor.id : null,
            alterado_por_user_id: alteradoPor?.tipo === 'user' ? alteradoPor.id : null
        });

        return {
            msg: `Status alterado com sucesso para ${status}`,
            code: 200,
            pedido_id: id
        };

    } catch (error) {
        console.error("Erro completo:", error);
        return {
            msg: error.msg || "Erro ao processar alteração de status",
            code: error.code || 500,
            detalhes: error.message || error
        };
    }
}

/**
 * Verifica se o usuário tem permissão para ver o histórico
 */
async function verificarPermissaoHistorico(pedido_id, usuario) {
    return new Promise((resolve, reject) => {
        // Se for admin, sempre permite
        if (usuario.tipo === 'admin') {
            return resolve(true);
        }

        // Se for usuário, verifica se é o dono do pedido
        const query = `
            SELECT 1 FROM pedidos 
            WHERE pedidos_id = ? AND usuarios_user_id = ?
            LIMIT 1`;
        
        conn.query(query, [pedido_id, usuario.id], (err, results) => {
            if (err) {
                console.error('Erro ao verificar permissão:', err);
                return reject(false);
            }
            resolve(results.length > 0);
        });
    });
}

/**
 * Lista o histórico de um pedido
 */
export async function listarHistoricoPedido(pedido_id, usuario) {
    try {
        // 1. Validação do ID
        if (!pedido_id || isNaN(pedido_id)) {
            return {
                success: false,
                code: 400,
                msg: 'ID do pedido inválido'
            };
        }

        // 2. Verifica permissão
        const temPermissao = await verificarPermissaoHistorico(pedido_id, usuario);
        if (!temPermissao) {
            return {
                success: false,
                code: 403,
                msg: 'Acesso negado: você não tem permissão para ver este histórico'
            };
        }

        // 3. Consulta o histórico
        const resultado = await historicoModel.listarHistorico(pedido_id);
        
        return {
            success: true,
            code: 200,
            msg: 'Histórico recuperado com sucesso',
            content: resultado.content
        };

    } catch (error) {
        console.error('Erro no controller (listarHistoricoPedido):', error);
        return {
            success: false,
            code: 500,
            msg: 'Erro interno ao consultar histórico',
            error: error.message
        };
    }
}
