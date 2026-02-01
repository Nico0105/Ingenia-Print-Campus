import Navbar from '../Components/Navbar';
import CourseCard from '../Components/CourseCard';
import './Dashboard.css';

export default function Dashboard (){
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
        }
    ];

    return (
        <div className='container'>
            <div className="dashboard">
                <Navbar />
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <h1>Mis Cursos</h1>
                        <p>Explora y comienza tu aprendizaje</p>
                    </div>
                   <div className='courses-grid'>
                        {courses.map((course) => (
                            <div key={course.id} className='parent'>
                                <div className='card'>
                                    <div className='date-box'>
                                        <span className='date'>{course.duration.split(' ')[0]}</span>
                                        <span className='month'>{course.duration.split(' ')[1]}</span>
                                    </div>
                                    <div className='content-box'>
                                        <span className='card-title'>{course.title}</span>
                                        <p className='card-content'>{course.description}</p>
                                        <div className='see-more'>Ver más →</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div> 
        </div>     
    );
};
