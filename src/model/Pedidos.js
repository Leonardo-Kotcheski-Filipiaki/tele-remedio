/**
 * imports
 */
import {z} from 'zod';
import {conn} from '../../server.js';


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
                console.log(items)
                await this.validaInfos(items, this.pedido).then(res => {
                    if(res){
                        let query = "INSERT INTO pedidos (items, data_pedido, data_prevista, usuarios_user_id) VALUES (?, ?, ?, ?)";
                        conn.connect();
                        conn.query(query, [JSON.stringify(items.items), items.data_criacao, items.data_prevista, items.criador], (err, res) => {
                            if(err) {
                                reject({
                                    msg: `Algum erro ocorreu! ${JSON.stringify(err)}`,
                                    code: 500
                                });
                            } else if (res) {
                                resolve({
                                    msg: `Pedido registrado com sucesso!`,
                                    code: 200
                                }); 
                            } else {
                                reject({
                                    msg: `Algo ocorreu! ${JSON.stringify(err)}`,
                                    code: 500
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

    async criarCodPedido(){
      return new Promise(async (resolve, reject) => {
            
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
                    resolve(1)
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

