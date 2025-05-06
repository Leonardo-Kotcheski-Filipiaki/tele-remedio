/**
 * Imports
 */
import { registrarItem, listarItem, listagem } from "../model/estoqueModel.js";

/**
 * Função no controller para registro do item no estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} item Dados do item para registro, é esperado um objeto.
 */
export async function registrarItemCon(item){
    let result;
    await registrarItem(item).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

/**
 * Função que retorna itens da tabela estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {number} valor Padrão 0 retorna dados listar = 1, valor 1 retornar todos os dados do banco
 * @returns JSON com os dados do banco
 */
export async function listarItemCon(valor = 0){
    let result;
    await listarItem(valor).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    return result;
}

/**
 * Função para alterar a listagem de um item
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {number} valor Se 0 para de listar, se 1 lista normalmente
 * @returns Mensagem de respota
 */
export async function alterarListagem(item){
    
    let result;
    await listagem(item).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    return result;
}