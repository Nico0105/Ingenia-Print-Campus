import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/productos.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Static files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

// Serve images from Frontend public folder
app.use(
  "/images",
  express.static(path.join(process.cwd(), "Frontend", "public"))
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productosRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});