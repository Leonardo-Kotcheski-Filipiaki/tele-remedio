import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';

function authTokenValidation(req, res, next){
    if(req.headers['authorization'].length < 1){
        console.log('passei reto fi')
        res.status(404).send('No authorization code');
    } else {
        const authToken = req.headers['authorization'];
        const token = authToken != undefined ? authToken : null;
        if(token == null || token.length == 0) return res.status(404);
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(403);
            req.user = user;
            next();
        })
    }   
}

export default authTokenValidation;