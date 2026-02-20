import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClientContext } from '../context/ClientContext';
import './LoginPage.css';

/**
 * 🔐 PAGE DE CONNEXION CLIENT
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(ClientContext);

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
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/client/dashboard'); // Rediriger vers le dashboard après connexion
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Connexion</h1>
          <p className="subtitle">Accédez à votre espace client</p>

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
                placeholder="votre@email.com"
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
                minLength={6}
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
            <Link to="/client/forgot-password">Mot de passe oublié ?</Link>
            <span>•</span>
            <Link to="/client/signup">Créer un compte</Link>
          </div>

          <div className="divider">
            <span>ou</span>
          </div>

          <Link to="/devis/nouveau" className="btn-secondary">
            Créer un devis sans compte
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
