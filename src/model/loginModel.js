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
    }),
    "tipo": z.string()
});

/**
 * Objeto do usuario para validação dos dados para login do usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi
 */
const loginUser = z.object({
    "nome": z.string(),
    "senha": z.string()
})

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
                
            let result = validaInfos(data);
            if(result = 1){
                let sql = "INSERT INTO usuarios(nome, idade, data_nascimento, telefone, email, endereco, tipo, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
                conn.connect()
                conn.query(sql, [data.nome, data.idade, data.data_nascimento, data.telefone, data.email, JSON.stringify(data.endereco), data.tipo, data.senha], (err, res) => {
                    if(err){
                        conn.pause()
                        if(err.code == "ER_DUP_ENTRY"){
                            reject({
                                msg: "Um usuario com este e-mail já existe!",
                                code: 401
                            })
                        }
                        reject({
                            msg: "Ocorreu um erro no registro do usuario.",
                            code: 401
                        });
                    } else if (res.affectedRows == 1){
                        resolve({
                            msg: "Usuario criado",
                            code: 200
                        });
                        conn.pause();
                    } else {
                        reject({
                            msg: "Usuario não criado"
                        })
                    }
                })
            }
        }catch(err){
            console.log(err)
        }
            
    })
       
}
/**
 * Função que retorna uma promisse para registro do usuario e conexão com o banco de dados.
 * @author Leonardo Kotches Filipiaki devleonardokofi
 * @param {Object} user Dados do usuario para registro, é esperado um objeto.
 */
export async function logar(user){
    return await new Promise(async (resolve, reject) => {
        try {
            let result = loginUser.parse(user)
            if(result){
                let sql = "SELECT u.nome, u.idade, u.email FROM usuarios u WHERE nome = ? && senha = ?";
                conn.resume();
                conn.query(sql, [user.nome, user.senha], (err, res) => {
                    if(err){
                        conn.pause()
                        reject({
                            msg: "Ocorreu um erro no retorno do usuario.",
                            code: 401
                        });
                    } else if (res.length == 1){
                        conn.pause();
                        resolve({
                            user: res[0]
                        });
                    } else {
                        conn.pause();
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
export function validaInfos(user){
    try{
        const result = User.parse(user)
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