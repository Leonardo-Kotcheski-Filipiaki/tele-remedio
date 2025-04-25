import c from "crypto";

export default function gerarJwtHas(){
    return c.randomBytes(64).toString('hex');
}