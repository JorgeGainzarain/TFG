import React, { useState } from 'react';
import { login, register } from '../../services/authService';
import { validateEmail, validatePassword, validateName } from '../../services/api';
import './AuthOverlay.css';

const AuthOverlay = ({ isVisible, onClose, onAuthSuccess }) => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    React.useEffect(() => {
        if (isVisible) {
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            setErrors({});
        }
    }, [isVisible, mode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (mode === 'register') {
            if (!validateName(formData.name)) {
                newErrors.name = 'El nombre debe tener al menos 2 caracteres';
            }
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = 'Por favor ingresa un email válido';
        }

        if (!validatePassword(formData.password)) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let result;

            if (mode === 'login') {
                result = await login({
                    email: formData.email,
                    password: formData.password
                });
            } else {
                result = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
            }

            if (result.success) {
                onAuthSuccess?.(result.user);
                onClose();
            }

        } catch (error) {
            console.error('Auth error:', error);
            setErrors({
                general: error.message || 'Ha ocurrido un error. Inténtalo de nuevo.'
            });
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setErrors({});
    };

    if (!isVisible) return null;

    return (
        <div className="auth-overlay">

            <div className="auth-modal">
                <div className="auth-header">
                    <div className="auth-title-section">
                        <h2 className="auth-title">
                            {mode === 'login' ? '👋 ¡Hola de nuevo!' : '🎉 Únete a BookHub'}
                        </h2>
                        <p className="auth-subtitle">
                            {mode === 'login'
                                ? 'Te hemos echado de menos. Inicia sesión para acceder a tus recomendaciones personalizadas.'
                                : 'Crea tu cuenta y descubre libros increíbles personalizados para ti.'
                            }
                        </p>
                    </div>

                    <button className="auth-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="auth-error-banner">
                            ⚠️ {errors.general}
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">👤 Nombre completo</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="Ej: María García"
                                    disabled={loading}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </label>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">📧 Email</span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="tu@email.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">🔒 Contraseña</span>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </label>
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">🔒 Confirmar contraseña</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Repite tu contraseña"
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-content">
                                <span className="loading-spinner"></span>
                                {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                            </span>
                        ) : (
                            <>
                                {mode === 'login' ? '🚀 Iniciar Sesión' : '✨ Crear Cuenta'}
                            </>
                        )}
                    </button>

                    <div className="auth-divider">
                        <span>o</span>
                    </div>

                    <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={switchMode}
                        disabled={loading}
                    >
                        {mode === 'login'
                            ? '¿No tienes cuenta? Regístrate aquí'
                            : '¿Ya tienes cuenta? Inicia sesión'
                        }
                    </button>
                </form>

                <div className="auth-footer">
                    <div className="auth-benefits">
                        <h4>🎯 ¿Por qué crear una cuenta?</h4>
                        <div className="benefits-list">
                            <div className="benefit-item">
                                <span className="benefit-icon">🤖</span>
                                <span>Recomendaciones personalizadas con IA</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">📚</span>
                                <span>Organiza tu librería personal</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">⭐</span>
                                <span>Guarda y revisa tus libros favoritos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthOverlay;