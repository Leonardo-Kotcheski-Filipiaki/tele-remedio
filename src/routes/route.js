import { config } from 'dotenv';
config();
import {Router} from 'express'
import jwt from 'jsonwebtoken';
import authTokenValidation from '../middleware/authorizatonToken.js';
const router = Router();

const pedidos = {
    id: '001321',
    itens: [
        'Homeprasol',
        'Hibuprofeno'
    ],
    id_cliete: '124124'
};

router.post('/login', (req, res) => {
    try {
        const username = req.body;
        
        const user = {
            name: username
        };
        
        const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        res.json({access_token: access_token});
        
    } catch (e) {
        res.status(404).send(e);
    }
})

router.get('/dados', authTokenValidation, (req, res) => {
    console.log(req.headers['Authorization'])
    res.json(pedidos);
})



export default router;