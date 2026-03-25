"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const productos_routes_1 = __importDefault(require("./routes/productos.routes"));
dotenv_1.default.config();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error('Faltan variables de entorno: ADMIN_USERNAME y ADMIN_PASSWORD');
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'src', 'uploads')));
app.use('/images', express_1.default.static(path_1.default.join(process.cwd(), 'Frontend', 'public')));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', productos_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
exports.default = app;
