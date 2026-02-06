import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const gradientRef = useRef(null);

    useEffect(() => {
        let time = 0;
        const animateGradient = () => {
            time += 0.003;
            if (gradientRef.current) {
                const x1 = 50 + Math.sin(time) * 30;
                const y1 = 50 + Math.cos(time) * 30;
                const x2 = 50 + Math.sin(time + 2) * 35;
                const y2 = 50 + Math.cos(time + 2) * 35;
                
                gradientRef.current.style.background = `
                    radial-gradient(circle at ${x1}% ${y1}%, rgba(31, 125, 205, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at ${x2}% ${y2}%, rgba(23, 69, 164, 0.15) 0%, transparent 50%),
                    #fafbfc
                `;
            }
            requestAnimationFrame(animateGradient);
        };
        animateGradient();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Login exitoso:', data);
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" ref={gradientRef}>
            <div className="login-content">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="logo-icon-login">
                            <img src="/Logo.png" alt="Ingenia Print" />
                        </div>
                    </div>
                    <h1 className="campus-title">Ingenia Print Campus</h1>
                    <p className="campus-subtitle">Plataforma de aprendizaje en impresión 3D</p>
                </div>

                <div className="login-box">
                    <div className="login-box-header">
                        <h2>Bienvenido</h2>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="tu_usuario"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Ingresando...
                                </>
                            ) : (
                                <>
                                    Ingresar
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>
            <div className="decorative-circle circle-3"></div>
        </div>
    );
}