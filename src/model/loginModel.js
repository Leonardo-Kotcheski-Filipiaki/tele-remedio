/**
 * imports
 */
import {object, z} from 'zod';
import {conn} from '../../server.js';
import cpfValidator from '../../assets/helpers/cpfValidator.js';
/**
 * Objeto do usuario para validação dos dados para o reigstro do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const User = z.object({
    "nome": z.string(),
    "senha": z.string(),
    "cpf": z.string(),
    "idade": z.number(),
    "data_nascimento": z.string(),
    "telefone": z.string(),
    "email": z.string(),
    "endereco": z.object({
        "logradouro": z.string(),
        "numero": z.string(),
        "bairro": z.string(),
        "cidade": z.string(),
        "estado": z.string(),
    }),
    "criado_por": z.number() 
});

/**
 * Objeto do usuario para validação dos dados para login do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const loginUser = z.object({
    "nome": z.string(),
    "senha": z.string()
});

/**
 * Objeto do usuario ADM para validação dos dados para login/registro do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const admUser = z.object({
    "nome": z.string(),
    "senha": z.string(),
    "cpf": z.string()
});

const admUserRegistro = z.object({
    "nome": z.string(),
    "senha": z.string(),
    "cpf": z.string(),
    "email": z.string(),
    "criado_por": z.number()
});

/**
 * Função que retorna uma promisse para registro do usuario e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuario para registro, é esperado um objeto.
 */
export async function registrarUsuario(data){
    return await new Promise(async (resolve, reject) => {
        try{
            if(data === undefined || data.length < 1 || data === null){
                resolve({
                    msg: "Não foram recebidas informações suficiêntes para registro",
                    code: 401 
                })
            }
                
            let result = 0;
            await validaInfos(data, User).then(res => {
                result = res;
            }).catch(rej => {
                result = rej
            });
            if(result = 1){
                let sql = "INSERT INTO usuarios(nome, senha, cpf, idade, data_nascimento, telefone, email, endereco, administradores_idadministradores) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
                conn.connect();
                conn.query(sql, [data.nome, data.senha, data.cpf, data.idade, data.data_nascimento, data.telefone, data.email, JSON.stringify(data.endereco), data.criado_por], (err, res) => {
                    if(err){
                        if(err.code == "ER_DUP_ENTRY"){
                            if(err.message.includes('CPF')){
                                reject({
                                    msg: "Um usuário com este CPF já existe!",
                                    code: 401
                                });
                            } else if(err.message.includes('nome')){
                                reject({
                                    msg: "Um usuário com este nome já existe!",
                                    code: 401
                                });
                            } else if(err.message.includes('email')){
                                reject({
                                    msg: "Um usuário com este e-mail já existe!",
                                    code: 401
                                });
                            } else if(err.message.includes('telefone')){
                                reject({
                                    msg: "Um usuário com este telefone já existe!",
                                    code: 401
                                });
                            } else {
                                reject({
                                    msg: "Um usuário já existe com as informações passadas!",
                                    code: 401
                                });
                            }
                        };
                        reject({
                            msg: `Ocorreu um erro no registro do usuario. ${err}`,
                            code: 401
                        });
                    } else if (res.affectedRows == 1){
                        resolve({
                            msg: "Usuario criado",
                            code: 200
                        });
                    } else {
                        reject({
                            msg: "Usuario não criado",
                            code: 401
                        });
                    };
                });

                setTimeout(() => {
                    reject({
                        msg:'Tempo expirado, tente de novo!',
                        code: 401
                    });
                }, 20000);
            }
        }catch(err){
            reject({
                msg: `Ocorreu um erro ${err}`,
                code: 401
            });
        };
            
    })
       
}

/**
 * Função que retorna uma promisse para registro do usuário administrador e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} data Dados do usuário para registro de administrador, é esperado um objeto.
 */
export async function registrarAdministrador(data){
    return await new Promise(async (resolve, reject) => {
        try{
            if(data === undefined || data.length < 1 || data === null){
                resolve({
                    msg: "Não foram recebidas informações suficiêntes para registro",
                    code: 401 
                })
            }
            let result = 0;
            await validaInfos(data, admUserRegistro).then(res => {
                result = res;
            }).catch(rej => {
                result = rej
            });

            if(result == 1){
                let sql = "INSERT INTO administradores(nome, senha, cpf, email, criado_por) VALUES (?, ?, ?, ?, ?);"
                conn.connect();
                conn.query(sql, [data.nome, data.senha, data.cpf, data.email, data.criado_por], (err, res) => {
                    if(err){
                        if(err.code == "ER_DUP_ENTRY"){
                            if(err.message.includes('CPF')){
                                reject({
                                    msg: "Um usuário com este CPF já existe!",
                                    code: 401
                                });
                            } else if(err.message.includes('nome')){
                                reject({
                                    msg: "Um usuário com este nome já existe!",
                                    code: 401
                                });
                            } else if(err.message.includes('email')){
                                reject({
                                    msg: "Um usuário com este e-mail já existe!",
                                    code: 401
                                });
                            } else {
                                reject({
                                    msg: "Um usuário já existe com as informações passadas!",
                                    code: 401
                                });
                            }
                        };
                        reject({
                            msg: "Ocorreu um erro no registro do usuário.",
                            code: 401
                        });
                    } else if (res.affectedRows == 1){
                        resolve({
                            msg: "Usuário criado",
                            code: 200
                        });
                    } else {
                        reject({
                            msg: "Usuário não criado",
                            code: 401
                        });
                    };
                });

                setTimeout(() => {
                    reject({
                        msg:'Tempo expirado, tente de novo!',
                        code: 401
                    });
                }, 20000);

            } else if (result == 24){
                reject({
                    msg: "CPF inválido",
                    code: 401
                })
            } else {
                reject({
                    msg: "Ocorreu um erro no registro do usuário",
                    code: 401
                })
            }
        }catch(err){
            reject({
                msg: `Ocorreu um erro ${err}`,
                code: 401
            });
        };
            
    })
       
}
/**
 * Função que retorna uma promisse para login do usuario e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario para login, é esperado um objeto.
 */
export async function logar(user){
    return await new Promise(async (resolve, reject) => {
        try {
            let result = 0;
            await validaInfos(user, loginUser).then(res => {
                result = res;
            }).catch(rej => {
                result = rej
            });
            if(result){
                let sql = "SELECT u.nome, u.idade, u.email FROM usuarios u WHERE u.nome = ? && u.senha = ?";
                conn.connect();
                conn.query(sql, [user.nome, user.senha], (err, res) => {
                    if(err){
                        reject({
                            msg: "Ocorreu um erro no retorno do usuario.",
                            code: 401
                        });
                    } else if (res.length == 1){;
                        resolve({
                            user: res[0]
                        });
                    } else {;
                        reject({
                            msg: "Não foi encontrado um usuario com as credenciais passadas",
                            code: 401
                        })
                    }
                })
    
                setTimeout(() => {
                    reject({
                        msg: "Ocorreu um erro no retorno dos dados do usuario",
                        code: 401
                    });
                }, 10000)
                    
            } else {
                resolve({
                        msg: 'Um erro ocorreu na validação dos dados',
                        code: 401
                })
            }
        } catch (error) {
            resolve({
                msg: 'Um erro ocorreu na validação dos dados',
                code: 401
            })
        }
    })
}


/**
 * Função que retorna uma promisse para login do usuario administrador e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario administrador para login, é esperado um objeto.
 */
export async function logarAdm(user){
    return await new Promise(async (resolve, reject) => {
        try {
            let result = 0;
            await validaInfos(user, admUser).then(res => {
                result = res;
            }).catch(rej => {
                result = rej
            });
            
            if(result == 1){
                let sql = "SELECT a.idadministradores, a.nome, a.CPF, a.email FROM administradores a WHERE a.nome = ? && a.senha = ? && a.cpf = ?";
                conn.connect();
                conn.query(sql, [user.nome, user.senha, user.cpf], (err, res) => {
                    if(err){
                        reject({
                            msg: "Ocorreu um erro no retorno do usuario.",
                            code: 401
                        });
                    } else if (res.length == 1){;
                        resolve({
                            user: res[0]
                        });
                    } else {
                        reject({
                            msg: "Não foi encontrado um usuario com as credenciais passadas",
                            code: 401
                        })
                    }
                })
    
                setTimeout(() => {
                    reject({
                        msg: "Ocorreu um erro no retorno dos dados do usuario",
                        code: 401
                    });
                }, 10000)
                    
            } else if(result == 24){
                resolve({
                    msg: 'O CPF inserido é inválido!',
                    code: 401
                })
            } else {
                resolve({
                    msg: 'Um erro ocorreu na validação dos dados',
                    code: 401
                })
            }
        } catch (error) {
            resolve({
                msg: `Um erro ocorreu na validação dos dados ${error}`,
                code: 401
            })
        }
    })
}

/**
 * Função que realiza a validação dos dados do usuario para registro.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario para registro, é esperado um objeto para parse com o Objeto de validação User
 */
export async function validaInfos(user, validador){
    try{
        let result = validador.parse(user);
        if(result){
            user.data_nascimento = new Date(user.data_nascimento);
            if(Object.keys(user).includes('cpf')){
                user.cpf = user.cpf.replaceAll('.', '').replaceAll('-', '');
                await cpfValidator(user.cpf).then(res => {
                    result = res;
                }).catch(rej => {
                    result = rej
                });

                if(result == true){
                    return 1;
                } else {
                    return 24;
                }
            }
            return 1
        } else {
            return 0;
        }
    }catch(err){
        return {
            msg: `Um erro ocorreu na validação dos dados ${err}`,
            code: 401
        };
    }
}