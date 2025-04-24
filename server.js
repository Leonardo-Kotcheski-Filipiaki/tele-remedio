import e from 'express';
import router from './src/routes/route.js';
import bodyParser from 'body-parser';
import mysql from 'mysql2'
import gerarJwtHas from './assets/extra/jwtGeneratorHash.js';

export const conn = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
});

conn.connect((err) => {
    if(err) {throw new Error(err) }else{app.emit(1)}  
})


const app = e();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(router)

app.on(1, () => {
    app.listen(3000, 'localhost', (err) => {
        if(err) {throw new Error(`Start app error: ${err}`)};
    })
})