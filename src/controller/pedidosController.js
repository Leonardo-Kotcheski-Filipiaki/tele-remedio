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
