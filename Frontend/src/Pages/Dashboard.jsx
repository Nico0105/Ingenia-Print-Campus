import Navbar from '../Components/Navbar';
import CourseCard from '../Components/CourseCard';
import './Dashboard.css';

const Dashboard = () => {
    // Datos de ejemplo - después esto vendrá de tu backend
    const courses = [
        {
            id: 1,
            title: "Introducción a React",
            description: "Aprende los fundamentos de React desde cero y crea aplicaciones web modernas.",
            duration: "8 horas",
            topics: [
                "¿Qué es React?",
                "Componentes y Props",
                "Estado y Ciclo de vida",
                "Hooks: useState y useEffect",
                "Manejo de eventos",
                "Formularios en React"
            ]
        },
        {
            id: 2,
            title: "Node.js y Express",
            description: "Crea APIs RESTful con Node.js y Express desde cero.",
            duration: "10 horas",
            topics: [
                "Introducción a Node.js",
                "Configuración de Express",
                "Rutas y Controladores",
                "Middleware",
                "Autenticación con JWT",
                "Conexión a bases de datos"
            ]
        },
        {
            id: 3,
            title: "TypeScript Esencial",
            description: "Domina TypeScript y lleva tu código JavaScript al siguiente nivel.",
            duration: "6 horas",
            topics: [
                "Tipos básicos",
                "Interfaces y Types",
                "Clases y Herencia",
                "Generics",
                "Decoradores",
                "TypeScript con React"
            ]
        },
        {
            id: 4,
            title: "Diseño UI/UX",
            description: "Aprende los principios del diseño de interfaces modernas y atractivas.",
            duration: "12 horas",
            topics: [
                "Principios de diseño",
                "Teoría del color",
                "Tipografía",
                "Diseño responsive",
                "Prototipado en Figma",
                "Accesibilidad web"
            ]
        }
    ];

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Mis Cursos</h1>
                    <p>Explora y comienza tu aprendizaje</p>
                </div>
                <div className="courses-grid">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;