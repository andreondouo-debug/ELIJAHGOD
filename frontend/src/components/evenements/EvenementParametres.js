import { useState } from 'react';
import '../../pages/MesEvenements.css';

/**
 * ⚙️ Paramétrage de l'onglet Événements
 * Configuration locale (stockée en localStorage)
 */

const DEFAULT_SETTINGS = {
  vueParDefaut: 'calendrier', // calendrier | liste
  premierJourSemaine: 'lundi',
  afficherWeekends: true,
  couleurParDefaut: '#667eea',
  rappelAutoJours: 1,
  afficherTodosDansCalendrier: true,
  afficherCommandesDansListe: true,
  typesEtapesActifs: ['transport', 'installation', 'mise_en_place', 'prestation', 'rangement', 'autre'],
  categoriesOutils: ['Son', 'Lumière', 'Décoration', 'Mobilier', 'Câblage', 'Autre'],
  notificationsRappel: true,
  themeCalendrier: 'sombre', // sombre | clair
};

function EvenementParametres() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('evenement_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saved, setSaved] = useState(false);
  const [newCategorie, setNewCategorie] = useState('');

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('evenement_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('evenement_settings');
    setSaved(false);
  };

  const toggleTypeEtape = (type) => {
    setSettings(prev => ({
      ...prev,
      typesEtapesActifs: prev.typesEtapesActifs.includes(type)
        ? prev.typesEtapesActifs.filter(t => t !== type)
        : [...prev.typesEtapesActifs, type]
    }));
    setSaved(false);
  };

  const ajouterCategorie = () => {
    if (!newCategorie.trim() || settings.categoriesOutils.includes(newCategorie.trim())) return;
    handleChange('categoriesOutils', [...settings.categoriesOutils, newCategorie.trim()]);
    setNewCategorie('');
  };

  const supprimerCategorie = (cat) => {
    handleChange('categoriesOutils', settings.categoriesOutils.filter(c => c !== cat));
  };

  const COULEURS = ['#667eea', '#d4af37', '#48bb78', '#fc5c65', '#f7b731', '#a55eea', '#2bcbba', '#fd9644'];

  return (
    <div className="evt-settings">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>⚙️ Paramétrage des événements</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="evt-btn-secondary" onClick={handleReset}>🔄 Réinitialiser</button>
          <button className="evt-btn-primary" onClick={handleSave}>
            {saved ? '✅ Sauvegardé !' : '💾 Enregistrer'}
          </button>
        </div>
      </div>

      {/* Affichage */}
      <div className="evt-settings-group">
        <div className="evt-settings-group-title">📅 Affichage du calendrier</div>
        <div className="evt-settings-group-body">
          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Vue par défaut</div>
              <div className="evt-settings-row-desc">Choisir la vue affichée à l'ouverture de l'onglet</div>
            </div>
            <select className="evt-form-select" value={settings.vueParDefaut} onChange={e => handleChange('vueParDefaut', e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
              <option value="calendrier">📅 Calendrier</option>
              <option value="liste">📋 Liste</option>
            </select>
          </div>

          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Premier jour de la semaine</div>
              <div className="evt-settings-row-desc">Définir le premier jour du calendrier</div>
            </div>
            <select className="evt-form-select" value={settings.premierJourSemaine} onChange={e => handleChange('premierJourSemaine', e.target.value)} style={{ width: 'auto', minWidth: '120px' }}>
              <option value="lundi">Lundi</option>
              <option value="dimanche">Dimanche</option>
            </select>
          </div>

          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Afficher les weekends</div>
              <div className="evt-settings-row-desc">Samedi et dimanche visibles dans le calendrier</div>
            </div>
            <button className={`evt-toggle ${settings.afficherWeekends ? 'active' : ''}`} onClick={() => handleChange('afficherWeekends', !settings.afficherWeekends)} />
          </div>

          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Couleur par défaut</div>
              <div className="evt-settings-row-desc">Couleur appliquée aux nouveaux événements</div>
            </div>
            <div className="evt-color-picker">
              {COULEURS.map(c => (
                <div key={c} className={`evt-color-swatch ${settings.couleurParDefaut === c ? 'selected' : ''}`}
                  style={{ background: c, width: '28px', height: '28px' }} onClick={() => handleChange('couleurParDefaut', c)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="evt-settings-group">
        <div className="evt-settings-group-title">📋 Contenu & données</div>
        <div className="evt-settings-group-body">
          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Tâches dans le calendrier</div>
              <div className="evt-settings-row-desc">Afficher un aperçu des tâches sur les jours du calendrier</div>
            </div>
            <button className={`evt-toggle ${settings.afficherTodosDansCalendrier ? 'active' : ''}`} onClick={() => handleChange('afficherTodosDansCalendrier', !settings.afficherTodosDansCalendrier)} />
          </div>

          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Commandes dans la liste</div>
              <div className="evt-settings-row-desc">Voir les commandes liées dans la vue liste</div>
            </div>
            <button className={`evt-toggle ${settings.afficherCommandesDansListe ? 'active' : ''}`} onClick={() => handleChange('afficherCommandesDansListe', !settings.afficherCommandesDansListe)} />
          </div>
        </div>
      </div>

      {/* Types d'étapes */}
      <div className="evt-settings-group">
        <div className="evt-settings-group-title">📐 Types d'étapes du programme</div>
        <div className="evt-settings-group-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--evt-text-dim)', marginBottom: '1rem' }}>
            Activer/désactiver les types d'étapes disponibles lors de la création d'un programme.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {[
              { value: 'transport', label: '🚛 Transport' },
              { value: 'installation', label: '🔧 Installation' },
              { value: 'mise_en_place', label: '📐 Mise en place' },
              { value: 'prestation', label: '🎵 Prestation' },
              { value: 'rangement', label: '📦 Rangement' },
              { value: 'autre', label: '📌 Autre' },
            ].map(type => (
              <button key={type.value}
                onClick={() => toggleTypeEtape(type.value)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  border: settings.typesEtapesActifs.includes(type.value) ? '1px solid var(--evt-gold)' : '1px solid var(--evt-border)',
                  background: settings.typesEtapesActifs.includes(type.value) ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                  color: settings.typesEtapesActifs.includes(type.value) ? 'var(--evt-gold)' : 'var(--evt-text-dim)',
                  fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.2s'
                }}>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catégories outils */}
      <div className="evt-settings-group">
        <div className="evt-settings-group-title">🧰 Catégories de la boîte à outils</div>
        <div className="evt-settings-group-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
            {settings.categoriesOutils.map(cat => (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.8rem', background: 'rgba(102,126,234,0.1)',
                border: '1px solid rgba(102,126,234,0.3)', borderRadius: '20px',
                fontSize: '0.82rem', color: 'var(--evt-blue)'
              }}>
                {cat}
                <button onClick={() => supprimerCategorie(cat)} style={{
                  background: 'none', border: 'none', color: 'var(--evt-red)',
                  cursor: 'pointer', padding: 0, fontSize: '0.8rem', lineHeight: 1
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input className="evt-form-input" value={newCategorie} onChange={e => setNewCategorie(e.target.value)}
              placeholder="Nouvelle catégorie..." onKeyDown={e => { if (e.key === 'Enter') ajouterCategorie(); }}
              style={{ flex: 1 }} />
            <button className="evt-btn-primary" onClick={ajouterCategorie} style={{ padding: '0.5rem 1rem' }}>➕</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="evt-settings-group">
        <div className="evt-settings-group-title">🔔 Rappels & notifications</div>
        <div className="evt-settings-group-body">
          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Rappels automatiques</div>
              <div className="evt-settings-row-desc">Recevoir un rappel avant chaque événement</div>
            </div>
            <button className={`evt-toggle ${settings.notificationsRappel ? 'active' : ''}`} onClick={() => handleChange('notificationsRappel', !settings.notificationsRappel)} />
          </div>

          <div className="evt-settings-row">
            <div>
              <div className="evt-settings-row-label">Délai de rappel</div>
              <div className="evt-settings-row-desc">Nombre de jours avant l'événement</div>
            </div>
            <select className="evt-form-select" value={settings.rappelAutoJours} onChange={e => handleChange('rappelAutoJours', parseInt(e.target.value))} style={{ width: 'auto', minWidth: '100px' }}>
              <option value={1}>1 jour</option>
              <option value={2}>2 jours</option>
              <option value={3}>3 jours</option>
              <option value={7}>7 jours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvenementParametres;
