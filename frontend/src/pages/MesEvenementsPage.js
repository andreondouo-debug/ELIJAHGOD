import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { PrestataireContext } from '../context/PrestataireContext';
import { EvenementContext } from '../context/EvenementContext';
import { API_URL } from '../config';
import EvenementFormModal from '../components/evenements/EvenementFormModal';
import EvenementDetailPage from '../components/evenements/EvenementDetailPage';
import EvenementParametres from '../components/evenements/EvenementParametres';
import './MesEvenements.css';

/**
 * 📅 PAGE MES ÉVÉNEMENTS
 * Onglet Agenda avec calendrier, liste, détail, paramètres
 * Accessible Admin + Prestataire uniquement
 */

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_NOMS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const COULEURS_RAPIDES = ['#667eea', '#d4af37', '#48bb78', '#fc5c65', '#f7b731', '#a55eea', '#2bcbba', '#fd9644'];

function MesEvenementsPage() {
  const navigate = useNavigate();
  const { admin, isAuthenticated: isAdmin, loading: loadingAdmin } = useContext(AdminContext);
  const { prestataire, isAuthenticated: isPrestataire, loading: loadingPrestataire } = useContext(PrestataireContext);
  const { evenements, loading, chargerEvenements, evenementActif, setEvenementActif } = useContext(EvenementContext);

  const [onglet, setOnglet] = useState('calendrier'); // calendrier | liste | detail | parametres
  const [moisActuel, setMoisActuel] = useState(new Date().getMonth());
  const [anneeActuelle, setAnneeActuelle] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [showFeedUrl, setShowFeedUrl] = useState(false);
  const [feedCopied, setFeedCopied] = useState(false);

  const isAuth = isAdmin || isPrestataire;
  const loadingAuth = loadingAdmin || loadingPrestataire;

  // Redirection si non authentifié
  useEffect(() => {
    if (!loadingAuth && !isAuth) {
      navigate('/');
    }
  }, [loadingAuth, isAuth, navigate]);

  // Charger les événements
  const recharger = useCallback(() => {
    const filtres = {};
    if (moisActuel !== undefined) filtres.mois = moisActuel + 1;
    if (anneeActuelle) filtres.annee = anneeActuelle;
    if (filtreStatut) filtres.statut = filtreStatut;
    chargerEvenements(filtres);
  }, [moisActuel, anneeActuelle, filtreStatut, chargerEvenements]);

  useEffect(() => {
    if (isAuth) recharger();
  }, [isAuth, recharger]);

  // Navigation mois
  const moisPrecedent = () => {
    if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a - 1); }
    else setMoisActuel(m => m - 1);
  };

  const moisSuivant = () => {
    if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a + 1); }
    else setMoisActuel(m => m + 1);
  };

  const allerAujourdhui = () => {
    const now = new Date();
    setMoisActuel(now.getMonth());
    setAnneeActuelle(now.getFullYear());
  };

  // Générer les jours du calendrier
  const genererJoursCalendrier = () => {
    const premierJour = new Date(anneeActuelle, moisActuel, 1);
    const dernierJour = new Date(anneeActuelle, moisActuel + 1, 0);

    let debutSemaine = premierJour.getDay();
    debutSemaine = debutSemaine === 0 ? 6 : debutSemaine - 1; // Lundi = 0

    const jours = [];

    // Jours du mois précédent
    const moisPrec = new Date(anneeActuelle, moisActuel, 0);
    for (let i = debutSemaine - 1; i >= 0; i--) {
      jours.push({
        jour: moisPrec.getDate() - i,
        date: new Date(anneeActuelle, moisActuel - 1, moisPrec.getDate() - i),
        autreMois: true
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= dernierJour.getDate(); i++) {
      jours.push({
        jour: i,
        date: new Date(anneeActuelle, moisActuel, i),
        autreMois: false
      });
    }

    // Jours du mois suivant
    const restant = 42 - jours.length;
    for (let i = 1; i <= restant; i++) {
      jours.push({
        jour: i,
        date: new Date(anneeActuelle, moisActuel + 1, i),
        autreMois: true
      });
    }

    return jours;
  };

  // Événements pour un jour donné
  const evtsDuJour = (date) => {
    return evenements.filter(e => {
      const d = new Date(e.dateDebut);
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear();
    });
  };

  // Ouvrir détail
  const ouvrirDetail = (evt) => {
    setEvenementActif(evt);
    setOnglet('detail');
  };

  // Créer / Modifier
  const ouvrirCreation = () => {
    setEditEvent(null);
    setShowModal(true);
  };

  const ouvrirEdition = (evt) => {
    setEditEvent(evt);
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setEditEvent(null);
    recharger();
  };

  // Vérifier aujourd'hui
  const estAujourdhui = (date) => {
    const now = new Date();
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  };

  if (loadingAuth) {
    return (
      <div className="mes-evenements-page">
        <div className="evt-loading">
          <div className="evt-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) return null;

  const nbEvenements = evenements.length;
  const nbEnCours = evenements.filter(e => e.statut === 'en_cours' || e.statut === 'en_preparation').length;

  return (
    <div className="mes-evenements-page">
      {/* ── Topbar ── */}
      <div className="evt-topbar">
        <div className="evt-topbar-left">
          <span className="evt-topbar-icon">📅</span>
          <h1>Mes Événements</h1>
        </div>
        <div className="evt-topbar-right">
          <button className="evt-sync-btn ical" onClick={async () => {
            if (showFeedUrl) { setShowFeedUrl(false); return; }
            try {
              const token = localStorage.getItem('adminToken') || localStorage.getItem('prestataireToken');
              const res = await fetch(`${API_URL}/api/evenements/ical-token`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                setFeedUrl(data.feedUrl);
                setShowFeedUrl(true);
              }
            } catch (e) { console.error(e); }
          }} title="Obtenir le lien d'abonnement ICS">
            🔗 Lien ICS
          </button>
          <button className="evt-sync-btn ical" onClick={async () => {
            try {
              const token = localStorage.getItem('adminToken') || localStorage.getItem('prestataireToken');
              const res = await fetch(`${API_URL}/api/evenements/export/ical-all`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'elijahgod-agenda.ics';
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (e) { console.error(e); }
          }} title="Télécharger le fichier .ics">
            📅 Télécharger .ics
          </button>
          <button className="evt-btn-primary" onClick={ouvrirCreation}>
            ➕ Nouvel événement
          </button>
        </div>
      </div>

      {/* Barre URL d'abonnement ICS */}
      {showFeedUrl && (
        <div className="evt-feed-bar">
          <div className="evt-feed-info">
            <strong>🔗 Lien d'abonnement ICS</strong>
            <span>Collez ce lien dans votre application calendrier pour synchroniser automatiquement</span>
          </div>
          <div className="evt-feed-url-row">
            <input
              className="evt-feed-url-input"
              value={feedUrl}
              readOnly
              onClick={e => e.target.select()}
            />
            <button
              className="evt-btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(feedUrl);
                setFeedCopied(true);
                setTimeout(() => setFeedCopied(false), 2500);
              }}
            >
              {feedCopied ? '✅ Copié !' : '📋 Copier'}
            </button>
            <button className="evt-btn-secondary" onClick={() => setShowFeedUrl(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="evt-tabs">
        <button className={`evt-tab ${onglet === 'calendrier' ? 'active' : ''}`} onClick={() => setOnglet('calendrier')}>
          📅 Calendrier
        </button>
        <button className={`evt-tab ${onglet === 'liste' ? 'active' : ''}`} onClick={() => setOnglet('liste')}>
          📋 Liste
          {nbEvenements > 0 && <span className="evt-tab-badge">{nbEvenements}</span>}
        </button>
        {evenementActif && (
          <button className={`evt-tab ${onglet === 'detail' ? 'active' : ''}`} onClick={() => setOnglet('detail')}>
            📌 Détail
          </button>
        )}
        <button className={`evt-tab ${onglet === 'parametres' ? 'active' : ''}`} onClick={() => setOnglet('parametres')}>
          ⚙️ Paramétrage
        </button>
      </div>

      {/* ── Contenu ── */}
      {onglet === 'calendrier' && (
        <div className="evt-content">
          {/* Header calendrier */}
          <div className="evt-calendar-header">
            <div className="evt-calendar-nav">
              <button className="evt-btn-icon" onClick={moisPrecedent}>◀</button>
              <h2>{MOIS_NOMS[moisActuel]} {anneeActuelle}</h2>
              <button className="evt-btn-icon" onClick={moisSuivant}>▶</button>
              <button className="evt-btn-secondary" onClick={allerAujourdhui}>Aujourd'hui</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--evt-text-dim)' }}>
                {nbEnCours > 0 ? `${nbEnCours} en cours` : 'Aucun événement en cours'}
              </span>
            </div>
          </div>

          {/* Grille calendrier */}
          <div className="evt-calendar-grid">
            {JOURS.map(j => (
              <div key={j} className="evt-calendar-day-header">{j}</div>
            ))}
            {genererJoursCalendrier().map((jour, idx) => {
              const evts = evtsDuJour(jour.date);
              return (
                <div
                  key={idx}
                  className={`evt-calendar-day ${jour.autreMois ? 'other-month' : ''} ${estAujourdhui(jour.date) ? 'today' : ''}`}
                  onClick={() => {
                    if (evts.length === 1) ouvrirDetail(evts[0]);
                    else if (evts.length > 1) setOnglet('liste');
                  }}
                >
                  <div className="evt-calendar-day-number">{jour.jour}</div>
                  {evts.slice(0, 2).map(e => (
                    <div
                      key={e._id}
                      className="evt-calendar-day-event"
                      style={{ background: e.couleur || '#667eea', color: '#fff' }}
                      onClick={(ev) => { ev.stopPropagation(); ouvrirDetail(e); }}
                    >
                      {e.titre}
                    </div>
                  ))}
                  {evts.length > 2 && (
                    <div className="evt-calendar-day-more">+{evts.length - 2} autres</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Légende couleurs */}
          <div className="evt-calendar-legend">
            <span className="evt-legend-item"><span className="evt-legend-dot" style={{ background: '#f7b731' }} /> Proposition</span>
            <span className="evt-legend-item"><span className="evt-legend-dot" style={{ background: '#667eea' }} /> Prévision</span>
            <span className="evt-legend-item"><span className="evt-legend-dot" style={{ background: '#48bb78' }} /> Confirmé</span>
            <span className="evt-legend-item"><span className="evt-legend-dot" style={{ background: '#fc5c65' }} /> Annulé</span>
          </div>
        </div>
      )}

      {onglet === 'liste' && (
        <div className="evt-content">
          {/* Filtres */}
          <div className="evt-filter-bar">
            <select className="evt-form-select evt-filter-select" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="proposition">🟡 Proposition</option>
              <option value="prevision">🔵 Prévision</option>
              <option value="confirme">🟢 Confirmé</option>
              <option value="brouillon">Brouillon</option>
              <option value="planifie">Planifié</option>
              <option value="en_preparation">En préparation</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
            <button className="evt-btn-secondary" onClick={recharger}>🔄 Actualiser</button>
          </div>

          {loading ? (
            <div className="evt-loading"><div className="evt-spinner" /><p>Chargement...</p></div>
          ) : evenements.length === 0 ? (
            <div className="evt-empty">
              <div className="evt-empty-icon">📅</div>
              <h3>Aucun événement</h3>
              <p>Créez votre premier événement pour commencer à organiser votre agenda.</p>
              <button className="evt-btn-primary" onClick={ouvrirCreation} style={{ marginTop: '1rem' }}>
                ➕ Créer un événement
              </button>
            </div>
          ) : (
            <div className="evt-list">
              {evenements.map(evt => (
                <div key={evt._id} className="evt-list-card" onClick={() => ouvrirDetail(evt)}>
                  <div className="evt-list-card-color" style={{ background: evt.couleur || '#667eea' }} />
                  <div className="evt-list-card-body">
                    <div className="evt-list-card-title">{evt.titre}</div>
                    {evt.description && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--evt-text-dim)', marginTop: '0.2rem' }}>
                        {evt.description.substring(0, 100)}{evt.description.length > 100 ? '...' : ''}
                      </div>
                    )}
                    <div className="evt-list-card-meta">
                      <span>📅 {new Date(evt.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>🕐 {evt.heureDebut} – {evt.heureFin}</span>
                      {evt.lieu?.nom && <span>📍 {evt.lieu.nom}</span>}
                      {evt.nbInvites && <span>👥 {evt.nbInvites} invités</span>}
                    </div>
                    <div className="evt-list-card-badges">
                      <span className={`evt-badge ${evt.statut}`}>{evt.statut.replace('_', ' ')}</span>
                      {evt.type && <span className="evt-badge evt-badge-type">{evt.type}</span>}
                      {evt.todos?.length > 0 && (
                        <span className="evt-badge planifie">
                          ✓ {evt.todos.filter(t => t.fait).length}/{evt.todos.length} tâches
                        </span>
                      )}
                      {evt.commandesLiees?.length > 0 && (
                        <span className="evt-badge termine">📦 {evt.commandesLiees.length} commande{evt.commandesLiees.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {onglet === 'detail' && evenementActif && (
        <EvenementDetailPage
          onRetour={() => setOnglet('liste')}
          onEditer={() => ouvrirEdition(evenementActif)}
          recharger={recharger}
        />
      )}

      {onglet === 'parametres' && (
        <div className="evt-content">
          <EvenementParametres />
        </div>
      )}

      {/* ── Modal Création/Édition ── */}
      {showModal && (
        <EvenementFormModal
          evenement={editEvent}
          onFermer={fermerModal}
        />
      )}
    </div>
  );
}

export default MesEvenementsPage;
