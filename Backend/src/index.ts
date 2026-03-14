import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Static files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

=======
>>>>>>> parent of 9c44a30 (Add / json, and catalogo with real products)
// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});