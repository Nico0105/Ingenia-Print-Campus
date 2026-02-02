import Navbar from '../Components/Navbar';
import './Dashboard.css';

export default function Dashboard (){
    const courses = [
        {
            id: 1,
            title: "Introducción a la Impresion 3D",
            description: "Aprende los fundamentos de React desde cero y crea aplicaciones web modernas.",
            duration: "8 horas"
        },
        {
            id: 2,
            title: "Filamentos y Resinas",
            description: "Crea APIs RESTful con Node.js y Express desde cero.",
            duration: "10 horas"
        },
        {
            id: 3,
            title: "Impresion 3D Fundamentos Escenciales",
            description: "Domina TypeScript y lleva tu código JavaScript al siguiente nivel.",
            duration: "6 horas"
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
