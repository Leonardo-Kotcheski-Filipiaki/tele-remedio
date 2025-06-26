/**
 * Imports
 */
import { config } from 'dotenv';
config();
import {Router} from 'express'
import jwt from 'jsonwebtoken';
import {authTokenValidation, authTokenValidationAdm} from '../middleware/authorizatonToken.js';
import gerarJwtHas from '../../assets/utils/jwtGeneratorHash.js';
import { registrarItemCon, listarItemCon, alterarListagem, alterarQuantidade } from '../controller/estoqueController.js';
import { alterarStatusCon, realizarLogin, realizarLoginAdm, registrarAdministradorCon, registrarUsuarioCon, listarUsuariosCon } from '../controller/userController.js';
import { modificarStatus, registrarReq } from '../controller/pedidosController.js';
const router = Router();


router.get('/', (req, res) => {
 res.send("Aqui deu ein!");
})

// #region Rotas pra usuarios e administradores;
 
/**
 * Rota que registra um novo usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/registro/usuario', authTokenValidationAdm, (req, res) => {
    try {

        const user = req.body;
        user['criado_por'] = parseInt(req.query.criador);
        user['ultimo_alterado_por'] = parseInt(req.query.criador);
        registrarUsuarioCon(user).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            }
        }).catch(err => {
            res.send(err);
        })
        
    } catch (e) {
        res.status(404).send(e);
    }
})

/**
 * Rota que registra um novo usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/register/administrator', authTokenValidationAdm, (req, res) => {
    try {
        const user = req.body;
        user['criado_por'] = parseInt(req.query.criador);
        user['ultimo_alterado_por'] = parseInt(req.query.criador);
        registrarAdministradorCon(user).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            }
        }).catch(err => {
            res.send(err);
        })
        
    } catch (e) {
        res.status(404).send(e);
    }
})

/**
 * Rota para realizar login e retornar um access token
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/login', (req, res) => {
    try {
        const user = {
            nome: req.query.nome,
            senha: req.query.senha
        }
        realizarLogin(user).then(result => {

            if(Object.keys(result).includes('nome') && Object.keys(result).includes('email')){
                const access_token = jwt.sign(result, process.env.ACCESS_TOKEN_SECRET)
                res.json({access_token: access_token, nome: result.nome, email: result.email});
            } else {
                if(Object.keys(result).includes('msg') && Object.keys(result).includes('code')){
                    res.status(result.code).send(result.msg);
                } else {
                    res.status(500).send('Erro no servidor interno');
                }
            }
        }).catch(err => {
            res.send(err);
        })
    } catch (e) {
        res.status(404).send(e);
    }
})

/**
 * Rota para realizar login de admnistrador e retornar um access token
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/login/administrador/interno', (req, res) => {
    try {
        const user = {
            nome: req.query.nome,
            senha: req.query.senha,
            cpf: req.query.cpf
        }
        realizarLoginAdm(user).then(result => {
            if(Object.keys(result).includes('idadministradores') && Object.keys(result).includes('nome') && Object.keys(result).includes('CPF') && Object.keys(result).includes('email')){
                const access_token = jwt.sign(result, process.env.ACCESS_TOKEN_SECRET);
                res.json({access_token: access_token, id: result.idadministradores, nome: result.nome, email: result.email, CPF: result.CPF});
            } else {
                if(Object.keys(result).includes('msg') && Object.keys(result).includes('code')){
                    res.status(result.code).send(result.msg);
                } else {
                    res.status(500).send('Erro no servidor interno');
                }
            }
        }).catch(err => {
            res.send(err);
        })
    } catch (e) {
        res.status(404).send(e);
    }
})

/**
 * Rota que lista todos os usuários
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/listar/usuarios/todos', authTokenValidationAdm, (req, res) => {
    try {
        if(req.query.tipo != undefined){
            if(req.query.tipo < 0 && req.query.tipo > 1){
                res.status(401).send('Tipo deve ser 0 (Para usuários) ou 1 (Para administradores)');
            }
            listarUsuariosCon(req.query.tipo).then(result => {
                if(Object.keys(result).includes('msg')){
                    res.status(result.code).send(result.msg);
                } else if(Object.keys(result).includes('content')){
                    res.status(result.code).send(result.content);
                } else {
                    res.status(500).send("Algum erro ocorreu! "+result);
                }
            }).catch(err => {
                if(Object.keys(err).includes('code')){
                    res.status(err.code).send(err.msg);
                } else {
                    res.status(500).send("Algum erro ocorreu! "+err);
                }
            })
        } else {
            listarUsuariosCon().then(result => {
                if(Object.keys(result).includes('msg')){
                    res.status(result.code).send(result.msg);
                } else if(Object.keys(result).includes('content')){
                    res.status(result.code).send(result.content);
                } else {
                    res.status(500).send("Algum erro ocorreu! "+result);
                }
            }).catch(err => {
                if(Object.keys(err).includes('code')){
                    res.status(err.code).send(err.msg);
                } else {
                    res.status(500).send("Algum erro ocorreu! "+err);
                }
            })
        }
    } catch (e) {
        res.status(404).send(e);
    };
});

/**
 * Rota que altera o status de um usuário
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.patch('/alterar/status', authTokenValidationAdm, async (req, res) => {
    try {
        if(req.query.status > 1 || req.query.status < 0){
            res.status(401).send('Apenas é possível alterar para "Ativo" valor 1 ou "Desativado" valor 0');
        } else if(req.query.tipo == 'administradores' && req.query.id == req.query.idRealizador){
            res.status(401).send('Não é possível alterar o status do seu próprio usuário, peça para outro administrador faze-lo');
        }

        const data = {
            user_id: req.query.id,
            realizador_id: req.query.idRealizador,
            tipo: req.query.tipo, //administradores ou usuarios
            status: req.query.status
        };

        alterarStatusCon(data).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            }
        })
        .catch(err => {
            res.send(err);
        });
    } catch (e) {
        res.status(404).send(e);
    };
})

router.get('/gerarjwthash', (req, res) => {
    res.status(200).send(gerarJwtHas());
});

//#endregion

// #region Rotas para estoque e items
/**
 * Rota que registra um novo item no estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/registro/item', authTokenValidationAdm, (req, res) => {
    try {
        const item = req.body;
        item['criado_por'] = parseInt(req.query.criador);
        registrarItemCon(item).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            };
        }).catch(err => {
            res.send(err);
        });
        
    } catch (e) {
        res.status(404).send(e);
    };
});
/**
 * Rota que lista os itens lista = 1 do estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/listar/itens', authTokenValidation, (req, res) => {
    try {
        listarItemCon().then(result => {
            if(Object.keys(result).includes('content')){
                res.status(result.code).send(result.content)
            };
        })
        .catch(err => {
            res.send(err);
        });
    } catch (e) {
        res.status(404).send(e);
    };
});

/**
 * Rota que lista todos os itens do estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/listar/itens/todos', authTokenValidationAdm, (req, res) => {
    try {
        listarItemCon(1).then(result => {
            if(Object.keys(result).includes('content')){
                res.status(result.code).send(result.content)
            };
        })
        .catch(err => {
            res.send(err);
        });
    } catch (e) {
        res.status(404).send(e);
    };
});

/**
 * Rota para alterar o tipo de listagem do item
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.patch('/alterar/listagem', authTokenValidationAdm, (req, res) => {
    try {
        if(req.query.status > 1 || req.query.status < 0){
            res.status(401).send('Apenas é possível alterar para "Listar" valor 1 ou "Não listado" valor 0');
        };
        const item = {
            item_id: req.query.id,
            valor: req.query.status
        };
        
        alterarListagem(item).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            }
        })
        .catch(err => {
            res.send(err);
        });
    } catch (e) {
        res.status(404).send(e);
    };
});

/**
 * Rota para alterar o tipo de listagem do item
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.patch('/alterar/quantidade', authTokenValidationAdm, (req, res) => {
    try {
        if(req.query.quant < 0){
            res.status(401).send('Apenas é possível alterar a quantidade para um número negativo');
        };
        
        const item = {
            item_id: req.query.id,
            valor: req.query.quant
        };
        
        alterarQuantidade(item).then(result => {
            if(Object.keys(result).includes('msg')){
                res.status(result.code).send(result.msg);
            }
        })
        .catch(err => {
            res.send(err);
        });
    } catch (e) {
        res.status(404).send(e);
    };
});
// #endregion

// #region Rotas para pedidos
    /**
     * Rota que registra um novo pedido
     * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
     */
    router.post('/registro/pedido', authTokenValidation, (req, res) => {
        try {
            const pedido = req.body;
            pedido['criador'] = parseInt(req.query.criador);
            parseInt(req.query.criador);
            registrarReq(pedido).then(result => {
                if(Object.keys(result).includes('msg')){
                    res.status(result.code).send(result.msg);
                }
            }).catch(err => {
                res.send(err);
            })
            
        } catch (e) {
            res.status(404).send(e);
        }
    })

    /**
     * Rota para alterar o status do pedido
     * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
     */
    router.patch('/alterar/pedido', authTokenValidationAdm, (req, res) => {
        try {
            const {status, id} = req.query;
            modificarStatus(status, id).then(result => {
                if(Object.keys(result).includes('msg')){
                    res.status(result.code).send(result.msg);
                }
            }).catch(err => {
                res.send(err);
            })
            
        } catch (e) {
            res.status(404).send(e);
        }
    })
// #endregion
export default router;
