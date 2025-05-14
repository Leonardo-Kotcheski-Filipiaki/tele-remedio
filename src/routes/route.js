/**
 * Imports
 */
import { config } from 'dotenv';
config();
import {Router} from 'express'
import jwt from 'jsonwebtoken';
import {authTokenValidation, authTokenValidationAdm} from '../middleware/authorizatonToken.js';
import gerarJwtHas from '../../assets/utils/jwtGeneratorHash.js';
import { registrarItemCon, listarItemCon, alterarListagem } from '../controller/estoqueController.js';
import { alterarStatusCon, realizarLogin, realizarLoginAdm, registrarAdministradorCon, registrarUsuarioCon } from '../controller/userController.js';
const router = Router();


// #region Rotas pra usuarios e administradores;
 
/**
 * Rota que registra um novo usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/registro/usuario/:criador', authTokenValidation, (req, res) => {
    try {
        const user = req.body;
        user['criado_por'] = parseInt(req.params.criador);
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
router.post('/register/administrator/:criador', authTokenValidation, (req, res) => {
    try {
        const user = req.body;
        user['criado_por'] = parseInt(req.params.criador);
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
        const user = req.body;
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
        const user = req.body;
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

router.get('/gerarjwthash', (req, res) => {
    res.send(gerarJwtHas());
});

//#endregion

// #region Rotas para estoque e items
/**
 * Rota que registra um novo item no estoque
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/registro/item/:criador', authTokenValidationAdm, (req, res) => {
    try {
        const item = req.body;
        item['administradores_idadministradores'] = parseInt(req.params.criador);
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
router.patch('/alterar/listagem/:id', authTokenValidationAdm, (req, res) => {
    try {
        if(req.body.valor > 1 || req.body.valor < 0){
            res.status(401).send('Apenas é possível alterar para "Listar" valor 1 ou "Não listado" valor 0');
        };
        const item = {
            item_id: req.params.id,
            valor: req.body.valor
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

router.patch('/alterar/status/:id/:tipo/:idRealizador', authTokenValidationAdm, async (req, res) => {
    try {
        if(req.body.status > 1 || req.body.status < 0){
            res.status(401).send('Apenas é possível alterar para "Ativo" valor 1 ou "Desativado" valor 0');
        } else if(req.params.tipo == 'administradores' && req.params.id == req.params.idRealizador){
            res.status(401).send('Não é possível alterar o status do seu próprio usuário, peça para outro administrador faze-lo');
        }

        const data = {
            user_id: req.params.id,
            realizador_id: req.params.idRealizador,
            tipo: req.params.tipo, //administradores ou usuarios
            status: req.body.status
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
// #endregion
export default router;