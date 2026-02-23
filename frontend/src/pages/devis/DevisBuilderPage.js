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

  // Répondre au message utilisateur dans le chatbot
  const repondreAuMessage = (userMessage) => {
    const msg = userMessage.toLowerCase().trim();
    const step = etapeActuelle;

    // Ajouter le message du client dans la conversation
    const userEntry = {
      timestamp: new Date(),
      type: 'reponse',
      source: 'client',
      message: userMessage
    };

    // Générer une réponse contextuelle selon l'étape et le message
    let reponse = '';
    if (msg.includes('aide') || msg.includes('help') || msg.includes('comment')) {
      const aides = {
        informations: 'Renseignez vos coordonnées complètes pour que nous puissions vous contacter. Votre email sera utilisé pour vous envoyer le devis final.',
        type_evenement: 'Choisissez le type d\'événement qui correspond le mieux à votre projet (mariage, anniversaire, concert…). Cela nous aide à vous proposer les prestations adaptées.',
        date_lieu: 'Indiquez la date prévue et le lieu de votre événement. Plus les informations sont précises, plus notre offre sera personnalisée.',
        invites: 'Le nombre d\'invités nous permet de calibrer les équipements et le personnel nécessaires.',
        prestations: 'Parcourez notre catalogue et sélectionnez les prestations qui vous intéressent. Vous pouvez filtrer par catégorie. Le total s\'actualise en temps réel à droite.',
        materiels: 'Sélectionnez les équipements dont vous avez besoin (sono, éclairage, scène…). Vous pouvez préciser les dates de location.',
        demandes_speciales: 'Décrivez toute demande particulière : thème spécifique, contraintes techniques, préférences artistiques…',
        recapitulatif: 'Vérifiez l\'ensemble de votre devis avant de le soumettre.',
        validation: 'Lisez les conditions et soumettez votre devis. Notre équipe reviendra vers vous sous 24-48h.'
      };
      reponse = aides[step] || 'Je suis là pour vous guider ! N\'hésitez pas à me poser vos questions.';
    } else if (msg.includes('prix') || msg.includes('tarif') || msg.includes('coût') || msg.includes('combien')) {
      reponse = 'Les tarifs dépendent des prestations et équipements sélectionnés. Le récapitulatif à droite vous montre une estimation en temps réel. Notre équipe peut ajuster les prix selon vos besoins spécifiques.';
    } else if (msg.includes('délai') || msg.includes('quand') || msg.includes('combien de temps')) {
      reponse = 'Après soumission, notre équipe analyse votre devis sous 24-48h et vous envoie une offre personnalisée par email. Nous pouvons également organiser un entretien si vous le souhaitez.';
    } else if (msg.includes('presta') || msg.includes('service') || msg.includes('propose')) {
      reponse = 'Nous proposons : sonorisation, éclairage, animation, scène, mobilier événementiel, et bien plus ! À l\'étape "Prestations", vous trouverez tout notre catalogue avec les tarifs.';
    } else if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello')) {
      reponse = `Bonjour ! 😊 Je suis ravi de vous accompagner dans la création de votre devis. Vous êtes actuellement à l'étape "${step.replace(/_/g, ' ')}". Comment puis-je vous aider ?`;
    } else if (msg.includes('merci') || msg.includes('super') || msg.includes('parfait')) {
      reponse = 'Avec plaisir ! 🌟 N\'hésitez pas si vous avez d\'autres questions.';
    } else if (msg.includes('annuler') || msg.includes('recommencer')) {
      reponse = 'Si vous souhaitez recommencer, vous pouvez recharger la page. Vos données seront conservées si vous êtes connecté.';
    } else {
      // Réponse par défaut selon l'étape
      const defaults = {
        informations: 'Pour cette étape, renseignez vos informations personnelles. Avez-vous besoin d\'aide pour remplir un champ ?',
        type_evenement: 'Quel type d\'événement organisez-vous ? Je peux vous conseiller sur les prestations les plus adaptées !',
        date_lieu: 'La date et le lieu sont importants pour vérifier la disponibilité de nos équipes.',
        invites: 'Le nombre d\'invités influencera la capacité des équipements recommandés.',
        prestations: 'Besoin d\'aide pour choisir une prestation ? Décrivez votre événement et je vous suggère ce qui convient !',
        materiels: 'Quel type de matériel cherchez-vous ? Sono, éclairage, structure scénique ?',
        demandes_speciales: 'N\'hésitez pas à être précis sur vos attentes, notre équipe en tiendra compte.',
        recapitulatif: 'Relisez bien chaque section. Vous pouvez revenir en arrière pour modifier.',
        validation: 'Prêt à soumettre votre devis ? Notre équipe reviendra vers vous très rapidement !'
      };
      reponse = defaults[step] || 'Je suis là pour vous aider ! Posez-moi vos questions sur le devis.';
    }

    const botEntry = {
      timestamp: new Date(),
      type: 'question',
      source: 'guide',
      message: reponse
    };

    setConversation(prev => [...prev, userEntry, botEntry]);
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
        return <PrestationsSelecteur {...props} onMontantsChange={setMontants} />;
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
            <ConversationAssistant messages={conversation} onUserMessage={repondreAuMessage} />

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
