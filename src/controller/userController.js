/**
 * Imports
 */
import {registrarAdministrador, logarAdm, registrarUsuario, logar, alterarStatusUsuarios} from "../model/usuariosModel.js";

/**
 * Função no controller para realizar chamada dp model para
 * registro do usuário.
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
 * Função no controller para realizar chamada do model para registro
 * do administrador
 * * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do administrador para registro, é esperado um objeto.
 */
export async function registrarAdministradorCon(data){
    let result;
    await registrarAdministrador(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    
    return result;
}

/**
 * Função no controller para realizar a chamada do model para login do usuário
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

/**
 * Função no controller para realizar a chamada do model para login de administrador
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuario para login, é esperado um objeto.
 */
export async function realizarLoginAdm(data){
    let result;
    await logarAdm(data).then(res => {
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

/**
 * Função no controller para realizar a chamada do model para alterar o status
 * do usuário/adm (ativar ou desativar usuário)
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuário/adm, é esperado um objeto.
 */
export async function alterarStatusCon(data){
    let result;
    await alterarStatusUsuarios(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    });

    return result;
}
