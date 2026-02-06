import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/home" className="navbar-logo">
                        <div className="logo-icon">
                            <img src="/Logo.png" alt="" />
                        </div>
                        <span className="logo-text">Ingenia Campus</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="navbar-menu">
                        <Link to="/dashboard" className="nav-link active">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Mis Cursos</span>
                        </Link>
                        <Link to="/progress" className="nav-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Mi Progreso</span>
                        </Link>
                        <Link to="/profile" className="nav-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Perfil</span>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="navbar-actions">
                        <button className="icon-button" title="Notificaciones">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="notification-dot"></span>
                        </button>
                        
                        <div className="user-profile">
                            <div className="avatar">
                                <span>U</span>
                            </div>
                            <div className="user-info">
                                <span className="user-name">Usuario</span>
                                <span className="user-role">Estudiante</span>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="logout-button">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Salir</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                    <Link to="/dashboard" className="mobile-link">Mis Cursos</Link>
                    <Link to="/progress" className="mobile-link">Mi Progreso</Link>
                    <Link to="/profile" className="mobile-link">Perfil</Link>
                    <button onClick={handleLogout} className="mobile-link logout">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;