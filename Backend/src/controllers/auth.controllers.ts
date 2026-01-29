import { Request, Response } from 'express';
import { LoginRequest, LoginResponse } from '../types';

// Usuarios de ejemplo (luego conectarás una DB)
const users = [
    { id: '1', username: 'admin', password: 'admin123', email: 'admin@ingenia.com' }
];

export const login = (req: Request, res: Response): void => {
    try {
        const { username, password }: LoginRequest = req.body;

        // Validación básica
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            } as LoginResponse);
            return;
        }

        // Buscar usuario
        const user = users.find(u => u.username === username);

        if (!user || user.password !== password) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            } as LoginResponse);
            return;
        }

        // Login exitoso
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username
            }
        } as LoginResponse);

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        } as LoginResponse);
    }
};