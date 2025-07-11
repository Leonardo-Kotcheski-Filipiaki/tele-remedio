/**
 * imports
 */
import {z} from 'zod';
import {conn} from '../../server.js';
import cpfValidator from '../../assets/utils/cpfValidator.js';

export default class Usuarios {
    constructor() {}

    /**
     * Objeto do usuario para validação dos dados para o reigstro do usuario
     * @author Leonardo Kotches Filipiaki devleonardokofi
     */
    User = z.object({
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
    loginUser = z.object({
        "nome": z.string(),
        "senha": z.string()
    });

    /**
     * Objeto do usuario ADM para validação dos dados para login/registro do usuario
     * @author Leonardo Kotches Filipiaki devleonardokofi
     */
    admUser = z.object({
        "nome": z.string(),
        "senha": z.string(),
        "cpf": z.string()
    });

    admUserRegistro = z.object({
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
    async registrarUsuario(data){
        return await new Promise(async (resolve, reject) => {
            try{
                if(data === undefined || data.length < 1 || data === null){
                    resolve({
                        msg: "Não foram recebidas informações suficiêntes para registro",
                        code: 401 
                    })
                }
                    
                let result = 0;
                await this.validaInfos(data, this.User).then(res => {
                    result = res;
                }).catch(rej => {
                    result = rej
                });
                if(result = 1){
                    let sql = "INSERT INTO usuarios(nome, senha, cpf, idade, data_nascimento, telefone, email, endereco, status, ultimo_alterado_por, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                    conn.connect();
                    conn.query(sql, [data.nome, data.senha, data.cpf, data.idade, data.data_nascimento, data.telefone, data.email, JSON.stringify(data.endereco), 1, data.ultimo_alterado_por, data.criado_por], (err, res) => {
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
                                };
                            };
                            reject({
                                msg: `Ocorreu um erro no registro do usuario. ${err}`,
                                code: 401
                            });
                        } else if (res.affectedRows == 1){
                            resolve({
                                msg: "Usuario criado",
                                code: 201
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
                };
            }catch(err){
                reject({
                    msg: `Ocorreu um erro ${err}`,
                    code: 401
                });
            };
                
        });
        
    };

    /**
     * Função que retorna uma promisse para registro do usuário administrador e conexão com o banco de dados.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} data Dados do usuário para registro de administrador, é esperado um objeto.
     */
    async registrarAdministrador(data){
        return await new Promise(async (resolve, reject) => {
            try{
                if(data === undefined || data.length < 1 || data === null){
                    resolve({
                        msg: "Não foram recebidas informações suficiêntes para registro",
                        code: 401
                    });
                };
                let result = 0;
                await this.validaInfos(data, this.admUserRegistro).then(res => {
                    result = res;
                }).catch(rej => {
                    result = rej
                });

                if(result == 1){
                    let sql = "INSERT INTO administradores(nome, senha, cpf, email, ultimo_alterado_por, criado_por) VALUES (?, ?, ?, ?, ?, ?);"
                    conn.connect();
                    conn.query(sql, [data.nome, data.senha, data.cpf, data.email, data.ultimo_alterado_por, data.criado_por], (err, res) => {
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
                                code: 201
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
     * Função que retorna uma promisse para login do usuário e conexão com o banco de dados.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} user Dados do usuário para login, é esperado um objeto.
     */
    async logar(user){
        return await new Promise(async (resolve, reject) => {
            try {
                let result = 0;
                await this.validaInfos(user, this.loginUser).then(res => {
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
                                msg: "Ocorreu um erro no retorno do usuário.",
                                code: 401
                            });
                        } else if (res.length == 1){;
                            resolve({
                                user: res[0]
                            });
                        } else {;
                            reject({
                                msg: "Não foi encontrado um usuário com as credenciais passadas",
                                code: 401
                            })
                        }
                    })
        
                    setTimeout(() => {
                        reject({
                            msg: "Ocorreu um erro no retorno dos dados do usuário",
                            code: 401
                        });
                    }, 10000)
                        
                } else {
                    reject({
                            msg: 'Um erro ocorreu na validação dos dados',
                            code: 401
                    })
                }
            } catch (error) {
                reject({
                    msg: 'Um erro ocorreu na validação dos dados',
                    code: 401
                })
            }
        })
    }


    /**
     * Função que retorna uma promisse para login do usuário administrador e conexão com o banco de dados.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} user Dados do usuário administrador para login, é esperado um objeto.
     */
    async logarAdm(user){
        return await new Promise(async (resolve, reject) => {
            try {
                let result = 0;
                await this.validaInfos(user, this.admUser).then(res => {
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
                                msg: "Ocorreu um erro no retorno do usuário.",
                                code: 401
                            });
                        } else if (res.length == 1){
                            
                            resolve({
                                user: res[0]
                            });
                        } else {
                            reject({
                                msg: "Não foi encontrado um usuário com as credenciais passadas",
                                code: 401
                            })
                        }
                    })
        
                    setTimeout(() => {
                        reject({
                            msg: "Ocorreu um erro no retorno dos dados do usuário",
                            code: 401
                        });
                    }, 10000)
                        
                } else if(result == 24){
                    reject({
                        msg: 'O CPF inserido é inválido!',
                        code: 401
                    })
                } else {
                    reject({
                        msg: 'Um erro ocorreu na validação dos dados',
                        code: 401
                    })
                }
            } catch (error) {
                reject({
                    msg: `Um erro ocorreu na validação dos dados ${error}`,
                    code: 401
                })
            }
        })
    }
    /**
     * Função para alterar o status do usuário
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} data É espero o id do usuário a ser alterado e o valor, se 0 para desativar ou 1 para ativar
     */
    async alterarStatusUsuarios(data){
        return await new Promise(async (resolve, reject) => {
            try {
                if(!data){
                    reject({
                        msg: "Não foram recebidos dados para realizar a solicitação",
                        code: 500
                    });
                }
                let keysData = Object.keys(data);
                if(keysData.includes('status') && keysData.includes('user_id') && keysData.includes('tipo') && keysData.includes('realizador_id')) {
                    if((data.tipo.toLowerCase() != 'administradores') && (data.tipo.toLowerCase() != "usuarios")){
                        reject({
                            msg: "A informação de tipo deve ser 'administradores' (Minusculo) ou 'usuarios' (Minusculo)",
                            code: 401
                        });
                    }
                    let query = `UPDATE ${data.tipo.toLowerCase()} SET status = ?,  ultimo_alterado_por = ? WHERE ${data.tipo == 'administradores' ? 'idadministradores' : 'user_id'} = ?`;
                    conn.connect();
                    conn.query(query, [parseInt(data.status), parseInt(data.realizador_id), parseInt(data.user_id)], (err, res) => {
                        if(err){
                            reject({
                                msg: `Ocorreu um erro durante a alteração dos dados ${err}`,
                                code: 401
                            });
                        }else if(res.info.includes('Changed: 0')){
                            resolve({
                                msg: `Status não alterado pois o usuário já está no estado que quer determinar`,
                                code: 200
                            });
                        }else if(res.affectedRows == 1){
                            resolve({
                                msg: `Status alterado para "${data.status == 1 ? 'Ativo' : 'Desativado'}"!`,
                                code: 200
                            });
                        };
                    })
                } else {
                    reject({
                        msg: `Está faltando dados para realizar a solicitação, segue o que já se possui: ${keysData}`,
                        code: 401
                    });
                }

            } catch (error) {
                resolve({
                    msg: `Um erro ocorreu durante a alteração dos dados ${error}`,
                    code: 401
                })
            }
        })
    }

    /**
     * Função para retornar todos os usuários
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @returns {[object]Array}
     */
    async listarUsuarios(tipo){
        return new Promise((resolve, reject) => {
            try {
                let query = 0;
                //Se 0 lista usuários, se 1 lista administradores
                if(tipo == 0){
                    query = `SELECT (u.user_id) AS cod, u.nome, u.cpf, u.idade, u.telefone, u.data_nascimento, u.email, u.endereco, u.status, u.criado_por FROM usuarios u`;
                } else if(tipo == 1){
                    query = `SELECT (ad.idadministradores) AS cod, ad.nome, ad.cpf, ad.email, ad.status, ad.criado_por FROM administradores ad;`
                }
                conn.connect();
                conn.query(query, (err, res) => {
                    if(err){
                        reject({
                            msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                            code: 500
                        });
                    } else {
                        if(res.length < 1){
                            reject({
                                msg: `Não foram encontrados dados!`,
                                code: 404
                            });
                        } else {
                            resolve({
                                code: 202,
                                content: res
                            });
                        }
                    } 
                })
            } catch (error) {
                reject({
                    msg: `Um erro ocorreu na listagem dos dados ${JSON.stringify(error)}`,
                    code: 401
                })
            }
        })
    }

    /**
     * Função que realiza a validação dos dados do usuário para registro.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} user Dados do usuário para registro, é esperado um objeto para comparação com o Objeto de validação respectivo ao tipo de usuário.
     * @param {object} validador Objeto para comparação com os dados recebidos.
     */
    async validaInfos(user, validador){
        try{
            let result = validador.parse(user);
            if(result){
                user.data_nascimento = new Date(user.data_nascimento);
                user.cpf = user.cpf.replaceAll('.', '').replaceAll('-', '');
                if(Object.keys(user).includes('cpf') && user.nome != 'ADM DEFAULT'){
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

    /**
     * Função que realiza a validação de usuarios adm
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} id_adm id de identificação de administrador
     */
    async validaAdministradores(id_adm){
        return new Promise(async (resolve, reject) => {
            try{
                conn.connect();
                conn.query('SELECT a.nome FROM administradores a WHERE a.idadministradores = ? AND a.status = 1', [id_adm], (err, res) => {
                    if(err){
                        reject({
                            msg: `Ocorreu um erro na validação do administrador responsável. ${err}`,
                            code: 401
                        });
                    } else if (res.length == 1){;
                        resolve(200);
                    } else {
                        reject({
                            msg: "Este usuário administrador não foi encontrado ou está desativado.",
                            code: 401
                        })
                    }
                });
            }catch(err){
                return {
                    msg: `Um erro ocorreu na validação dos dados ${err}`,
                    code: 401
                };
            }
        })
    }
}
