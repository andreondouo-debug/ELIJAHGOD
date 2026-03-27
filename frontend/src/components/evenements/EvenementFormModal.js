import { useState, useContext, useEffect } from 'react';
import { EvenementContext } from '../../context/EvenementContext';
import '../../pages/MesEvenements.css';

const TYPES_EVT = [
  { value: 'mariage', label: '💍 Mariage' },
  { value: 'anniversaire', label: '🎂 Anniversaire' },
  { value: 'corporate', label: '🏢 Corporate' },
  { value: 'concert', label: '🎵 Concert' },
  { value: 'soiree', label: '🎉 Soirée' },
  { value: 'conference', label: '🎤 Conférence' },
  { value: 'autre', label: '📌 Autre' },
];

const COULEURS = ['#667eea', '#d4af37', '#48bb78', '#fc5c65', '#f7b731', '#a55eea', '#2bcbba', '#fd9644', '#e74c3c', '#1abc9c'];

const ETAPES_TYPES = [
  { value: 'transport', label: '🚛 Transport', icon: '🚛' },
  { value: 'installation', label: '🔧 Installation', icon: '🔧' },
  { value: 'mise_en_place', label: '📐 Mise en place', icon: '📐' },
  { value: 'prestation', label: '🎵 Prestation', icon: '🎵' },
  { value: 'rangement', label: '📦 Rangement', icon: '📦' },
  { value: 'autre', label: '📌 Autre', icon: '📌' },
];

function EvenementFormModal({ evenement, onFermer }) {
  const { creerEvenement, majEvenement } = useContext(EvenementContext);
  const isEdition = !!evenement;

  const [form, setForm] = useState({
    titre: '',
    description: '',
    type: 'autre',
    couleur: '#667eea',
    dateDebut: '',
    dateFin: '',
    heureDebut: '09:00',
    heureFin: '18:00',
    journeeEntiere: false,
    lieu: { nom: '', adresse: '', ville: '', codePostal: '' },
    nbInvites: '',
    notes: '',
  });

  const [programme, setProgramme] = useState([]);
  const [nouvelleEtape, setNouvelleEtape] = useState({ titre: '', type: 'autre', heureDebut: '', heureFin: '', description: '', responsable: '' });
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');
  const [etape, setEtape] = useState(1); // 1=infos, 2=programme, 3=résumé

  useEffect(() => {
    if (evenement) {
      setForm({
        titre: evenement.titre || '',
        description: evenement.description || '',
        type: evenement.type || 'autre',
        couleur: evenement.couleur || '#667eea',
        dateDebut: evenement.dateDebut ? new Date(evenement.dateDebut).toISOString().split('T')[0] : '',
        dateFin: evenement.dateFin ? new Date(evenement.dateFin).toISOString().split('T')[0] : '',
        heureDebut: evenement.heureDebut || '09:00',
        heureFin: evenement.heureFin || '18:00',
        journeeEntiere: evenement.journeeEntiere || false,
        lieu: evenement.lieu || { nom: '', adresse: '', ville: '', codePostal: '' },
        nbInvites: evenement.nbInvites || '',
        notes: evenement.notes || '',
      });
      setProgramme(evenement.programme || []);
    }
  }, [evenement]);

  const handleChange = (champ, valeur) => {
    setForm(prev => ({ ...prev, [champ]: valeur }));
  };

  const handleLieu = (champ, valeur) => {
    setForm(prev => ({ ...prev, lieu: { ...prev.lieu, [champ]: valeur } }));
  };

  const ajouterEtapeProgramme = () => {
    if (!nouvelleEtape.titre.trim()) return;
    setProgramme(prev => [...prev, { ...nouvelleEtape, ordre: prev.length, statut: 'a_faire' }]);
    setNouvelleEtape({ titre: '', type: 'autre', heureDebut: '', heureFin: '', description: '', responsable: '' });
  };

  const supprimerEtapeProgramme = (idx) => {
    setProgramme(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setErreur('');
    if (!form.titre.trim()) return setErreur('Le titre est requis');
    if (!form.dateDebut) return setErreur('La date de début est requise');
    if (!form.dateFin) return setErreur('La date de fin est requise');

    setSaving(true);
    try {
      const data = {
        ...form,
        nbInvites: form.nbInvites ? parseInt(form.nbInvites) : undefined,
        programme,
      };

      let result;
      if (isEdition) {
        result = await majEvenement(evenement._id, data);
      } else {
        result = await creerEvenement(data);
      }

      if (result.success) {
        onFermer();
      } else {
        setErreur(result.message || 'Erreur');
      }
    } catch {
      setErreur('Erreur inattendue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="evt-modal-overlay" onClick={onFermer}>
      <div className="evt-modal evt-modal-large" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="evt-modal-header">
          <h2>
            {isEdition ? '✏️ Modifier l\'événement' : '✨ Nouvel événement'}
          </h2>
          <button className="evt-modal-close" onClick={onFermer}>×</button>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--evt-border)' }}>
          {['Informations', 'Programme', 'Résumé'].map((label, i) => (
            <button
              key={i}
              onClick={() => setEtape(i + 1)}
              style={{
                flex: 1, padding: '0.8rem', border: 'none', background: etape === i + 1 ? 'rgba(212,175,55,0.08)' : 'transparent',
                color: etape === i + 1 ? '#d4af37' : '#8b8ba0', fontWeight: etape === i + 1 ? 700 : 400,
                borderBottom: etape === i + 1 ? '2px solid #d4af37' : '2px solid transparent',
                cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
              }}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="evt-modal-body">
          {erreur && (
            <div style={{ padding: '0.7rem 1rem', background: 'rgba(252,92,101,0.1)', border: '1px solid rgba(252,92,101,0.3)', borderRadius: '10px', color: '#fc5c65', marginBottom: '1rem', fontSize: '0.85rem' }}>
              ⚠️ {erreur}
            </div>
          )}

          {/* Étape 1 : Informations */}
          {etape === 1 && (
            <>
              <div className="evt-form-group">
                <label className="evt-form-label">Titre *</label>
                <input className="evt-form-input" value={form.titre} onChange={e => handleChange('titre', e.target.value)} placeholder="Nom de l'événement" />
              </div>

              <div className="evt-form-row">
                <div className="evt-form-group">
                  <label className="evt-form-label">Type</label>
                  <select className="evt-form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                    {TYPES_EVT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="evt-form-group">
                  <label className="evt-form-label">Nombre d'invités</label>
                  <input className="evt-form-input" type="number" value={form.nbInvites} onChange={e => handleChange('nbInvites', e.target.value)} placeholder="Ex: 150" />
                </div>
              </div>

              <div className="evt-form-group">
                <label className="evt-form-label">Couleur</label>
                <div className="evt-color-picker">
                  {COULEURS.map(c => (
                    <div key={c} className={`evt-color-swatch ${form.couleur === c ? 'selected' : ''}`}
                      style={{ background: c }} onClick={() => handleChange('couleur', c)} />
                  ))}
                </div>
              </div>

              <div className="evt-form-row">
                <div className="evt-form-group">
                  <label className="evt-form-label">Date de début *</label>
                  <input className="evt-form-input" type="date" value={form.dateDebut} onChange={e => { handleChange('dateDebut', e.target.value); if (!form.dateFin) handleChange('dateFin', e.target.value); }} />
                </div>
                <div className="evt-form-group">
                  <label className="evt-form-label">Date de fin *</label>
                  <input className="evt-form-input" type="date" value={form.dateFin} onChange={e => handleChange('dateFin', e.target.value)} />
                </div>
              </div>

              <div className="evt-form-row">
                <div className="evt-form-group">
                  <label className="evt-form-label">Heure de début</label>
                  <input className="evt-form-input" type="time" value={form.heureDebut} onChange={e => handleChange('heureDebut', e.target.value)} />
                </div>
                <div className="evt-form-group">
                  <label className="evt-form-label">Heure de fin</label>
                  <input className="evt-form-input" type="time" value={form.heureFin} onChange={e => handleChange('heureFin', e.target.value)} />
                </div>
              </div>

              <div className="evt-form-group">
                <label className="evt-form-checkbox">
                  <input type="checkbox" checked={form.journeeEntiere} onChange={e => handleChange('journeeEntiere', e.target.checked)} />
                  Journée entière
                </label>
              </div>

              <h3 style={{ fontSize: '0.95rem', marginTop: '1.5rem', marginBottom: '0.8rem', color: '#d4af37' }}>📍 Lieu</h3>

              <div className="evt-form-row">
                <div className="evt-form-group">
                  <label className="evt-form-label">Nom du lieu</label>
                  <input className="evt-form-input" value={form.lieu.nom} onChange={e => handleLieu('nom', e.target.value)} placeholder="Ex: Château de Versailles" />
                </div>
                <div className="evt-form-group">
                  <label className="evt-form-label">Ville</label>
                  <input className="evt-form-input" value={form.lieu.ville} onChange={e => handleLieu('ville', e.target.value)} placeholder="Paris" />
                </div>
              </div>

              <div className="evt-form-row">
                <div className="evt-form-group">
                  <label className="evt-form-label">Adresse</label>
                  <input className="evt-form-input" value={form.lieu.adresse} onChange={e => handleLieu('adresse', e.target.value)} />
                </div>
                <div className="evt-form-group">
                  <label className="evt-form-label">Code postal</label>
                  <input className="evt-form-input" value={form.lieu.codePostal} onChange={e => handleLieu('codePostal', e.target.value)} placeholder="75000" />
                </div>
              </div>

              <div className="evt-form-group">
                <label className="evt-form-label">Description</label>
                <textarea className="evt-form-textarea" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Décrivez l'événement..." />
              </div>

              <div className="evt-form-group">
                <label className="evt-form-label">Notes internes</label>
                <textarea className="evt-form-textarea" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Notes visibles uniquement par vous..." />
              </div>
            </>
          )}

          {/* Étape 2 : Programme */}
          {etape === 2 && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--evt-text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Définissez les différentes étapes de votre événement : transport, installation, mise en place, prestation...
                </p>

                {/* Liste des étapes ajoutées */}
                {programme.length > 0 && (
                  <div className="evt-timeline" style={{ marginBottom: '1.5rem' }}>
                    {programme.map((et, idx) => (
                      <div key={idx} className="evt-timeline-item">
                        <div className={`evt-timeline-dot ${et.type}`} />
                        <div className="evt-timeline-header">
                          <span className="evt-timeline-title">{et.titre}</span>
                          <span className="evt-timeline-time">{et.heureDebut} – {et.heureFin}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                          <span className={`evt-timeline-type-badge ${et.type}`}>
                            {ETAPES_TYPES.find(t => t.value === et.type)?.icon} {et.type.replace('_', ' ')}
                          </span>
                          {et.description && <span className="evt-timeline-desc">{et.description}</span>}
                          <button className="evt-btn-danger" style={{ marginLeft: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => supprimerEtapeProgramme(idx)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire ajout étape */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--evt-border)', borderRadius: 'var(--evt-radius-sm)', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#d4af37' }}>➕ Ajouter une étape</h4>
                  <div className="evt-form-row">
                    <div className="evt-form-group">
                      <label className="evt-form-label">Titre</label>
                      <input className="evt-form-input" value={nouvelleEtape.titre} onChange={e => setNouvelleEtape(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Transport du matériel" />
                    </div>
                    <div className="evt-form-group">
                      <label className="evt-form-label">Type</label>
                      <select className="evt-form-select" value={nouvelleEtape.type} onChange={e => setNouvelleEtape(p => ({ ...p, type: e.target.value }))}>
                        {ETAPES_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="evt-form-row">
                    <div className="evt-form-group">
                      <label className="evt-form-label">Heure début</label>
                      <input className="evt-form-input" type="time" value={nouvelleEtape.heureDebut} onChange={e => setNouvelleEtape(p => ({ ...p, heureDebut: e.target.value }))} />
                    </div>
                    <div className="evt-form-group">
                      <label className="evt-form-label">Heure fin</label>
                      <input className="evt-form-input" type="time" value={nouvelleEtape.heureFin} onChange={e => setNouvelleEtape(p => ({ ...p, heureFin: e.target.value }))} />
                    </div>
                  </div>
                  <div className="evt-form-row">
                    <div className="evt-form-group">
                      <label className="evt-form-label">Responsable</label>
                      <input className="evt-form-input" value={nouvelleEtape.responsable} onChange={e => setNouvelleEtape(p => ({ ...p, responsable: e.target.value }))} placeholder="Nom du responsable" />
                    </div>
                    <div className="evt-form-group">
                      <label className="evt-form-label">Description</label>
                      <input className="evt-form-input" value={nouvelleEtape.description} onChange={e => setNouvelleEtape(p => ({ ...p, description: e.target.value }))} placeholder="Détails optionnels..." />
                    </div>
                  </div>
                  <button className="evt-btn-primary" onClick={ajouterEtapeProgramme} style={{ marginTop: '0.5rem' }}>
                    ➕ Ajouter au programme
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Étape 3 : Résumé */}
          {etape === 3 && (
            <div>
              <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid var(--evt-border)', borderRadius: 'var(--evt-radius)', padding: '1.2rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: form.couleur, display: 'inline-block' }}></span>
                  {form.titre || 'Sans titre'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div><strong>Type :</strong> {TYPES_EVT.find(t => t.value === form.type)?.label}</div>
                  <div><strong>Invités :</strong> {form.nbInvites || '–'}</div>
                  <div><strong>Date :</strong> {form.dateDebut} → {form.dateFin}</div>
                  <div><strong>Horaires :</strong> {form.journeeEntiere ? 'Journée entière' : `${form.heureDebut} – ${form.heureFin}`}</div>
                  {form.lieu.nom && <div><strong>Lieu :</strong> {form.lieu.nom}, {form.lieu.ville}</div>}
                </div>

                {form.description && (
                  <p style={{ marginTop: '0.8rem', color: 'var(--evt-text-dim)', fontSize: '0.85rem' }}>{form.description}</p>
                )}
              </div>

              {programme.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📋 Programme ({programme.length} étape{programme.length > 1 ? 's' : ''})</h4>
                  {programme.map((et, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className={`evt-timeline-type-badge ${et.type}`} style={{ fontSize: '0.7rem' }}>
                        {ETAPES_TYPES.find(t => t.value === et.type)?.icon} {et.type.replace('_', ' ')}
                      </span>
                      <span style={{ fontWeight: 600 }}>{et.titre}</span>
                      <span style={{ color: '#d4af37', marginLeft: 'auto' }}>{et.heureDebut} – {et.heureFin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="evt-modal-footer">
          {etape > 1 && (
            <button className="evt-btn-secondary" onClick={() => setEtape(e => e - 1)}>← Précédent</button>
          )}
          <div style={{ flex: 1 }} />
          {etape < 3 ? (
            <button className="evt-btn-primary" onClick={() => setEtape(e => e + 1)}>
              Suivant →
            </button>
          ) : (
            <button className="evt-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '⏳ Sauvegarde...' : isEdition ? '✅ Enregistrer' : '✅ Créer l\'événement'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvenementFormModal;
