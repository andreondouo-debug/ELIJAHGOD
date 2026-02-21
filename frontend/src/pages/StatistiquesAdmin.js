import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Upload, Search, Edit3, Clock, CheckCircle2, Handshake,
  CalendarDays, Mic2, FileCheck, ClipboardList, PenLine, Trophy,
  XCircle, Hourglass, Ban, ChevronRight, RefreshCw, TrendingUp,
  Tag, Music2, PartyPopper, User, Calendar, Gem, DollarSign,
  MessageSquare, Activity, Users, Lock, AlertCircle, BarChart3, AlertTriangle
} from 'lucide-react';
import './StatistiquesAdmin.css';

import { API_URL } from '../config';

const MOIS_NOMS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const STATUTS_LABEL = {
  brouillon:                    { icon: <FileText       size={14} />, label: 'Brouillon',         couleur: '#95a5a6' },
  soumis:                       { icon: <Upload         size={14} />, label: 'Soumis',             couleur: '#3498db' },
  en_etude:                     { icon: <Search         size={14} />, label: 'En étude',           couleur: '#9b59b6' },
  modifie_admin:                { icon: <Edit3          size={14} />, label: 'Modifié',            couleur: '#e67e22' },
  attente_validation_client:    { icon: <Clock          size={14} />, label: 'Att. client',        couleur: '#f39c12' },
  valide_client:                { icon: <CheckCircle2   size={14} />, label: 'Validé client',      couleur: '#2ecc71' },
  accepte:                      { icon: <Handshake      size={14} />, label: 'Accepté',            couleur: '#27ae60' },
  entretien_prevu:              { icon: <CalendarDays   size={14} />, label: 'Entretien',          couleur: '#1abc9c' },
  entretien_effectue:           { icon: <Mic2           size={14} />, label: 'Fait',               couleur: '#16a085' },
  devis_final:                  { icon: <FileCheck      size={14} />, label: 'Devis final',        couleur: '#2980b9' },
  transforme_contrat:           { icon: <ClipboardList  size={14} />, label: 'Contrat',            couleur: '#8e44ad' },
  contrat_signe:                { icon: <PenLine        size={14} />, label: 'Signé',             couleur: '#6c3483' },
  valide_final:                 { icon: <Trophy         size={14} />, label: 'Validé final',       couleur: '#0d6efd' },
  refuse:                       { icon: <XCircle        size={14} />, label: 'Refusé',            couleur: '#e74c3c' },
  expire:                       { icon: <Hourglass      size={14} />, label: 'Expiré',            couleur: '#bdc3c7' },
  annule:                       { icon: <Ban            size={14} />, label: 'Annulé',            couleur: '#7f8c8d' },
};

// ── Composant KPI Card ─────────────────────────────────────────────────────
function KpiCard({ icone, valeur, label, couleur, evolution, evoPct }) {
  const evoClass = evoPct > 0 ? 'positif' : evoPct < 0 ? 'negatif' : 'neutre';
  return (
    <div className="kpi-card" style={{ '--kpi-color': couleur }}>
      <div className="kpi-icone">{icone}</div>
      <div className="kpi-valeur">{valeur}</div>
      <div className="kpi-label">{label}</div>
      {evolution !== undefined && (
        <div className={`kpi-evolution ${evoClass}`}>
          {evoPct > 0 ? '▲' : evoPct < 0 ? '▼' : '●'}
          {' '}{evolution}
        </div>
      )}
    </div>
  );
}

// ── Composant Barre ────────────────────────────────────────────────────────
function ListeBarres({ donnees, cle = '_id', val = 'count', max, suffix = '' }) {
  const maxVal = max || Math.max(...donnees.map(d => d[val]), 1);
  return (
    <div className="barre-liste">
      {donnees.slice(0, 8).map((item, i) => (
        <div className="barre-item" key={i}>
          <div className="barre-header">
            <span className="barre-nom">{item[cle] || '—'}</span>
            <span className="barre-val">{item[val]}{suffix}</span>
          </div>
          <div className="barre-bg">
            <div className="barre-fill" style={{ width: `${Math.round((item[val] / maxVal) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Composant Courbe mensuelle ─────────────────────────────────────────────
function CourbeDevis({ parMois }) {
  if (!parMois || parMois.length === 0) {
    return <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Aucune donnée</p>;
  }
  const maxCount = Math.max(...parMois.map(m => m.count), 1);
  return (
    <div className="courbe-wrapper">
      {parMois.map((m, i) => {
        const hauteur = Math.max(8, Math.round((m.count / maxCount) * 90));
        return (
          <div className="courbe-col" key={i}>
            <div className="courbe-barre" style={{ height: `${hauteur}px` }}>
              <span className="courbe-tooltip">{m.count} devis</span>
            </div>
            <div className="courbe-label">{MOIS_NOMS[(m._id.mois - 1)] || m._id.mois}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────────────────────
function StatistiquesAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [derniereMaj, setDerniereMaj] = useState(null);

  const token = localStorage.getItem('adminToken');

  const chargerStats = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await axios.get(`${API_URL}/api/stats/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(reponse.data);
      setDerniereMaj(new Date());
    } catch (err) {
      console.error('❌ Erreur chargement stats :', err);
      setErreur(err.response?.data?.message || 'Impossible de charger les statistiques.');
    } finally {
      setChargement(false);
    }
  }, [token]);

  useEffect(() => {
    chargerStats();
  }, [chargerStats]);

  // ── Chargement ──────────────────────────────────────────────────────────
  if (chargement) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="stats-spinner" />
          <p>Chargement des statistiques…</p>
        </div>
      </div>
    );
  }

  // ── Erreur ──────────────────────────────────────────────────────────────
  if (erreur) {
    return (
      <div className="stats-page">
        <div className="stats-header">
          <div>
            <h1><BarChart3 size={22} style={{ verticalAlign: 'middle', marginRight: 8, color: '#667eea' }} /> Statistiques</h1>
          </div>
          <div className="stats-header-actions">
            <button className="btn-retour" onClick={() => navigate('/admin/dashboard')}>
              ← Dashboard
            </button>
          </div>
        </div>
        <div className="stats-erreur">
          <div style={{ marginBottom: '1rem', color: '#e74c3c' }}><AlertTriangle size={48} /></div>
          <h3>Erreur de chargement</h3>
          <p>{erreur}</p>
          <button className="btn-rafraichir" onClick={chargerStats} style={{ marginTop: '1rem' }}>
            <RefreshCw size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Ressáyer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { devis, prestataires, clients, prestations, reservations, temoignages } = stats;

  // Calcul taux conversion
  const devisActifsTotal = Object.entries(devis.parStatut || {})
    .filter(([k]) => k !== 'brouillon')
    .reduce((acc, [, v]) => acc + v, 0);
  const devisFinalises = (devis.parStatut?.valide_final || 0) + (devis.parStatut?.contrat_signe || 0);
  const tauxConv = devisActifsTotal > 0 ? Math.round((devisFinalises / devisActifsTotal) * 100) : 0;

  return (
    <div className="stats-page">
      {/* ── ENTÊTE ── */}
      <div className="stats-header container">
        <div>
          <h1><BarChart3 size={28} style={{ verticalAlign: 'middle', marginRight: 8, color: '#667eea' }} /> Statistiques du site</h1>
          <div className="sous-titre">
            {derniereMaj && `Mise à jour : ${derniereMaj.toLocaleTimeString('fr-FR')}`}
          </div>
        </div>
        <div className="stats-header-actions">
          <button className="btn-retour" onClick={() => navigate('/admin/dashboard')}>
            ← Dashboard
          </button>
          <button className="btn-rafraichir" onClick={chargerStats} disabled={chargement}>
            <RefreshCw size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="container">

        {/* ══ KPI PRINCIPAUX ══════════════════════════════════════════════ */}
        <div className="kpi-grid">
          <KpiCard
            icone={<ClipboardList size={24} />}
            valeur={devis.total}
            label="Total devis"
            couleur="#667eea"
            evolution={`${devis.moisActuel} ce mois`}
            evoPct={devis.moisActuel - devis.moisDernier}
          />
          <KpiCard
            icone={<TrendingUp size={24} />}
            valeur={`${tauxConv}%`}
            label="Taux conversion"
            couleur="#27ae60"
            evolution={`${devisFinalises} finalisés`}
            evoPct={tauxConv}
          />
          <KpiCard
            icone={<Users size={24} />}
            valeur={prestataires.total}
            label="Prestataires"
            couleur="#9b59b6"
            evolution={`${prestataires.nouveauxCeMois} ce mois`}
            evoPct={prestataires.nouveauxCeMois}
          />
          <KpiCard
            icone={<User size={24} />}
            valeur={clients.total}
            label="Clients"
            couleur="#e67e22"
            evolution={`+${clients.croissance}% vs mois dernier`}
            evoPct={clients.croissance}
          />
          <KpiCard
            icone={<PartyPopper size={24} />}
            valeur={prestations.total}
            label="Prestations"
            couleur="#1abc9c"
            evolution={`${prestations.actives} actives`}
            evoPct={prestations.actives}
          />
          <KpiCard
            icone={<Calendar size={24} />}
            valeur={reservations.total}
            label="Réservations"
            couleur="#3498db"
            evolution={`${reservations.moisActuel} ce mois`}
            evoPct={reservations.moisActuel}
          />
          <KpiCard
            icone={<MessageSquare size={24} />}
            valeur={temoignages.total}
            label="Témoignages"
            couleur="#e74c3c"
            evolution={`${temoignages.affiches} affichés`}
            evoPct={temoignages.affiches}
          />
          <KpiCard
            icone={<CheckCircle2 size={24} />}
            valeur={`${prestataires.verifies}`}
            label="Prestataires vérifiés"
            couleur="#f39c12"
            evolution={`${prestataires.total - prestataires.verifies} en attente`}
            evoPct={0}
          />
        </div>

        {/* ══ SECTIONS ════════════════════════════════════════════════════ */}
        <div className="stats-sections">

          {/* ── Courbe devis mensuels ── */}
          <div className="stats-section col-8">
            <div className="section-titre"><TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Évolution des devis (année en cours)</div>
            <CourbeDevis parMois={devis.parMois} />
          </div>

          {/* ── Mini stats devis ── */}
          <div className="stats-section col-4">
            <div className="section-titre"><ClipboardList size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Résumé devis</div>
            <div className="mini-stats-grid">
              <div className="mini-stat">
                <div className="ms-val">{devis.moisActuel}</div>
                <div className="ms-label">Ce mois</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{devis.moisDernier}</div>
                <div className="ms-label">Mois dernier</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{tauxConv}%</div>
                <div className="ms-label">Conversion</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{devis.montantMoyen > 0 ? `${devis.montantMoyen}€` : '—'}</div>
                <div className="ms-label">Montant moyen</div>
              </div>
            </div>
          </div>

          {/* ── Statuts devis ── */}
          <div className="stats-section col-12">
            <div className="section-titre"><Tag size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Répartition par statut</div>
            <div className="statuts-grid">
              {Object.entries(devis.parStatut || {})
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([statut, count]) => {
                  const cfg = STATUTS_LABEL[statut] || { icon: <ChevronRight size={14} />, label: statut };
                  return (
                    <div key={statut} className="statut-badge" style={{ borderLeft: `3px solid ${cfg.couleur || '#764ba2'}` }}>
                      {cfg.icon} {cfg.label}
                      <span className="badge-count">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ── Prestataires par catégorie ── */}
          <div className="stats-section col-6">
            <div className="section-titre"><Music2 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Prestataires par catégorie</div>
            {prestataires.parCategorie?.length > 0
              ? <ListeBarres donnees={prestataires.parCategorie} />
              : <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Aucune donnée</p>}
          </div>

          {/* ── Prestations par catégorie ── */}
          <div className="stats-section col-6">
            <div className="section-titre"><PartyPopper size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Prestations par catégorie</div>
            {prestations.parCategorie?.length > 0
              ? <ListeBarres donnees={prestations.parCategorie} />
              : <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Aucune donnée</p>}
          </div>

          {/* ── Top prestataires ── */}
          <div className="stats-section col-6">
            <div className="section-titre"><Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Top prestataires (note)</div>
            {prestataires.top5?.length > 0 ? (
              <div className="top-liste">
                {prestataires.top5.map((p, i) => (
                  <div className="top-item" key={i}>
                    <div className={`top-rang rang-${i + 1}`}>{i + 1}</div>
                    <div className="top-info">
                      <div className="top-nom">{p.nomEntreprise}</div>
                      <div className="top-cat">{p.categorie} · {p.nombreAvis} avis</div>
                    </div>
                    <div className="top-note">⭐ {p.noteMoyenne?.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Pas encore d'avis</p>
            )}
          </div>

          {/* ── Clients & utilisateurs ── */}
          <div className="stats-section col-6">
            <div className="section-titre"><User size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Clients par rôle</div>
            {clients.parRole?.length > 0
              ? <ListeBarres donnees={clients.parRole} />
              : <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Aucune donnée</p>}
            <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #f0f2f5' }}>
              <div className="mini-stats-grid">
                <div className="mini-stat">
                  <div className="ms-val">{clients.actifs}</div>
                  <div className="ms-label">Actifs</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-val">{clients.inactifs}</div>
                  <div className="ms-label">Inactifs</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-val">{clients.nouveauxCeMois}</div>
                  <div className="ms-label">Nouveaux ce mois</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-val">
                    {clients.croissance >= 0 ? '+' : ''}{clients.croissance}%
                  </div>
                  <div className="ms-label">Croissance</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Réservations ── */}
          <div className="stats-section col-4">
            <div className="section-titre"><Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Réservations</div>
            <div className="mini-stats-grid">
              <div className="mini-stat">
                <div className="ms-val">{reservations.parStatut?.demandee || 0}</div>
                <div className="ms-label">En attente</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{reservations.parStatut?.validee || 0}</div>
                <div className="ms-label">Validées</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{reservations.parStatut?.terminee || 0}</div>
                <div className="ms-label">Terminées</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{reservations.parStatut?.annulee || 0}</div>
                <div className="ms-label">Annulées</div>
              </div>
            </div>
          </div>

          {/* ── Abonnements prestataires ── */}
          <div className="stats-section col-4">
            <div className="section-titre"><Gem size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Abonnements prestataires</div>
            {prestataires.parAbonnement?.length > 0
              ? <ListeBarres donnees={prestataires.parAbonnement} />
              : <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Aucune donnée</p>}
          </div>

          {/* ── Prestations prix ── */}
          <div className="stats-section col-4">
            <div className="section-titre"><DollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Tarifs prestations</div>
            <div className="mini-stats-grid">
              <div className="mini-stat">
                <div className="ms-val">{prestations.prixMin > 0 ? `${prestations.prixMin}€` : '—'}</div>
                <div className="ms-label">Prix min</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{prestations.prixMax > 0 ? `${prestations.prixMax}€` : '—'}</div>
                <div className="ms-label">Prix max</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{prestations.prixMoyen > 0 ? `${prestations.prixMoyen}€` : '—'}</div>
                <div className="ms-label">Moyenne</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{prestations.actives}</div>
                <div className="ms-label">Actives</div>
              </div>
            </div>
          </div>

          {/* ── Témoignages ── */}
          <div className="stats-section col-4">
            <div className="section-titre"><MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Témoignages</div>
            <div className="mini-stats-grid">
              <div className="mini-stat">
                <div className="ms-val">{temoignages.total}</div>
                <div className="ms-label">Total</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{temoignages.affiches}</div>
                <div className="ms-label">Affichés</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">{temoignages.enAttente}</div>
                <div className="ms-label">En attente</div>
              </div>
              <div className="mini-stat">
                <div className="ms-val">
                  {temoignages.total > 0 ? `${Math.round((temoignages.affiches / temoignages.total) * 100)}%` : '—'}
                </div>
                <div className="ms-label">Taux publication</div>
              </div>
            </div>
          </div>

          {/* ── Santé prestataires ── */}
          <div className="stats-section col-8">
            <div className="section-titre"><Activity size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Santé des prestataires</div>
            <div className="kpi-grid" style={{ marginBottom: 0 }}>
              {[
                { icone: <CheckCircle2 size={22} />, valeur: prestataires.actifs, label: 'Actifs', couleur: '#27ae60' },
                { icone: <AlertCircle  size={22} />, valeur: prestataires.inactifs, label: 'Inactifs', couleur: '#e74c3c' },
                { icone: <Lock        size={22} />, valeur: prestataires.verifies, label: 'Vérifiés', couleur: '#3498db' },
                { icone: <Hourglass   size={22} />, valeur: prestataires.nonVerifies, label: 'Non vérifiés', couleur: '#f39c12' },
              ].map((k, i) => (
                <KpiCard key={i} icone={k.icone} valeur={k.valeur} label={k.label} couleur={k.couleur} />
              ))}
            </div>
          </div>

        </div>
        {/* Fin sections */}
      </div>
    </div>
  );
}

export default StatistiquesAdmin;
