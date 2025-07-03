/**
 * imports
 */
import {z} from 'zod';
import {conn} from '../../server.js';


export default class Estoque {
    constructor() {}

    /**
     * Objeto do item para validação dos dados para registro no estoque
     * @author Leonardo Kotches Filipiaki devleonardokofi
     */
    Item = z.object({
        nome_produto: z.string().nonempty(),
        quantidade: z.number(),
        listar: z.number().nonnegative().min(0).max(1),
        criado_por: z.number().nonnegative()
    });

    /**
     * Função para registro de item no estoque
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} item Objeto com as informações para criação do item
     */
    async registrarItem(item){
        return new Promise(async (resolve, reject) => {
            try {
                await this.validaInfos(item).then(res => {
                    if(res){
                        let query = "INSERT INTO estoque (nome_produto, quantidade, listar, criado_por) VALUES (?, ?, ?, ?)";
                        conn.connect();
                        conn.query(query, [item.nome_produto, item.quantidade, item.listar, item.criado_por], (err, res) => {
                            if(err){
                                if(err.code == "ER_DUP_ENTRY"){
                                    reject({
                                        msg: `Este item já existe no estoque!`,
                                        code: 401
                                    });
                                } else {
                                    reject({
                                        msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                                        code: 400
                                    });
                                }
                            } else {
                                resolve({
                                    msg: `Item ${item.nome_produto} registrado com sucesso!`,
                                    code: 200
                                });
                            } 
                        })
                    }
                }).catch(err => {
                    reject(err);
                })
            } catch (error) {
                resolve({
                    msg: `Um erro ocorreu na validação dos dados ${error}`,
                    code: 401
                })
            }
        })
    }

    /**
     * Função para retornar todos os itens
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {number} [listaveis] Valor padrão (0) retorna apenas dados listaveis, valor 1 retorna todos os dados do banco de dados;
     */
    async listarItem(listaveis){
        return new Promise(async (resolve, reject) => {
            try {
                let query = `SELECT (e.item_id) AS cod, (e.nome_produto) as nome, e.quantidade, (e.listar) as listado, e.criado_por FROM estoque e ${listaveis == 0 ? "WHERE listar = 1": ''}`;
                conn.connect();
                conn.query(query, (err, res) => {
                    if(err){
                        reject({
                            msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                            code: 401
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
     * Função para retornar todos os itens
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {number} [id] id do item
     */
    async listarItem(id){
        return new Promise(async (resolve, reject) => {
            try {
                console.log(id)
                let query = `SELECT e.nome_produto FROM estoque e WHERE e.item_id = ${id}`;
                conn.connect();
                conn.query(query, (err, res) => {
                    if(err){
                        reject({
                            msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                            code: 401
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
     * Função para alterar e negar listagem do item!
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} data É esperado o id do item a ser alterado e o valor do "listar"
     * @returns Objeto
     */
    async listagem(data){
        return await new Promise(async (resolve, reject) => {
            try {
                let query = "UPDATE estoque SET listar = ? WHERE item_id = ?";
                conn.connect();
                conn.query(query, [data.valor, parseInt(data.item_id)], (err, res) => {
                    if(err){
                        reject({
                            msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                            code: 401
                        });
                    } else {
                        if(res.info.includes('Changed: 0')){
                            resolve({
                                msg: `Listagem não alterada pois o item já está no estado que quer determinar`,
                                code: 200
                            });
                        }else if(res.affectedRows == 1){
                            resolve({
                                msg: `Listagem alterada para "${data.valor == 1 ? 'Listar' : 'Não listar'}"!`,
                                code: 200
                            });
                        };
                    };
                });
            } catch (error) {
                reject({
                    msg: `Um erro ocorreu durante a alteração dos dados ${JSON.stringify(error)}`,
                    code: 401
                });
            };
        });
    };

    /**
     * Função para alterar a quantidade do item
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} data É esperado o id do item a ser alterado 
     * @returns Objeto
     */
    async quantidade(data){
        return await new Promise(async (resolve, reject) => {
            try {
                let query = "UPDATE estoque SET quantidade = ? WHERE item_id = ?";
                conn.connect();
                conn.query(query, [data.valor, parseInt(data.item_id)], (err, res) => {
                    if(err){
                        reject({
                            msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                            code: 401
                        });
                    } else {
                        if(res.info.includes('Changed: 0')){
                            resolve({
                                msg: `Não fora realizada alterações efetivas pois o item já está na quantidade determinada`,
                                code: 200
                            });
                        }else if(res.affectedRows == 1){
                            resolve({
                                msg: `Quantidade alterada para ${data.valor}!`,
                                code: 200
                            });
                        };
                    };
                });
            } catch (error) {
                reject({
                    msg: `Um erro ocorreu durante a alteração dos dados ${JSON.stringify(error)}`,
                    code: 401
                });
            };
        });
    };

    /**
     * Função que realiza a validação dos dados do item para registro no estoque.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} item Dados do item para registro, é esperado um objeto para comparação com o Objeto de validação Item
     */
    async validaInfos(item){
        return new Promise(async (resolve, reject) => {
            try{
                let result = this.Item.parse(item);
                if(result){
                    conn.connect();
                    conn.query('SELECT a.nome FROM administradores a WHERE a.idadministradores = ? AND a.status = 1', [item.criado_por], (err, res) => {
                        if(err){
                            reject({
                                msg: "Ocorreu um erro na validação do administrador responsável.",
                                code: 401
                            });
                        } else if (res.length == 1){;
                            resolve({
                                msg: `Item ${item.nome_produto} criado com sucesso!.`,
                                code: 401
                            });
                        } else {
                            reject({
                                msg: "Este usuario administrador não foi encontrado ou está desativado.",
                                code: 401
                            })
                        }
                    });
                }
            }catch(err){
                reject({
                    msg: `Um erro ocorreu na validação dos dados ${err}`,
                    code: 401
                });
            }
        })
    }
}

