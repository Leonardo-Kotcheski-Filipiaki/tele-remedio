import e from 'express';
import router from './src/routes/route.js';
import bodyParser from 'body-parser';

const app = e();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(router)

app.listen(3000);