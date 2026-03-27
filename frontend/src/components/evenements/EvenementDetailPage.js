import { useState, useContext } from 'react';
import { EvenementContext } from '../../context/EvenementContext';
import { API_URL } from '../../config';
import '../../pages/MesEvenements.css';

const ETAPES_TYPES = [
  { value: 'transport', label: '🚛 Transport', icon: '🚛' },
  { value: 'installation', label: '🔧 Installation', icon: '🔧' },
  { value: 'mise_en_place', label: '📐 Mise en place', icon: '📐' },
  { value: 'prestation', label: '🎵 Prestation', icon: '🎵' },
  { value: 'rangement', label: '📦 Rangement', icon: '📦' },
  { value: 'autre', label: '📌 Autre', icon: '📌' },
];

const STATUTS = [
  { value: 'proposition', label: 'Proposition', icon: '🟡' },
  { value: 'prevision', label: 'Prévision', icon: '🔵' },
  { value: 'confirme', label: 'Confirmé', icon: '🟢' },
  { value: 'brouillon', label: 'Brouillon', icon: '📝' },
  { value: 'planifie', label: 'Planifié', icon: '📅' },
  { value: 'en_preparation', label: 'En préparation', icon: '🔨' },
  { value: 'en_cours', label: 'En cours', icon: '▶️' },
  { value: 'termine', label: 'Terminé', icon: '✅' },
  { value: 'annule', label: 'Annulé', icon: '❌' },
];

const PRIORITES = ['basse', 'normale', 'haute', 'urgente'];

function EvenementDetailPage({ onRetour, onEditer, recharger }) {
  const {
    evenementActif: evt,
    changerStatut, ajouterEtape, majEtape, supprimerEtape,
    ajouterTodo, majTodo, supprimerTodo,
    ajouterOutil, majOutil, supprimerOutil, supprimerEvenement
  } = useContext(EvenementContext);

  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriorite, setNewTodoPriorite] = useState('normale');
  const [newOutil, setNewOutil] = useState({ nom: '', categorie: '', quantite: 1 });
  const [newEtape, setNewEtape] = useState({ titre: '', type: 'autre', heureDebut: '', heureFin: '', description: '' });
  const [showAddEtape, setShowAddEtape] = useState(false);
  const [showAddOutil, setShowAddOutil] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!evt) return <div className="evt-empty"><p>Aucun événement sélectionné</p></div>;

  // Calcul progression todos
  const totalTodos = evt.todos?.length || 0;
  const todosFaits = evt.todos?.filter(t => t.fait).length || 0;
  const progression = totalTodos > 0 ? Math.round((todosFaits / totalTodos) * 100) : 0;

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    await ajouterTodo(evt._id, { texte: newTodo, priorite: newTodoPriorite });
    setNewTodo('');
    setNewTodoPriorite('normale');
  };

  const handleToggleTodo = async (todo) => {
    await majTodo(evt._id, todo._id, { fait: !todo.fait });
  };

  const handleDeleteTodo = async (todoId) => {
    await supprimerTodo(evt._id, todoId);
  };

  const handleAddOutil = async () => {
    if (!newOutil.nom.trim()) return;
    await ajouterOutil(evt._id, newOutil);
    setNewOutil({ nom: '', categorie: '', quantite: 1 });
    setShowAddOutil(false);
  };

  const handleToggleOutil = async (outil) => {
    await majOutil(evt._id, outil._id, { verifie: !outil.verifie });
  };

  const handleDeleteOutil = async (outilId) => {
    await supprimerOutil(evt._id, outilId);
  };

  const handleAddEtape = async () => {
    if (!newEtape.titre.trim()) return;
    await ajouterEtape(evt._id, { ...newEtape, ordre: (evt.programme?.length || 0) });
    setNewEtape({ titre: '', type: 'autre', heureDebut: '', heureFin: '', description: '' });
    setShowAddEtape(false);
  };

  const handleCycleEtapeStatut = async (etape) => {
    const cycle = ['a_faire', 'en_cours', 'termine'];
    const idx = cycle.indexOf(etape.statut || 'a_faire');
    const nextStatut = cycle[(idx + 1) % cycle.length];
    await majEtape(evt._id, etape._id, { statut: nextStatut });
  };

  const handleDeleteEtape = async (etapeId) => {
    await supprimerEtape(evt._id, etapeId);
  };

  const handleStatutChange = async (statut) => {
    await changerStatut(evt._id, statut);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await supprimerEvenement(evt._id);
    recharger();
    onRetour();
  };

  const outilsVerifies = evt.boiteAOutils?.filter(o => o.verifie).length || 0;
  const totalOutils = evt.boiteAOutils?.length || 0;

  // ── Adresse complète pour GPS ──
  const adresseComplete = evt.lieu
    ? [evt.lieu.adresse, evt.lieu.codePostal, evt.lieu.ville, evt.lieu.nom].filter(Boolean).join(', ')
    : '';
  const adresseEncoded = encodeURIComponent(adresseComplete);

  // ── URL Google Calendar ──
  const genererGoogleCalendarUrl = () => {
    const fmt = (d, h) => {
      const date = new Date(d);
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, '0');
      const da = String(date.getDate()).padStart(2, '0');
      if (h) {
        const [hh, mm] = h.split(':');
        return `${y}${mo}${da}T${hh.padStart(2, '0')}${(mm || '00').padStart(2, '0')}00`;
      }
      return `${y}${mo}${da}`;
    };
    const start = fmt(evt.dateDebut, evt.heureDebut);
    const end = evt.dateFin ? fmt(evt.dateFin, evt.heureFin) : fmt(evt.dateDebut, evt.heureFin);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evt.titre,
      dates: `${start}/${end}`,
      details: evt.description || '',
      location: adresseComplete,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // ── Télécharger .ics ──
  const telechargerICS = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('prestataireToken');
      const evtSettings = JSON.parse(localStorage.getItem('evenement_settings') || '{}');
      const rappelJours = evtSettings.rappelAutoJours || 1;
      const nombreRappels = evtSettings.nombreRappels || 1;
      const res = await fetch(`${API_URL}/api/evenements/${evt._id}/ical?rappelJours=${rappelJours}&nombreRappels=${nombreRappels}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${evt.titre.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur export iCal:', e);
    }
  };

  return (
    <div className="evt-detail">
      {/* ── Colonne principale ── */}
      <div className="evt-detail-main">
        {/* Hero */}
        <div className="evt-detail-hero" style={{ '--hero-color': evt.couleur || '#667eea' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: evt.couleur || '#667eea' }} />
          <button className="evt-btn-secondary" onClick={onRetour} style={{ marginBottom: '0.8rem', fontSize: '0.8rem' }}>← Retour</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`evt-badge ${evt.statut}`}>{STATUTS.find(s => s.value === evt.statut)?.icon} {evt.statut.replace('_', ' ')}</span>
            {evt.type && <span className="evt-badge evt-badge-type">{evt.type}</span>}
          </div>
          <h1>{evt.titre}</h1>
          <div className="evt-detail-hero-meta">
            <span>📅 {new Date(evt.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>🕐 {evt.heureDebut} – {evt.heureFin}</span>
            {evt.lieu?.nom && (
              <span className="evt-lieu-gps">
                📍 {evt.lieu.nom}{evt.lieu.ville ? `, ${evt.lieu.ville}` : ''}
                {adresseComplete && (
                  <span className="evt-gps-links">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${adresseEncoded}`}
                      target="_blank" rel="noopener noreferrer"
                      className="evt-gps-btn gmaps"
                      title="Ouvrir dans Google Maps"
                    >Maps</a>
                    <a
                      href={`https://waze.com/ul?q=${adresseEncoded}&navigate=yes`}
                      target="_blank" rel="noopener noreferrer"
                      className="evt-gps-btn waze"
                      title="Ouvrir dans Waze"
                    >Waze</a>
                  </span>
                )}
              </span>
            )}
            {evt.nbInvites && <span>👥 {evt.nbInvites} invités</span>}
          </div>
          {evt.description && <p style={{ marginTop: '0.8rem', color: 'var(--evt-text-dim)', fontSize: '0.88rem' }}>{evt.description}</p>}

          <div className="evt-detail-hero-actions">
            <button className="evt-btn-primary" onClick={onEditer}>✏️ Modifier</button>
            <select
              className="evt-form-select"
              value={evt.statut}
              onChange={e => handleStatutChange(e.target.value)}
              style={{ width: 'auto', minWidth: '150px', fontSize: '0.82rem' }}
            >
              {STATUTS.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
            </select>
            <button className="evt-btn-danger" onClick={handleDelete}>
              {confirmDelete ? '⚠️ Confirmer ?' : '🗑️ Supprimer'}
            </button>
          </div>

          {/* ── Synchronisation calendrier ── */}
          <div className="evt-sync-bar">
            <span className="evt-sync-label">📲 Synchroniser :</span>
            <button className="evt-sync-btn ical" onClick={telechargerICS} title="Télécharger .ics (Apple Calendar, Outlook)">
              📅 iCal / Outlook
            </button>
            <a className="evt-sync-btn gcal" href={genererGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" title="Ajouter à Google Calendar">
              🗓️ Google Calendar
            </a>
          </div>
        </div>

        {/* ── Programme / Timeline ── */}
        <div className="evt-section">
          <div className="evt-section-header">
            <h3>📋 Programme de l'événement</h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="evt-sync-btn ical" onClick={async () => {
                try {
                  const token = localStorage.getItem('adminToken') || localStorage.getItem('prestataireToken');
                  const res = await fetch(`${API_URL}/api/evenements/${evt._id}/programme-pdf`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `programme-${evt.titre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (e) { console.error('Erreur PDF programme:', e); }
              }} style={{ fontSize: '0.78rem' }} title="Télécharger le programme en PDF">
                🖨️ Imprimer PDF
              </button>
              <button className="evt-btn-secondary" onClick={() => setShowAddEtape(!showAddEtape)} style={{ fontSize: '0.8rem' }}>
                {showAddEtape ? '✕ Annuler' : '➕ Ajouter'}
              </button>
            </div>
          </div>
          <div className="evt-section-body">
            {showAddEtape && (
              <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid var(--evt-border)', borderRadius: 'var(--evt-radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label className="evt-form-label">Titre</label>
                    <input className="evt-form-input" value={newEtape.titre} onChange={e => setNewEtape(p => ({ ...p, titre: e.target.value }))} placeholder="Nom de l'étape" />
                  </div>
                  <div className="evt-form-group">
                    <label className="evt-form-label">Type</label>
                    <select className="evt-form-select" value={newEtape.type} onChange={e => setNewEtape(p => ({ ...p, type: e.target.value }))}>
                      {ETAPES_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="evt-form-row">
                  <div className="evt-form-group">
                    <label className="evt-form-label">Début</label>
                    <input className="evt-form-input" type="time" value={newEtape.heureDebut} onChange={e => setNewEtape(p => ({ ...p, heureDebut: e.target.value }))} />
                  </div>
                  <div className="evt-form-group">
                    <label className="evt-form-label">Fin</label>
                    <input className="evt-form-input" type="time" value={newEtape.heureFin} onChange={e => setNewEtape(p => ({ ...p, heureFin: e.target.value }))} />
                  </div>
                </div>
                <div className="evt-form-group">
                  <input className="evt-form-input" value={newEtape.description} onChange={e => setNewEtape(p => ({ ...p, description: e.target.value }))} placeholder="Description (optionnel)" />
                </div>
                <button className="evt-btn-primary" onClick={handleAddEtape}>✅ Ajouter l'étape</button>
              </div>
            )}

            {(!evt.programme || evt.programme.length === 0) ? (
              <div className="evt-section-empty">
                <p>📋 Aucune étape définie. Ajoutez les étapes de votre événement.</p>
              </div>
            ) : (
              <div className="evt-timeline">
                {evt.programme.map((etape) => (
                  <div key={etape._id} className="evt-timeline-item">
                    <div className={`evt-timeline-dot ${etape.type} ${etape.statut === 'termine' ? 'termine' : ''}`} />
                    <div className="evt-timeline-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="evt-timeline-title">{etape.titre}</span>
                        <span className={`evt-timeline-type-badge ${etape.type}`}>
                          {ETAPES_TYPES.find(t => t.value === etape.type)?.icon} {etape.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="evt-timeline-time">{etape.heureDebut}{etape.heureFin ? ` – ${etape.heureFin}` : ''}</span>
                    </div>
                    {etape.description && <div className="evt-timeline-desc">{etape.description}</div>}
                    <div className="evt-timeline-actions">
                      <button
                        className={`evt-step-status ${etape.statut || 'a_faire'}`}
                        onClick={() => handleCycleEtapeStatut(etape)}
                        title="Cliquer pour changer le statut"
                      >
                        {etape.statut === 'termine' ? '✅' : etape.statut === 'en_cours' ? '▶️' : '⬜'} {(etape.statut || 'a_faire').replace('_', ' ')}
                      </button>
                      <button className="evt-btn-icon" onClick={() => handleDeleteEtape(etape._id)} title="Supprimer" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Todo List / Workflow ── */}
        <div className="evt-section">
          <div className="evt-section-header">
            <h3>✅ Liste des tâches</h3>
            {totalTodos > 0 && <span style={{ fontSize: '0.82rem', color: 'var(--evt-gold)' }}>{todosFaits}/{totalTodos} terminées</span>}
          </div>
          <div className="evt-section-body">
            {/* Barre de progression */}
            {totalTodos > 0 && (
              <div className="evt-todo-progress">
                <div className="evt-todo-progress-bar">
                  <div className="evt-todo-progress-fill" style={{ width: `${progression}%` }} />
                </div>
                <span className="evt-todo-progress-text">{progression}%</span>
              </div>
            )}

            {/* Liste */}
            <ul className="evt-todo-list">
              {evt.todos?.map(todo => (
                <li key={todo._id} className="evt-todo-item">
                  <div className={`evt-todo-checkbox ${todo.fait ? 'done' : ''}`} onClick={() => handleToggleTodo(todo)}>
                    {todo.fait && '✓'}
                  </div>
                  <div className="evt-todo-body">
                    <div className={`evt-todo-text ${todo.fait ? 'done' : ''}`}>{todo.texte}</div>
                    <div className="evt-todo-meta">
                      <span className={`evt-todo-priority ${todo.priorite || 'normale'}`}>{todo.priorite || 'normale'}</span>
                      {todo.categorie && todo.categorie !== 'general' && <span>📁 {todo.categorie}</span>}
                      {todo.completeLe && <span>✓ {new Date(todo.completeLe).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>
                  <button className="evt-btn-icon" onClick={() => handleDeleteTodo(todo._id)} style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>✕</button>
                </li>
              ))}
            </ul>

            {(!evt.todos || evt.todos.length === 0) && (
              <div className="evt-section-empty">
                <p>📝 Aucune tâche. Ajoutez des tâches pour organiser votre workflow.</p>
              </div>
            )}

            {/* Ajout rapide */}
            <div className="evt-todo-add">
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Nouvelle tâche..."
                onKeyDown={e => { if (e.key === 'Enter') handleAddTodo(); }} />
              <select className="evt-form-select" value={newTodoPriorite} onChange={e => setNewTodoPriorite(e.target.value)}
                style={{ width: 'auto', minWidth: '110px' }}>
                {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button className="evt-btn-primary" onClick={handleAddTodo} style={{ padding: '0.6rem 1rem' }}>➕</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="evt-detail-sidebar">
        {/* 🧰 Boîte à outils */}
        <div className="evt-section">
          <div className="evt-section-header">
            <h3>🧰 Boîte à outils</h3>
            <button className="evt-btn-secondary" onClick={() => setShowAddOutil(!showAddOutil)} style={{ fontSize: '0.8rem' }}>
              {showAddOutil ? '✕' : '➕'}
            </button>
          </div>
          <div className="evt-section-body">
            {totalOutils > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '0.82rem', color: 'var(--evt-text-dim)' }}>
                <span style={{ color: 'var(--evt-green)', fontWeight: 600 }}>{outilsVerifies}/{totalOutils}</span> vérifié{outilsVerifies > 1 ? 's' : ''}
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalOutils > 0 ? (outilsVerifies / totalOutils * 100) : 0}%`, background: 'var(--evt-green)', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {showAddOutil && (
              <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid var(--evt-border)', borderRadius: 'var(--evt-radius-sm)', padding: '0.8rem', marginBottom: '0.8rem' }}>
                <input className="evt-form-input" value={newOutil.nom} onChange={e => setNewOutil(p => ({ ...p, nom: e.target.value }))}
                  placeholder="Nom de l'outil/matériel" style={{ marginBottom: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="evt-form-input" value={newOutil.categorie} onChange={e => setNewOutil(p => ({ ...p, categorie: e.target.value }))}
                    placeholder="Catégorie" style={{ flex: 1 }} />
                  <input className="evt-form-input" type="number" min="1" value={newOutil.quantite} onChange={e => setNewOutil(p => ({ ...p, quantite: parseInt(e.target.value) || 1 }))}
                    style={{ width: '60px' }} />
                </div>
                <button className="evt-btn-primary" onClick={handleAddOutil} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>✅ Ajouter</button>
              </div>
            )}

            {(!evt.boiteAOutils || evt.boiteAOutils.length === 0) ? (
              <div className="evt-section-empty" style={{ padding: '1.5rem' }}>
                <p>🧰 Préparez votre événement !</p>
                <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Listez le matériel et outils nécessaires.</p>
              </div>
            ) : (
              <div className="evt-toolbox-grid" style={{ gridTemplateColumns: '1fr' }}>
                {evt.boiteAOutils.map(outil => (
                  <div key={outil._id} className="evt-toolbox-item">
                    <div className={`evt-toolbox-check ${outil.verifie ? 'checked' : ''}`} onClick={() => handleToggleOutil(outil)}>
                      {outil.verifie && '✓'}
                    </div>
                    <div className="evt-toolbox-info">
                      <div className="evt-toolbox-name" style={{ opacity: outil.verifie ? 0.6 : 1 }}>{outil.nom}</div>
                      <div className="evt-toolbox-qty">
                        {outil.categorie && `${outil.categorie} · `}×{outil.quantite}
                      </div>
                    </div>
                    <button className="evt-btn-icon" onClick={() => handleDeleteOutil(outil._id)} style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 📦 Commandes liées */}
        <div className="evt-section">
          <div className="evt-section-header">
            <h3>📦 Commandes liées</h3>
          </div>
          <div className="evt-section-body">
            {(!evt.commandesLiees || evt.commandesLiees.length === 0) ? (
              <div className="evt-section-empty" style={{ padding: '1.5rem' }}>
                <p>Aucune commande liée</p>
                <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Liez des devis/commandes via le formulaire d'édition.</p>
              </div>
            ) : (
              <div className="evt-commandes-list">
                {evt.commandesLiees.map((cmd, i) => (
                  <div key={i} className="evt-commande-item">
                    <div>
                      <div className="evt-commande-client">{cmd.clientNom || 'Client'}</div>
                      {cmd.clientEmail && <div style={{ fontSize: '0.75rem', color: 'var(--evt-text-dim)' }}>{cmd.clientEmail}</div>}
                    </div>
                    <div>
                      {cmd.montant && <div className="evt-commande-montant">{cmd.montant.toLocaleString('fr-FR')} €</div>}
                      {cmd.statut && <span className={`evt-badge ${cmd.statut}`} style={{ fontSize: '0.65rem' }}>{cmd.statut}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🎵 Prestations liées */}
        {evt.prestationsLiees?.length > 0 && (
          <div className="evt-section">
            <div className="evt-section-header">
              <h3>🎵 Prestations</h3>
            </div>
            <div className="evt-section-body">
              {evt.prestationsLiees.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.nom}</span>
                  {p.prestataire && <span style={{ fontSize: '0.78rem', color: 'var(--evt-text-dim)' }}>{p.prestataire}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📝 Notes */}
        {evt.notes && (
          <div className="evt-section">
            <div className="evt-section-header">
              <h3>📝 Notes</h3>
            </div>
            <div className="evt-section-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--evt-text-dim)', whiteSpace: 'pre-wrap' }}>{evt.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EvenementDetailPage;
