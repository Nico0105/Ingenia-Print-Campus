import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import productosRoutes from './routes/productos.routes';
import { getAdminByUsername, db } from './db';
import bcrypt from 'bcrypt';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Get admin credentials from environment variables with fallbacks
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

// Ruta para crear/verificar admin - usar POST
app.post('/api/setup-admin', async (req: Request, res: Response) => {
    try {
        const username = ADMIN_USERNAME;
        const password = ADMIN_PASSWORD;
        
        // Primero eliminar cualquier admin existente
        db.run('DELETE FROM admins WHERE username = ?', [username]);
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar nuevo admin
        db.run(
            'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin@ingenia.com'],
            function(err) {
                if (err) {
                    console.error('Error creating admin:', err);
                    res.status(500).json({ success: false, message: 'Error creating admin', error: err.message });
                } else {
                    console.log('Admin created with ID:', this.lastID);
                    res.json({ 
                        success: true, 
                        message: 'Admin created successfully',
                        username: username,
                        password: password
                    });
                }
            }
        );
    } catch (error: any) {
        console.error('Setup error:', error);
        res.status(500).json({ success: false, message: 'Error setting up admin', error: error.message });
    }
});

// Debug endpoint - ver todos los admins
app.get('/api/debug-admins', (req: Request, res: Response) => {
    db.all('SELECT id, username, email FROM admins', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ admins: rows });
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    // Crear admin automáticamente al iniciar (usando hash)
    db.get('SELECT id FROM admins WHERE username = ?', [ADMIN_USERNAME], async (err, row) => {
        if (!row) {
            try {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                db.run('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)', 
                    [ADMIN_USERNAME, hashedPassword, 'admin@ingenia.com']);
                console.log('✅ Admin creado: ' + ADMIN_USERNAME + ' / ' + ADMIN_PASSWORD);
            } catch (hashErr) {
                console.error('Error hashing admin password:', hashErr);
            }
        } else {
            console.log('ℹ️ Admin ya existe');
        }
    });
});