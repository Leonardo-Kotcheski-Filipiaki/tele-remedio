import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';
import Usuario from '../model/Usuarios.js';

/**
 * Middleware de autenticação geral para usuários e administradores
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Função para continuar o fluxo
 */
export const authTokenValidation = (req, res, next) => {
    try {
        // 1. Verifica se o header de autorização existe
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                code: 401,
                msg: 'Token de autorização não fornecido'
            });
        }

        // 2. Extrai o token do header
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) {
            return res.status(401).json({
                code: 401,
                msg: 'Formato de token inválido'
            });
        }

        // 3. Verifica o token JWT
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    code: 403,
                    msg: 'Token inválido ou expirado'
                });
            }

            // 4. Padroniza o objeto do usuário
            req.user = {
                id: decoded.id || decoded.user_id || decoded.idadministradores,
                tipo: decoded.idadministradores ? 'admin' : 'user',
                nome: decoded.nome,
                email: decoded.email,
                cpf: decoded.cpf,
                ...decoded
            };

            // 5. Continua o fluxo
            next();
        });

    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({
            code: 500,
            msg: 'Erro interno na autenticação'
        });
    }
};

/**
 * Middleware de autenticação específico para administradores
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Função para continuar o fluxo
 */
export const authTokenValidationAdm = async (req, res, next) => {
    try {
        // 1. Verifica se o header de autorização existe
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                code: 401,
                msg: 'Token de autorização não fornecido'
            });
        }

        // 2. Extrai o token do header
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) {
            return res.status(401).json({
                code: 401,
                msg: 'Formato de token inválido'
            });
        }

        // 3. Verifica o token JWT
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    code: 403,
                    msg: 'Token inválido ou expirado'
                });
            }

            // 4. Verifica se é um administrador
            if (!decoded.idadministradores) {
                return res.status(403).json({
                    code: 403,
                    msg: 'Acesso restrito a administradores'
                });
            }

            try {
                // 5. Valida o administrador no banco de dados
                const usuarioModel = new Usuario();
                await usuarioModel.validaAdministradores(decoded.idadministradores);

                // 6. Padroniza o objeto do admin
                req.user = {
                    id: decoded.idadministradores,
                    tipo: 'admin',
                    nome: decoded.nome,
                    email: decoded.email,
                    cpf: decoded.CPF, // Note o maiúsculo para admins
                    ...decoded
                };

                // 7. Continua o fluxo
                next();

            } catch (error) {
                console.error('[ADMIN VALIDATION ERROR]', error);
                return res.status(403).json({
                    code: 403,
                    msg: error.msg || 'Falha na validação do administrador'
                });
            }
        });

    } catch (error) {
        console.error('[ADMIN AUTH ERROR]', error);
        return res.status(500).json({
            code: 500,
            msg: 'Erro interno na autenticação de administrador'
        });
    }
};