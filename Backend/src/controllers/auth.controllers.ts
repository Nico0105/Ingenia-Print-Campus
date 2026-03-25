import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginRequest, LoginResponse } from '../types';
import { getAdminByUsername, verifyPassword } from '../db';
import bcrypt from 'bcryptjs';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

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

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            } as LoginResponse);
            return;
        }

        // Verificar contraseña usando bcrypt
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            } as LoginResponse);
            return;
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Login exitoso
        res.json({
            success: true,
            message: 'Login exitoso',
            token: token,
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
