import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import aiRouter from './routes/ai.js';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.use('/api/ai', aiRouter);
app.use('/api/health', healthRouter);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
