/**
 * Imports
 */
import { config } from 'dotenv';
config();
import {Router} from 'express'
import jwt from 'jsonwebtoken';
import authTokenValidation from '../middleware/authorizatonToken.js';
import {registrarUsuarioCon, realizarLogin} from '../controller/userController.js';

const router = Router();

/**
 * Rota que registra um novo usuario
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.post('/register', (req, res) => {
    try {
        const user = req.body;
        
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
 * Rota para realizar login e retornar um acess token
 * @author Leonardo Kotches Filipiaki devleonardokofi@gmail.com 
 */
router.get('/login', (req, res) => {
    try {
        const user = req.body;
        
        realizarLogin(user).then(result => {
            if(Object.keys(result).includes('nome') && Object.keys(result).includes('email')){
                const access_token = jwt.sign(result, process.env.ACCESS_TOKEN_SECRET)
                res.json({access_token: access_token});
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


export default router;