"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const productos_routes_1 = __importDefault(require("./routes/productos.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Static files
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "src", "uploads")));
// Rutas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', productos_routes_1.default); // ← AGREGAR
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Ingenia Print Campus funcionando! 🚀' });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
