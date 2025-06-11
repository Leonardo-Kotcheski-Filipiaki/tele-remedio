import e from 'express';
import router from './src/routes/route.js';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import 'dotenv/config';
import "swagger-ui-express";
import "yamljs";
import swaggerUiExpress from 'swagger-ui-express';
import YAML from 'yamljs';

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
const swaggerDocument = YAML.load("./swagger.yml");
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocument))



app.on('ready', () => {
    const port = process.env.PORT || 3000;
    app.listen(port, (err) => {
        if (err) {
            console.error(`Erro ao iniciar o servidor: ${err}`);
            return;
        }
    });
});
