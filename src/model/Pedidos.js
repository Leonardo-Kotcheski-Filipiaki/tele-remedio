/**
 * imports
 */
import {z} from 'zod';
import {conn} from '../../server.js';
import Estoque from './Estoque.js';


export default class Pedidos {
    /**
     * Objeto do item para validação dos dados para registro no estoque
     * @author Leonardo Kotches Filipiaki devleonardokofi
     */
    pedido = z.object({
        items: z.array(
            z.object({
                id: z.number(),
                qtd: z.number(),
            })
        ),
        criador: z.number(),
        data_criacao: z.string(),
        data_prevista: z.string()
    });


    /**
     * Função para registro de item no estoque
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} items Objeto com as informações para criação do item
     */
    async registrarPedido(items){
        return new Promise(async (resolve, reject) => {
            try {
                await this.datar().then(res => {
                    items['data_criacao'] = res['data_criacao'];
                    items['data_prevista'] = res['data_prevista'];
                }).catch(err => reject(err));
                
                await this.validaInfos(items, this.pedido).then(res => {
                    if(res){
                        let query = "INSERT INTO pedidos (items, data_pedido, data_prevista, usuarios_user_id) VALUES (?, ?, ?, ?)";
                        conn.connect();
                        conn.query(query, [JSON.stringify(items.items), items.data_criacao, items.data_prevista, items.criador], (err, res) => {
                            if(err) {
                                reject({
                                    msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                                    code: 401
                                });
                            } else if (res) {
                                items.items.forEach(async i => {
                                    const e = new Estoque();

                                    await e.quantidade({item_id: i.id, valor: i.qtd}).then(res => {
                                        if(!res.code == 200){
                                            reject({
                                                msg: "Houve um problema no desconto do estoque!",
                                                code:500
                                            });
                                        }
                                    })
                                })

                                resolve({
                                    msg: `Pedido registrado com sucesso!`,
                                    code: 201
                                }); 
                            } else {
                                reject({
                                    msg: `Algo ocorreu! ${JSON.stringify(err)}`,
                                    code: 401
                                });
                            }
                        })
                    } else if(res.code){
                        reject(res);
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
     * Função para alterar status do pedido
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {string} status status do pedido
     * @param {integer} id Id do pedido
     */
    async alterarStatus(status, id, alterador, descricao){
        return new Promise(async (resolve, reject) => {
            try {
                let data = new Date()
                data = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()} ${data.getHours()}:${data.getMinutes()}:`.concat(
                data.getSeconds().toFixed().length < 2 ? "".concat(data.getSeconds()) : data.getSeconds());
                let query = "UPDATE pedidos SET status = ?, data_alteracao = ?, observacao = ?, alterado_por = ? WHERE pedidos_id = ?"
                conn.connect();
                conn.query(query, [status, data, descricao, parseInt(alterador), parseInt(id)], (err, res) => {
                    if(err){
                        reject({
                            msg: "Ocorreu um erro na alteração dos pedidos "+err,
                            code: 401
                        });
                    }
                    if(res.affectedRows > 0) {
                        resolve({
                            msg: "Status alterado com sucesso para "+status,
                            code: 200
                        });
                    } else {
                        resolve({
                            msg: "Nenhuma alteração foi realizada, confira se o estado já está como deseja",
                            code: 200
                        });
                    }
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
     * Função para listar o pedido por id
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {object} dados dados a listar o pedido
     * @param {null} [todos=null] 
     */
    async listarPedido(dados = null, todos = null){
        return new Promise(async (resolve, reject) => {
            try {
                let query;
                if(todos != null){
                    query = "SELECT p.pedidos_id AS cod, p.items, p.status, p.observacao, p.data_pedido, p.data_prevista, p.data_alteracao, p.usuarios_user_id AS solicitante, u.nome, u.telefone, u.endereco FROM pedidos p JOIN usuarios u ON u.user_id = p.usuarios_user_id";
                }else if(dados.user && dados.id){
                    query = `SELECT p.pedidos_id AS cod, p.items, p.status, p.observacao, p.data_pedido, p.data_prevista, p.data_alteracao, p.usuarios_user_id AS solicitante, u.nome, u.telefone, u.endereco FROM pedidos p JOIN usuarios u ON u.user_id = p.usuarios_user_id WHERE p.pedidos_id = ? AND p.usuarios_user_id = ${dados.user}`
                }else if(dados.user && !dados.id){
                    query = `SELECT p.pedidos_id AS cod, p.items, p.status, p.observacao, p.data_pedido, p.data_prevista, p.data_alteracao, p.usuarios_user_id AS solicitante, u.nome, u.telefone, u.endereco FROM pedidos p JOIN usuarios u ON u.user_id = p.usuarios_user_id WHERE p.usuarios_user_id = ${dados.user}`
                } else {
                    query = "SELECT p.pedidos_id AS cod, p.items, p.status, p.observacao, p.data_pedido, p.data_prevista, p.data_alteracao, p.usuarios_user_id AS solicitante, u.nome, u.telefone, u.endereco FROM pedidos p JOIN usuarios u ON u.user_id = p.usuarios_user_id WHERE p.pedidos_id = ?"
                }
                conn.connect();
                conn.query(query, todos != null ? [] : [parseInt(dados.id)], async (err, res) => { 
                    if(err){
                        reject({
                            msg: "Ocorreu um erro na listagem dos pedidos "+err,
                            code: 401
                        });
                    }
                    if(res.length == 1) {
                        let e = new Estoque();
                        res = res[0];
                        let itemsList = res.items;
                        itemsList = await Promise.all(itemsList.map(async i => {
                            await e.listarItemPedido(i.id).then(res => {
                                i['nome'] = res.content[0].nome_produto;
                            }).catch(error => {
                                reject({
                                    code: 401,
                                    msg: "Ocorreu um erro "+error
                                })
                            })
                            return i
                        }))
                        res.items = itemsList
                        res.data_pedido = res.data_pedido.toLocaleDateString('pt-BR');
                        res.data_prevista = res.data_prevista.toLocaleDateString('pt-BR');
                        res.data_alteracao = res.data_alteracao.toLocaleDateString('pt-BR');
                        resolve({
                            code: 200,
                            content: res
                        });
                    } else if(res.length > 1){
                        let e = new Estoque();
                        res = await Promise.all(res.map(async result => {
                            let itemsList = result.items;
                            itemsList = await Promise.all(itemsList.map(async i => {
                                await e.listarItemPedido(i.id).then(resIntern => {
                                    i['nome'] = resIntern.content[0].nome_produto;
                                }).catch(error => {
                                    reject({
                                        code: 401,
                                        msg: "Ocorreu um erro "+error
                                    })
                                })
                                return i
                            }))
                            result.items = itemsList
                            result.data_pedido = result.data_pedido.toLocaleDateString('pt-BR');
                            result.data_prevista = result.data_prevista.toLocaleDateString('pt-BR');
                            result.data_alteracao = result.data_alteracao.toLocaleDateString('pt-BR');
                            return result
                        }))
                        resolve({
                            code: 200,
                            content: res
                        });
                    }else {
                        reject({
                            msg: "Nenhum pedido encontrado!",
                            code: 404
                        });
                    }
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
     * Função que registra o momento atual da criação do pedido e a data prevista para entrega contando 5 dias úteis a frente
     * @author Leonardo Kotches Filipiaki devleonardokofi
     */
    async datar() {
        return new Promise(async (resolve, reject) => {
            try {
                let obj = {};
                let data = new Date()
                obj['data_criacao'] = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()} ${data.getHours()}:${data.getMinutes()}:`.concat(
                data.getSeconds().toFixed().length < 2 ? "".concat(data.getSeconds()) : data.getSeconds());
                let datePrevision = new Date(data.getFullYear(), data.getMonth(), data.getDate());
                datePrevision.setDate(datePrevision.getDate()+5);
                let i = 0;
                while(i < 1){
                    if(datePrevision.getDay() == 0 || datePrevision.getDay() == 6){
                        datePrevision.setDate(datePrevision.getDate()+1);
                    } else {
                        i = 1;
                    }
                }
                
                
                obj['data_prevista'] = `${datePrevision.getFullYear()}-${datePrevision.getMonth()}-${datePrevision.getDate()}`;
                resolve(obj);
            } catch (error) {
                reject({
                    msg: `Um erro ocorreu na datação dos dados ${error}`,
                    code: 401
                })
            }
        })
    }

    

    /**
     * Função que realiza as validações necessárias para a criação do pedido.
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {Object} items Dados do pedido para registro, é esperado um objeto para comparação com o Objeto de validação Item
     */
    async validaInfos(items, validador){
        return new Promise(async (resolve, reject) => {
            try{
                let result = validador.parse(items);
                if(result){
                    await this.verificarQuantidade(items.items).then(res => {
                        resolve(1);
                    }).catch(err => {
                        if(err.code){
                            reject(err);
                        } else if (err == false){
                            reject({
                                msg: "Quantidade insuficiente em estoque!",
                                code: 401
                            });
                        }
                    })
                }
            }catch(err){
                reject({
                    msg: `Um erro ocorreu na validação dos dados ${err}`,
                    code: 401
                });
            }
        })
    }
    
    /**
     * Função que realiza as validações necessárias para a alteração do status do pedido
     * @author Leonardo Kotches Filipiaki devleonardokofi
     * @param {string} status Status requerido 
     * @param {integer} id Id do pedido
     */
    async validarPedido(status, id){
        return new Promise(async (resolve, reject) => {
            try{
                let query = "SELECT p.status FROM pedidos p WHERE p.pedidos_id = ?";
                conn.connect();
                conn.query(query, parseInt(id), (err, res) => {
                    if(err){
                        reject({
                            msg: "Algum erro ocorreu e não foi possível validar o pedido",
                            code: 404
                        });
                    }

                    if(res[0].status.toLowerCase() != status.toLowerCase()){
                        resolve(true)
                    } else {
                        resolve({
                            msg: "Pedido já está com o status requerido!",
                            code: 200
                        });
                    }
                })
            } catch(err){
                reject({
                    msg: `Um erro ocorreu na validação do pedido ${err}`,
                    code: 401
                });
            }
        })
    }

    async verificarQuantidade(items){
        return await new Promise(async (resolve, reject) => {
                try{
                    let query = "SELECT true FROM estoque e WHERE e.item_id = ? AND e.quantidade >= ?";
                    items.forEach(i => {
                        conn.connect();
                        conn.query(query, [parseInt(i.id), parseInt(i.qtd)], (err, res) => {
                            if(Object.keys(res).length == 0){
                                reject(false);
                            }
                        })
                    })

                    setTimeout(() => {
                        resolve(true);
                    }, 5000)
                } catch(err){
                    reject({
                        msg: `Um erro ocorreu na validação do pedido ${err}`,
                        code: 401
                    })
                }
        }
    )}
}

