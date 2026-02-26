import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/productos.routes';
import path from "path";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productosRoutes);  // ← AGREGAR

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});