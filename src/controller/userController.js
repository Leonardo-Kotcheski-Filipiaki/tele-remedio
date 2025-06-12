/**
 * Imports
 */
import Usuarios from "../model/Usuarios.js";

/**
 * Função no controller para realizar chamada dp model para
 * registro do usuário.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuario para registro, é esperado um objeto.
 */
export async function registrarUsuarioCon(data){
    const u = new Usuarios(data);
    let result;
    await u.registrarUsuario(data).then(res => {
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
    const u = new Usuarios(data);
    let result;
    await u.registrarAdministrador(data).then(res => {
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
    const u = new Usuarios(data);
    let result;
    await u.logar(data).then(res => {
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
    const u = new Usuarios(data);
    let result;
    await u.logarAdm(data).then(res => {
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
    const u = new Usuarios(data);
    let result;
    await u.alterarStatusUsuarios(data).then(res => {
        result = res;
    }).catch(err => {
        result = err
    });

    return result;
}

/**
 * Função no controller para realizar a chamada do model para listar os usuários
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
export async function listarUsuariosCon(tipo = 0){
    const u = new Usuarios();
    let result;
    await u.listarUsuarios(tipo).then(res => {
        result = res;
    }).catch(err => {
        result = err
    })
    return result;
}