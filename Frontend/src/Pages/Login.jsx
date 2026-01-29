import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login () {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

   const gradientRef = useRef(null);

    useEffect(() => {
        let time = 0;
        const animateGradient = () => {
            time += 0.005;
            if (gradientRef.current) {
                const x1 = 50 + Math.sin(time) * 20;
                const y1 = 50 + Math.cos(time) * 20;
                const x2 = 50 + Math.sin(time + 2) * 25;
                const y2 = 50 + Math.cos(time + 2) * 25;
                
                gradientRef.current.style.background = `
                    radial-gradient(circle at ${x1}% ${y1}%, #1f7dcd 0%, transparent 50%),
                    radial-gradient(circle at ${x2}% ${y2}%, #1745a4 0%, transparent 50%),
                    linear-gradient(135deg, #0d2d6b 0%, #051a3d 100%)
                `;
            }
            requestAnimationFrame(animateGradient);
        };
        animateGradient();
    }, []);

     const handleDashboard = () => {
        navigate('/Dashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                handleDashboard();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    };
    return (
        <div className="login-container" ref={gradientRef}>
            <h1 className="campus-title">Ingenia Print 3D Campus</h1>
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>
                    
                    <button onClick={handleSubmit} className="login-button">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}