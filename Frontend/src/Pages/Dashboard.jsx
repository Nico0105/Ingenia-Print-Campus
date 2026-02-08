import Navbar from '../Components/Navbar';
import './Dashboard.css';

export default function Dashboard() {
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
      title: "Impresion 3D Fundamentos",
      description: "Domina TypeScript y lleva tu código JavaScript al siguiente nivel.",
      duration: "6 horas"
    }
  ];

  return (
    <div className="dashboard-root">
      <div className="dashboard">
        <Navbar />

        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Mis Cursos</h1>
            <p>Explora y comienza tu aprendizaje</p>
          </div>

          <div className="dashboard-courses-grid">
            {courses.map(course => (
              <div key={course.id} className="dashboard-card-parent">
                <div className="dashboard-card">
                  <div className="dashboard-date-box">
                    <span className="dashboard-date">
                      {course.duration.split(' ')[0]}
                    </span>
                    <span className="dashboard-month">
                      {course.duration.split(' ')[1]}
                    </span>
                  </div>

                  <div className="dashboard-content-box">
                    <span className="dashboard-card-title">
                      {course.title}
                    </span>
                    <p className="dashboard-card-content">
                      {course.description}
                    </p>
                    <div className="dashboard-see-more">
                      Ver más
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
