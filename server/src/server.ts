import express from 'express';
import cors from 'cors';

import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json()); //Entender dados enviados em formato JSON
app.use(routes); //Reconhecer as rotas criadas

app.listen(3333);