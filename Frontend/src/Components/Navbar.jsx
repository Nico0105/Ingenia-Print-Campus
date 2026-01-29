import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Aquí puedes limpiar tokens, etc.
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <h2>Ingenia Print Campus</h2>
                </div>
                <div className="navbar-menu">
                    <button className="navbar-link">Mis Cursos</button>
                    <button className="navbar-link">Perfil</button>
                    <button className="navbar-logout" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;