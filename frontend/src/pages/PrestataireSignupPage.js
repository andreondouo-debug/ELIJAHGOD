import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PrestataireContext } from '../context/PrestataireContext';
import './SignupPage.css';

/**
 * ✍️ PAGE D'INSCRIPTION PRESTATAIRE (FOURNISSEUR)
 */
function PrestataireSignupPage() {
  const navigate = useNavigate();
  const { signup } = useContext(PrestataireContext);

  const [formData, setFormData] = useState({
    nomEntreprise: '',
    categorie: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    adresse: '',
    ville: '',
    codePostal: '',
    specialites: '',
    description: '',
    siret: ''
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
      // Convertir spécialités en tableau
      const dataToSend = {
        ...formData,
        specialites: formData.specialites.split(',').map(s => s.trim())
      };
      delete dataToSend.confirmPassword;

      await signup(dataToSend);
      
      // Rediriger vers le dashboard avec message de succès
      navigate('/prestataire/dashboard', {
        state: { message: '✅ Compte créé! Vérifiez votre email pour activer votre compte.' }
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
          <h1>Devenir Prestataire</h1>
          <p className="subtitle">Rejoignez notre réseau de fournisseurs ElijahGod Events</p>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-section">
              <h3>Informations entreprise</h3>
              
              <div className="form-group">
                <label htmlFor="nomEntreprise">Nom de l'entreprise *</label>
                <input
                  type="text"
                  id="nomEntreprise"
                  name="nomEntreprise"
                  value={formData.nomEntreprise}
                  onChange={handleChange}
                  placeholder="Ex: Traiteur Dupont"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="categorie">Catégorie *</label>
                <select
                  id="categorie"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">-- Sélectionnez une catégorie --</option>
                  <option value="DJ">DJ</option>
                  <option value="Photographe">Photographe</option>
                  <option value="Vidéaste">Vidéaste</option>
                  <option value="Animateur">Animateur</option>
                  <option value="Groupe de louange">Groupe de louange</option>
                  <option value="Wedding planner">Wedding planner</option>
                  <option value="Traiteur">Traiteur</option>
                  <option value="Sonorisation">Sonorisation</option>
                  <option value="Éclairage">Éclairage</option>
                  <option value="Décoration">Décoration</option>
                  <option value="Location matériel">Location matériel</option>
                  <option value="Autre">Autre</option>
                </select>
                <small>Choisissez la catégorie principale de votre entreprise</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="siret">SIRET</label>
                  <input
                    type="text"
                    id="siret"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    placeholder="123 456 789 00010"
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
              </div>
            </div>

            <div className="form-section">
              <h3>Contact principal</h3>
              
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
                  placeholder="contact@entreprise.com"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Adresse</h3>
              
              <div className="form-group">
                <label htmlFor="adresse">Rue *</label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="123 rue de la Paix"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codePostal">Code Postal *</label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    placeholder="75001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ville">Ville *</label>
                  <input
                    type="text"
                    id="ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="Paris"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Services</h3>
              
              <div className="form-group">
                <label htmlFor="specialites">Spécialités * (séparées par des virgules)</label>
                <input
                  type="text"
                  id="specialites"
                  name="specialites"
                  value={formData.specialites}
                  onChange={handleChange}
                  placeholder="Ex: Traiteur, Sonorisation, Décoration"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description de vos services</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez vos services et votre expérience..."
                  rows={4}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Sécurité</h3>
              
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
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte prestataire'}
            </button>
          </form>

          <div className="signup-links">
            Vous avez déjà un compte prestataire ?
            <Link to="/prestataire/login">Se connecter</Link>
          </div>

          <div className="signup-links">
            Vous êtes un client ?
            <Link to="/client/inscription">Créer un compte client</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrestataireSignupPage;
