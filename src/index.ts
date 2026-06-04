import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initDb } from './db';
import { config } from './config';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Backend en TypeScript funcionando' });
});

app.use(errorHandler);

const PORT = config.port;

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
