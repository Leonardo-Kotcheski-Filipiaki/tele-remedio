/**
 * Imports
 */
import Pedidos from "../model/Pedidos.js";

/**
 * Função no controller para registro do pedido
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do pedido para registro, é esperado um objeto.
 */
export async function registrarReq(data){
    const p = new Pedidos();
    let result;
    await p.registrarPedido(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

export async function listar(dados = null, todos = null){
    const p = new Pedidos();    

    let result;
    
    await p.listarPedido(dados, todos).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    return result;
}

export async function modificarStatus(status, id, alterador, descricao){
    const p = new Pedidos();
    const statusPossives = ["em andamento", "concluído", "sem sucesso", "cancelado"];
    let result;
    if(statusPossives.includes(status.toLowerCase())){
        await p.validarPedido(status, id).then(async res => {
            if(Object.keys(res).includes('msg')){
                result = res;
            }
            if(res == true){
                await p.alterarStatus(status, id, alterador, descricao).then(res => {
                    if(res){
                        result = res;
                    }
                }).catch(err => {
                    result = err;
                })
            }
        }).catch(err => {
            result = err;
        })    
    } else {
        return {
            msg: "Status impossível, favor contatar administração para ajuste!",
            code: 401
        };
    }
    return result;
}