import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminContext from '../context/AdminContext';
import './AdminLoginPage.css';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AdminContext);

  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Effacer l'erreur lors de la saisie
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation basique
    if (!formData.email || !formData.motDePasse) {
      setError('❌ Tous les champs sont requis');
      setLoading(false);
      return;
    }

    // Tentative de connexion
    const result = await login(formData.email, formData.motDePasse);

    if (result.success) {
      console.log('✅ Connexion admin réussie');
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="container">
        <div className="login-card card">
          <div className="login-header">
            <h1>🔒 Connexion Admin</h1>
            <p className="subtitle">Accès réservé aux administrateurs</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@elijahgod.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="motDePasse">Mot de passe <span className="required">*</span></label>
              <input
                type="password"
                id="motDePasse"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? '⏳ Connexion en cours...' : '🔐 Se connecter'}
            </button>
          </form>

          <div className="login-footer">
            <p className="info-text">
              ⚠️ <strong>Accès sécurisé</strong> - Cette page est réservée aux administrateurs du système.
            </p>
            <div className="back-links">
              <a href="/" className="link">← Retour à l'accueil</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
