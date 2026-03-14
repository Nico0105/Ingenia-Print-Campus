import { Request, Response } from 'express';
import { LoginRequest, LoginResponse } from '../types';
import { getAdminByUsername } from '../db';

export const login = async (req: Request, res: Response): Promise<void> => {
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

        // Buscar usuario en la base de datos
        const user = await getAdminByUsername(username);

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
