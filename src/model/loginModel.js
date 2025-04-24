/**
 * imports
 */
import {z} from 'zod'
import {conn} from '../../server.js';
/**
 * Objeto do usuario para validação dos dados para o reigstro do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const User = z.object({
    "nome": z.string(),
    "senha": z.string(),
    "idade": z.number(),
    "data_nascimento": z.date(),
    "telefone": z.string(),
    "email": z.string(),
    "endereco": z.object({
        "logradouro": z.string(),
        "numero": z.string(),
        "bairro": z.string(),
        "cidade": z.string(),
        "estado": z.string(),
    })
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
 * Objeto do usuario ADM para validação dos dados para login do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const admUser = z.object({
    "nome": z.string(),
    "senha": z.string(),
    "cpf": z.string()
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
                
            let result = validaInfos(data, User);
            if(result = 1){
                let sql = "INSERT INTO usuarios(nome, idade, data_nascimento, telefone, email, endereco, senha) VALUES (?, ?, ?, ?, ?, ?, ?);"
                conn.connect();
                conn.query(sql, [data.nome, data.idade, data.data_nascimento, data.telefone, data.email, JSON.stringify(data.endereco), data.senha], (err, res) => {
                    if(err){
                        if(err.code == "ER_DUP_ENTRY"){
                            reject({
                                msg: "Um usuario com este e-mail já existe!",
                                code: 401
                            });
                        };
                        reject({
                            msg: "Ocorreu um erro no registro do usuario.",
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
 * Função que retorna uma promisse para login do usuario e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario para login, é esperado um objeto.
 */
export async function logar(user){
    return await new Promise(async (resolve, reject) => {
        try {
            let result = validaInfos(user, loginUser)
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
            let result = validaInfos(user, admUser)
            if(result){
                let sql = "SELECT a.nome, a.CPF FROM administradores a WHERE a.nome = ? && a.senha = ?";
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
 * Função que realiza a validação dos dados do usuario para registro.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario para registro, é esperado um objeto para parse com o Objeto de validação User
 */
export function validaInfos(user, validador){
    try{
        const result = validador.parse(user)
        if(result){
            return 1
        } else {
            return 0;
        }
    }catch(err){
        return {
            msg: 'Um erro ocorreu na validação dos dados',
            code: 401
        };
    }
}