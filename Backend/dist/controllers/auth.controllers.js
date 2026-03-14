"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
// Usuarios de ejemplo (luego conectarás una DB)
const users = [
    { id: '1', username: 'admin', password: 'admin123', email: 'admin@ingenia.com' }
];
const login = (req, res) => {
    try {
        const { username, password } = req.body;
        // Validación básica
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
            return;
        }
        // Buscar usuario
        const user = users.find(u => u.username === username);
        if (!user || user.password !== password) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
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
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};
exports.login = login;
