import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PrestataireContext } from '../context/PrestataireContext';
import './LoginPage.css';

/**
 * 🔐 PAGE DE CONNEXION PRESTATAIRE
 */
function PrestataireLoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(PrestataireContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/prestataire/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Connexion Prestataire</h1>
          <p className="subtitle">Accédez à votre espace fournisseur</p>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-links">
            <Link to="/prestataire/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </div>

          <div className="signup-links">
            Pas encore prestataire ?
            <Link to="/prestataire/inscription">Créer un compte</Link>
          </div>

          <div className="signup-links">
            Vous êtes un client ?
            <Link to="/client/login">Se connecter en tant que client</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrestataireLoginPage;
