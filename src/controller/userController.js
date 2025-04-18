/**
 * Imports
 */
import {registrarUsuario, logar} from "../model/loginModel.js";

/**
 * Função no controller para registro do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuario para registro, é esperado um objeto.
 */
export async function registrarUsuarioCon(data){
    let result;
    await registrarUsuario(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

/**
 * Função no controller para realizar o login do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuario para login, é esperado um objeto.
 */
export async function realizarLogin(data){
    let result;
    await logar(data).then(res => {
        if(Object.keys(res).includes('user')){
            result = res.user
        } else {
            return {
                msg: 'Erro no retorno dos dados do usuario',
                code: 401
            }
        }
    }).catch(err => {
        result = err
    })
    
    return result;
}

