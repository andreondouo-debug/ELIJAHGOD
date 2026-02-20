import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClientContext } from '../../context/ClientContext';
import ProgressBar from '../../components/devis/ProgressBar';
import ConversationAssistant from '../../components/devis/ConversationAssistant';
import MontantSidebar from '../../components/devis/MontantSidebar';
import InformationsForm from '../../components/devis/steps/InformationsForm';
import TypeEvenementForm from '../../components/devis/steps/TypeEvenementForm';
import DateLieuForm from '../../components/devis/steps/DateLieuForm';
import InvitesForm from '../../components/devis/steps/InvitesForm';
import PrestationsSelecteur from '../../components/devis/steps/PrestationsSelecteur';
import MaterielsSelecteur from '../../components/devis/steps/MaterielsSelecteur';
import DemandesSpecialesForm from '../../components/devis/steps/DemandesSpecialesForm';
import RecapitulatifForm from '../../components/devis/steps/RecapitulatifForm';
import ValidationForm from '../../components/devis/steps/ValidationForm';
import './DevisBuilderPage.css';

/**
 * 📝 PAGE CONSTRUCTEUR DE DEVIS INTERACTIF
 * Wizard guidé avec assistant conversationnel
 */

const ETAPES = [
  'informations',
  'type_evenement',
  'date_lieu',
  'invites',
  'prestations',
  'materiels',
  'demandes_speciales',
  'recapitulatif',
  'validation'
];

function DevisBuilderPage() {
  const navigate = useNavigate();
  const { client, token, isAuthenticated, API_URL } = useContext(ClientContext);

  const [devisId, setDevisId] = useState(null);
  const [etapeActuelle, setEtapeActuelle] = useState('informations');
  const [progression, setProgression] = useState(0);
  const [devisData, setDevisData] = useState({
    client: {},
    evenement: {},
    prestations: [],
    materiels: [],
    demandesClient: {},
    entretien: {}
  });
  const [montants, setMontants] = useState({});
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Créer le brouillon au montage
  useEffect(() => {
    creerBrouillon();
  }, []);

  // Créer un nouveau devis en brouillon
  const creerBrouillon = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const clientData = isAuthenticated
        ? {} // Si connecté, le backend utilise le token
        : { client: {} }; // Si non connecté, on remplira plus tard

      const response = await axios.post(
        `${API_URL}/api/devis/brouillon`,
        clientData,
        { headers }
      );

      setDevisId(response.data.devis._id);
      setEtapeActuelle(response.data.devis.etapeActuelle);
      setProgression(response.data.devis.progressionPourcentage);

      // Message de bienvenue
      setConversation([
        {
          timestamp: new Date(),
          type: 'question',
          source: 'guide',
          message: isAuthenticated
            ? `Bonjour ${client?.prenom} ! 👋 Je vais vous guider étape par étape pour créer votre devis personnalisé. Nous allons commencer par les détails de votre événement.`
            : `Bonjour ! 👋 Je vais vous guider étape par étape pour créer votre devis. Pas besoin de compte, vous pourrez en créer un plus tard. Commençons par vos informations de contact.`
        }
      ]);
    } catch (err) {
      setError('Impossible de créer le devis. Veuillez réessayer.');
      console.error('❌ Erreur création brouillon:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une étape et avancer
  const sauvegarderEtape = async (data) => {
    if (!devisId) return;

    setLoading(true);
    setError('');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(
        `${API_URL}/api/devis/${devisId}/etape`,
        {
          etape: etapeActuelle,
          data
        },
        { headers }
      );

      // Mettre à jour les données
      setDevisData(prevData => ({
        ...prevData,
        ...data
      }));

      setEtapeActuelle(response.data.devis.etapeActuelle);
      setProgression(response.data.devis.progressionPourcentage);

      // Ajouter les montants si disponibles
      if (response.data.devis.montants) {
        setMontants(response.data.devis.montants);
      }

      // Ajouter la conversation
      if (response.data.devis.conversation) {
        setConversation(response.data.devis.conversation);
      }

      // Scroller en haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      console.error('❌ Erreur sauvegarde étape:', err);
    } finally {
      setLoading(false);
    }
  };

  // Retour à l'étape précédente
  const etapePrecedente = () => {
    const currentIndex = ETAPES.indexOf(etapeActuelle);
    if (currentIndex > 0) {
      setEtapeActuelle(ETAPES[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Soumettre le devis final
  const soumettre = async () => {
    if (!devisId) return;

    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(
        `${API_URL}/api/devis/${devisId}/soumettre`,
        {},
        { headers }
      );

      // Rediriger vers la page de confirmation
      navigate(`/devis/${devisId}/confirmation`, {
        state: { 
          numeroDevis: response.data.devis.numeroDevis,
          message: response.data.message
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      console.error('❌ Erreur soumission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rendu du formulaire selon l'étape
  const renderEtape = () => {
    const props = {
      data: devisData,
      onNext: sauvegarderEtape,
      onPrevious: etapePrecedente,
      loading
    };

    switch (etapeActuelle) {
      case 'informations':
        return <InformationsForm {...props} isAuthenticated={isAuthenticated} />;
      case 'type_evenement':
        return <TypeEvenementForm {...props} />;
      case 'date_lieu':
        return <DateLieuForm {...props} />;
      case 'invites':
        return <InvitesForm {...props} />;
      case 'prestations':
        return <PrestationsSelecteur {...props} />;
      case 'materiels':
        return <MaterielsSelecteur {...props} />;
      case 'demandes_speciales':
        return <DemandesSpecialesForm {...props} />;
      case 'recapitulatif':
        return <RecapitulatifForm {...props} montants={montants} />;
      case 'validation':
        return <ValidationForm {...props} montants={montants} onSubmit={soumettre} />;
      default:
        return null;
    }
  };

  if (loading && !devisId) {
    return (
      <div className="devis-builder-loading">
        <div className="spinner"></div>
        <p>Initialisation de votre devis...</p>
      </div>
    );
  }

  return (
    <div className="devis-builder-page">
      <div className="devis-builder-container">
        {/* Barre de progression */}
        <ProgressBar 
          etapeActuelle={etapeActuelle} 
          progression={progression}
          etapes={ETAPES}
        />

        <div className="devis-builder-content">
          {/* Zone principale avec formulaire */}
          <div className="devis-builder-main">
            {/* Assistant conversationnel */}
            <ConversationAssistant messages={conversation} />

            {/* Message d'erreur */}
            {error && (
              <div className="error-banner">
                ❌ {error}
              </div>
            )}

            {/* Formulaire de l'étape actuelle */}
            <div className="step-form">
              {renderEtape()}
            </div>
          </div>

          {/* Sidebar avec montants */}
          <MontantSidebar montants={montants} />
        </div>
      </div>
    </div>
  );
}

export default DevisBuilderPage;
