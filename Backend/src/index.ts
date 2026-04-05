// redeploy v2
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/productos.routes';

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error('Faltan variables de entorno: ADMIN_USERNAME y ADMIN_PASSWORD');
}

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));
app.use('/images', express.static(path.join(process.cwd(), 'Frontend', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productosRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
