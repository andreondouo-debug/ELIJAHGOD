import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClientContext } from '../context/ClientContext';
import './SignupPage.css';

/**
 * ✍️ PAGE D'INSCRIPTION CLIENT
 */
function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useContext(ClientContext);

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    adresse: '',
    entreprise: ''
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.prenom,
        formData.nom,
        formData.email,
        formData.password,
        formData.telephone,
        formData.adresse,
        formData.entreprise
      );
      
      // Rediriger vers le dashboard avec message de succès
      navigate('/client/dashboard', {
        state: { message: 'Compte créé! Vérifiez votre email pour activer votre compte.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <h1>Créer un compte</h1>
          <p className="subtitle">Rejoignez ElijahGod Events</p>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="123 rue de la Paix, Paris"
              />
            </div>

            <div className="form-group">
              <label htmlFor="entreprise">Entreprise (optionnel)</label>
              <input
                type="text"
                id="entreprise"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="signup-links">
            Vous avez déjà un compte ?
            <Link to="/client/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
