import React, { useState, useContext, useEffect } from 'react';
import {
  MessageCircle, Mail, Phone, User, ClipboardList, DollarSign,
  Info, Handshake, AlertTriangle, MessageSquare, Send, Clock,
  MapPin, Calendar, Rocket, Globe, Loader2, CheckCircle2
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import './ContactPage.css';

function ContactPage() {
  const { settings } = useContext(SettingsContext);
  const heroConfig = settings?.pages?.contact?.hero;

  // Animation du hero au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.section-animated[data-animation]').forEach(el => {
        const animType = el.dataset.animation;
        if (animType && animType !== 'none') {
          el.classList.add(`animate-${animType}`);
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [heroConfig]);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    // TODO: Implémenter l'envoi du formulaire
    setTimeout(() => {
      setStatus('success');
      setFormData({ nom: '', prenom: '', email: '', telephone: '', sujet: '', message: '' });
    }, 1500);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section
        className={`contact-hero${heroConfig?.animation?.type && heroConfig.animation.type !== 'none' ? ' section-animated' : ''}`}
        data-animation={heroConfig?.animation?.type || 'none'}
        style={{
          backgroundColor: heroConfig?.couleurs?.arrierePlan || undefined,
          '--animation-duration': `${heroConfig?.animation?.duration || 800}ms`,
          '--animation-delay': `${heroConfig?.animation?.delay || 0}ms`,
        }}
      >
        <div className="container">
          <h1 className="page-title" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.titre || 'Contactez-nous'}
          </h1>
          <p className="page-subtitle" style={{ color: heroConfig?.couleurs?.texte || undefined }}>
            {heroConfig?.sousTitre || 'Une question, un projet ? Nous sommes là pour vous accompagner !'}
          </p>
        </div>
      </section>

      <div className="container">
        <div className="contact-grid">
          {/* Formulaire */}
          <div className="contact-form-section">
            <div className="section-header">
              <h2>
                <Mail size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Envoyez-nous un message
              </h2>
              <p>Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais</p>
            </div>

            {status === 'success' && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prenom">
                    <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nom">
                    <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telephone">
                    <Phone size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sujet">
                  <ClipboardList size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Sujet *
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="devis">Demande de devis</option>
                  <option value="info">Demande d'information</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="reclamation">Réclamation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <MessageSquare size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Décrivez votre projet ou votre demande..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={status === 'sending'}
              >
                {status === 'sending'
                  ? <><Loader2 size={15} style={{ verticalAlign: 'middle', marginRight: 5, animation: 'spin 1s linear infinite' }} /> Envoi en cours...</>
                  : <><Send size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Envoyer le message</>
                }
              </button>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="contact-info-section">
            <div className="info-card">
              <h3><MapPin size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#d4af37' }} /> Nos Coordonnées</h3>
              <div className="info-items">
                {settings?.contact?.email && (
                  <div className="info-item">
                    <div className="info-icon"><Mail size={18} /></div>
                    <div className="info-content">
                      <strong>Email</strong>
                      <a href={`mailto:${settings.contact.email}`}>
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact?.telephone && (
                  <div className="info-item">
                    <div className="info-icon"><Phone size={18} /></div>
                    <div className="info-content">
                      <strong>Téléphone</strong>
                      <a href={`tel:${settings.contact.telephone}`}>
                        {settings.contact.telephone}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact?.adresse && (
                  <div className="info-item">
                    <div className="info-icon"><MapPin size={18} /></div>
                    <div className="info-content">
                      <strong>Adresse</strong>
                      <p>
                        {settings.contact.adresse.rue && `${settings.contact.adresse.rue}, `}
                        {settings.contact.adresse.codePostal} {settings.contact.adresse.ville}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3><Clock size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#d4af37' }} /> Horaires d'ouverture</h3>
              <div className="horaires-list">
                <div className="horaire-item">
                  <span className="jour"><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Lundi - Vendredi</span>
                  <span className="heure">9h00 - 18h00</span>
                </div>
                <div className="horaire-item">
                  <span className="jour"><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Samedi</span>
                  <span className="heure">10h00 - 16h00</span>
                </div>
                <div className="horaire-item">
                  <span className="jour"><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Dimanche</span>
                  <span className="heure">Fermé</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3><Rocket size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#d4af37' }} /> Réponse rapide</h3>
              <p className="response-info">
                 Notre équipe s'engage à vous répondre sous 24h ouvrées.
                Pour les urgences, n'hésitez pas à nous contacter par téléphone.
              </p>
            </div>

            {settings?.reseauxSociaux && (
              <div className="info-card">
                <h3><Globe size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#d4af37' }} /> Suivez-nous</h3>
                <div className="social-links">
                  {settings.reseauxSociaux.facebook && (
                    <a href={settings.reseauxSociaux.facebook} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                      Facebook
                    </a>
                  )}
                  {settings.reseauxSociaux.instagram && (
                    <a href={settings.reseauxSociaux.instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                      Instagram
                    </a>
                  )}
                  {settings.reseauxSociaux.youtube && (
                    <a href={settings.reseauxSociaux.youtube} target="_blank" rel="noopener noreferrer" className="social-btn youtube">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
