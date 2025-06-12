import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';
import Usuario from '../model/Usuarios.js';
/**
 * Função para validação do token JWT  
 */
export function authTokenValidation(req, res, next){
    try {
        if(req.headers['authorization'].length < 1){
            res.status(404).send('No authorization code');
        } else {
            const authToken = req.headers['authorization'].replace('Bearer ', '');
            const token = authToken != undefined ? authToken : null;
            if(token == null || token.length == 0) return res.status(404);
            
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(403).send('Token não validado, acesso negado!');
                req.user = user;
                next();
            })
        }   
    } catch (error) {
        console.log('erro' + error)
    }
    
}

/**
 * Função para validação do token JWT  
 */
export function authTokenValidationAdm(req, res, next){
    if(req.headers['authorization'].length < 1){
        res.status(404).send('No authorization code');
    } else {
        const authToken = req.headers['authorization'].replace('Bearer ', '');
        const token = authToken != undefined ? authToken : null;
        if(token == null || token.length == 0) return res.status(404);
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(403).send('Token não validado, acesso negado!');
            if(Object.keys(user).includes('idadministradores')){
                const u = new Usuario();
                u.validaAdministradores(user.idadministradores).then(result => {
                    if(result == 200){
                        req.user = user;
                        next();
                    }
                }).catch(err => {
                    return res.status(401).send(err.msg);
                })
            } else {
                return res.status(401).send('Token de autorização não pertence a um usuario administrador');
            }
        })
    }   
}
