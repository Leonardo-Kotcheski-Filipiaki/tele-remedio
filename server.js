import e from 'express';
import router from './src/routes/route.js';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import 'dotenv/config';

const app = e();  // Inicializando o app primeiro

export const conn = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
});

conn.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
        process.exit(1);  // Sai do processo em caso de erro
    } else {
        console.log('Conexão com o banco bem-sucedida!');
        app.emit('ready');  // Emite um evento indicando que o banco está pronto
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

app.on('ready', () => {
    app.listen(3000, 'localhost', (err) => {
        if (err) {
            console.error(`Erro ao iniciar o servidor: ${err}`);
            return;
        }
        console.log('Servidor rodando em http://localhost:3000');
    });
});
