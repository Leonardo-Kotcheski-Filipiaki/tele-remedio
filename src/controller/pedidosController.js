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
    const e = new Pedidos();
    let result;
    await e.registrarPedido(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

export async function modificarStatus(status, id){
    const e = new Pedidos();
    const statusPossives = ["em andamento", "concluído", "sem sucesso", "cancelado"];
    let result;
    if(statusPossives.includes(status.toLowerCase())){
        await e.validarPedido(status, id).then(async res => {
            if(Object.keys(res).includes('msg')){
                result = res;
            }
            if(res == true){
                await e.alterarStatus(status, id).then(res => {
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