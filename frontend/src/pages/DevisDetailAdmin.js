import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminContext from '../context/AdminContext';
import { ArrowLeft, Download, Edit, Trash2, Check, X, Calendar, User, Mail, Phone, MapPin, Package, Euro, Tag } from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import './AdminDashboard.css';
import './MesDevisPage.css';
import '../components/SignaturePad.css';

import { API_URL } from '../config';

/**
 * 📄 DÉTAIL DEVIS ADMIN
 */
function DevisDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, loading: authLoading } = useContext(AdminContext);
  
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatut, setUpdatingStatut]   = useState(false);
  const [remiseForm, setRemiseForm]             = useState({ type: 'pourcentage', valeur: '', raison: '' });
  const [applyingRemise, setApplyingRemise]     = useState(false);
  const [generatingContrat, setGeneratingContrat] = useState(false);
  const [transformingContrat, setTransformingContrat] = useState(false);
  const [showAdminSignPad, setShowAdminSignPad] = useState(false);
  useBodyScrollLock(showAdminSignPad);
  const [signingAdmin, setSigningAdmin]           = useState(false);
  const [adminSignFeedback, setAdminSignFeedback] = useState(null);
  const [adminSignataire, setAdminSignataire]     = useState('M. ODOUNGA ETOUMBI Randy');

  useEffect(() => {
    if (authLoading) return; // attendre que le contexte soit initialisé
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    chargerDevis();
  }, [id, isAuthenticated, authLoading]);

  const chargerDevis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/devis/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data.devis;
      setDevis(data);
      // Pré-remplir le formulaire de remise si une remise est déjà active
      if (data.montants?.remise?.valeur > 0) {
        setRemiseForm({
          type: data.montants.remise.type || 'pourcentage',
          valeur: String(data.montants.remise.valeur),
          raison: data.montants.remise.raison || ''
        });
      }
      setError('');
    } catch (err) {
      console.error('❌ Erreur chargement devis:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (nouveauStatut) => {
    if (!window.confirm(`Confirmer le changement de statut vers "${nouveauStatut}" ?`)) return;
    
    try {
      setUpdatingStatut(true);
      await axios.patch(`${API_URL}/api/devis/${id}/statut`, 
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerDevis();
      alert('✅ Statut mis à jour avec succès');
    } catch (err) {
      console.error('❌ Erreur changement statut:', err);
      alert(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setUpdatingStatut(false);
    }
  };

  const appliquerRemise = async (e) => {
    e.preventDefault();
    const val = parseFloat(remiseForm.valeur);
    if (isNaN(val) || val < 0) { alert('Valeur de remise invalide'); return; }
    if (!window.confirm(`Appliquer une remise de ${val}${remiseForm.type === 'pourcentage' ? '%' : '€'}${remiseForm.raison ? ` (${remiseForm.raison})` : ''} sur ce devis ?`)) return;
    setApplyingRemise(true);
    try {
      await axios.patch(
        `${API_URL}/api/devis/${id}/remise`,
        { type: remiseForm.type, valeur: val, raison: remiseForm.raison },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerDevis();
      alert(`✅ Remise appliquée avec succès`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'application de la remise');
    } finally {
      setApplyingRemise(false);
    }
  };

  const supprimerRemise = async () => {
    if (!window.confirm('Supprimer la remise de ce devis ?')) return;
    setApplyingRemise(true);
    try {
      await axios.patch(
        `${API_URL}/api/devis/${id}/remise`,
        { type: 'pourcentage', valeur: 0, raison: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerDevis();
      setRemiseForm({ type: 'pourcentage', valeur: '', raison: '' });
      alert('✅ Remise supprimée');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally {
      setApplyingRemise(false);
    }
  };

  const telechargerPDF = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/devis/admin/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${devis.numeroDevis}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('❌ Erreur téléchargement PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  // Transformer en contrat (change le statut) puis générer le PDF
  const transformerEtGenererContrat = async () => {
    if (!window.confirm('Transformer ce devis en contrat et générer le PDF ?')) return;
    try {
      setTransformingContrat(true);
      // 1) Transformer en contrat
      await axios.post(`${API_URL}/api/devis/admin/${id}/transformer-contrat`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await chargerDevis();
      // 2) Télécharger le PDF du contrat
      await telechargerContrat();
    } catch (err) {
      console.error('❌ Erreur transformation contrat:', err);
      alert(err.response?.data?.message || 'Erreur lors de la transformation en contrat');
    } finally {
      setTransformingContrat(false);
    }
  };

  // Télécharger le PDF du contrat
  const telechargerContrat = async () => {
    try {
      setGeneratingContrat(true);
      const response = await axios.get(`${API_URL}/api/devis/admin/${id}/contrat`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      const numDoc = devis.numeroContrat || devis.numeroDevis;
      link.setAttribute('download', `contrat-${numDoc}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Erreur téléchargement contrat:', err);
      alert('Erreur lors du téléchargement du contrat PDF');
    } finally {
      setGeneratingContrat(false);
    }
  };

  const supprimerDevis = async () => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/devis/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Devis supprimé avec succès');
      navigate('/admin/devis');
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const signerContratAdmin = async (signatureData) => {
    if (!adminSignataire.trim()) {
      setAdminSignFeedback({ type: 'error', msg: 'Veuillez saisir votre nom.' });
      return;
    }
    setSigningAdmin(true);
    setAdminSignFeedback(null);
    try {
      await axios.post(
        `${API_URL}/api/devis/admin/${id}/signer`,
        { signatureData, partie: 'admin', signataire: adminSignataire.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAdminSignPad(false);
      setAdminSignFeedback({ type: 'success', msg: '✅ Signature enregistrée. Le contrat est maintenant valide (valide_final).' });
      await chargerDevis();
    } catch (err) {
      setAdminSignFeedback({ type: 'error', msg: err.response?.data?.message || 'Erreur lors de la signature.' });
    } finally {
      setSigningAdmin(false);
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      'brouillon': { bg: '#f3f4f6', color: '#374151', label: '🗒️ Brouillon' },
      'soumis': { bg: '#fef3c7', color: '#92400e', label: '📤 Soumis' },
      'en_etude': { bg: '#dbeafe', color: '#1e40af', label: '🔍 En étude' },
      'accepte': { bg: '#d1fae5', color: '#065f46', label: '✅ Accepté' },
      'refuse': { bg: '#fee2e2', color: '#991b1b', label: '❌ Refusé' },
      'annule': { bg: '#e5e7eb', color: '#374151', label: '🚫 Annulé' },
      'devis_final': { bg: '#e0e7ff', color: '#3730a3', label: '📝 Devis final' },
      'modifie_admin':           { bg: '#fef3c7', color: '#92400e', label: '✏️ Modifié admin' },
      'attente_validation_client':{ bg: '#dbeafe', color: '#1e40af', label: '⏳ Attente client' },
      'valide_client':            { bg: '#d1fae5', color: '#065f46', label: '✅ Validé client' },
      'entretien_prevu':          { bg: '#e0e7ff', color: '#3730a3', label: '📅 Entretien prévu' },
      'entretien_effectue':       { bg: '#e0e7ff', color: '#3730a3', label: '📋 Entretien effectué' },
      'transforme_contrat':       { bg: '#fef9c3', color: '#713f12', label: '📜 Contrat généré' },
      'contrat_signe':            { bg: '#dcfce7', color: '#166534', label: '✍️ Contrat signé' },
      'valide_final':             { bg: '#bbf7d0', color: '#14532d', label: '🏆 Validé final' },
      'expire':                   { bg: '#e5e7eb', color: '#374151', label: '⌛ Expiré' }
    };
    const style = styles[statut] || styles['brouillon'];
    return (
      <span style={{ 
        backgroundColor: style.bg, 
        color: style.color, 
        padding: '6px 12px', 
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.9rem'
      }}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (error || !devis) {
    return (
      <div className="admin-container">
        <div className="alert alert-error">
          <strong>❌ Erreur</strong>
          <p>{error || 'Devis non trouvé'}</p>
          <Link to="/admin/devis" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/devis" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            <h1 className="page-title">Devis {devis.numeroDevis}</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
              <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Créé le {new Date(devis.dateCreation).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {getStatutBadge(devis.statut)}
        </div>
      </div>

      {/* Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⚡ Actions rapides</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={telechargerPDF} className="btn btn-primary">
            <Download size={16} /> Télécharger PDF
          </button>
          
          {devis.statut === 'soumis' && (
            <>
              <button 
                onClick={() => changerStatut('en_etude')} 
                className="btn btn-success"
                disabled={updatingStatut}
              >
                <Check size={16} /> Mettre en étude
              </button>
              <button 
                onClick={() => changerStatut('refuse')} 
                className="btn btn-danger"
                disabled={updatingStatut}
              >
                <X size={16} /> Refuser
              </button>
            </>
          )}

          {/* Bouton transformer en contrat — visible quand le devis est validé */}
          {['valide_client', 'accepte', 'devis_final'].includes(devis.statut) && (
            <button
              onClick={transformerEtGenererContrat}
              disabled={transformingContrat}
              style={{
                background: '#c9a227',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: '700',
                cursor: transformingContrat ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
            >
              📜 {transformingContrat ? 'Génération...' : 'Transformer en contrat & télécharger'}
            </button>
          )}

          {/* Bouton télécharger contrat — visible quand le contrat existe déjà */}
          {['transforme_contrat', 'contrat_signe', 'valide_final'].includes(devis.statut) && (
            <button
              onClick={telechargerContrat}
              disabled={generatingContrat}
              style={{
                background: '#1a1a2e',
                color: '#c9a227',
                border: '2px solid #c9a227',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: '700',
                cursor: generatingContrat ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
            >
              📥 {generatingContrat ? 'Téléchargement...' : 'Télécharger contrat PDF'}
            </button>
          )}

          {/* Info numéro contrat */}
          {devis.numeroContrat && (
            <span style={{
              background: '#fef9c3',
              color: '#713f12',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: '1px solid #fbbf24'
            }}>
              📜 {devis.numeroContrat}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Informations client */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> Informations client
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <strong>Nom:</strong> {devis.nom} {devis.prenom}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} />
              <a href={`mailto:${devis.email}`}>{devis.email}</a>
            </div>
            {devis.telephone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} />
                <a href={`tel:${devis.telephone}`}>{devis.telephone}</a>
              </div>
            )}
            {devis.adresse && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} style={{ marginTop: '3px' }} />
                <span>{devis.adresse}</span>
              </div>
            )}
          </div>
        </div>

        {/* Détails événement */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> Événement
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><strong>Type:</strong> {devis.typeEvenement}</div>
            <div><strong>Date:</strong> {new Date(devis.dateEvenement).toLocaleDateString('fr-FR')}</div>
            <div><strong>Lieu:</strong> {devis.lieuEvenement}</div>
            <div><strong>Nombre d'invités:</strong> {devis.nombreInvites || 'Non spécifié'}</div>
          </div>
        </div>
      </div>

      {/* Prestations */}
      {devis.prestations && devis.prestations.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} /> Prestations
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prestation</th>
                  <th>Quantité</th>
                  <th style={{ textAlign: 'right' }}>Prix unitaire</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {devis.prestations.map((item, index) => (
                  <tr key={index}>
                    <td>{item.prestation?.nom || item.nom || 'Prestation'}</td>
                    <td>{item.quantite || 1}</td>
                    <td style={{ textAlign: 'right' }}>{item.prixUnitaire?.toFixed(2)} €</td>
                    <td style={{ textAlign: 'right' }}><strong>{((item.quantite || 1) * item.prixUnitaire).toFixed(2)} €</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matériels */}
      {devis.materiels && devis.materiels.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🎛️ Matériels</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matériel</th>
                  <th>Quantité</th>
                  <th style={{ textAlign: 'right' }}>Prix unitaire</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {devis.materiels.map((item, index) => (
                  <tr key={index}>
                    <td>{item.materiel?.nom || item.nom || 'Matériel'}</td>
                    <td>{item.quantite || 1}</td>
                    <td style={{ textAlign: 'right' }}>{item.prixUnitaire?.toFixed(2)} €</td>
                    <td style={{ textAlign: 'right' }}><strong>{((item.quantite || 1) * item.prixUnitaire).toFixed(2)} €</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totaux */}
      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f0f9ff' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Euro size={18} /> Récapitulatif financier
        </h3>
        {(() => {
          const m = devis.montants || {};
          const fmt = (n) => n != null ? `${Number(n).toFixed(2)} €` : '—';
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sous-total HT :</span><strong>{fmt(m.totalAvantRemise)}</strong>
              </div>
              {(m.fraisKilometriques?.montant || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>Frais kilométriques :</span><strong>+ {fmt(m.fraisKilometriques.montant)}</strong>
                </div>
              )}
              {(m.montantRemise || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c0392b', background: '#fff5f5', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>
                    🎁 Remise
                    {m.remise?.type === 'pourcentage' ? ` (${m.remise.valeur}%)` : ' (montant fixe)'}
                    {m.remise?.raison ? ` — ${m.remise.raison}` : ''} :
                  </span>
                  <strong>- {fmt(m.montantRemise)}</strong>
                </div>
              )}
              {(m.montantRemise || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total HT après remise :</span><strong>{fmt(m.totalFinal)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>TVA ({m.tauxTVA || 20}%) :</span><strong>+ {fmt(m.montantTVA)}</strong>
              </div>
              <div style={{ borderTop: '2px solid #0ea5e9', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>TOTAL TTC :</span>
                <strong style={{ fontSize: '1.8rem', color: '#0369a1' }}>{fmt(m.totalTTC)}</strong>
              </div>
              {(m.acompte?.montant || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>💳 Acompte ({m.acompte.pourcentage}%) :</span>
                  <strong>{fmt(m.acompte.montant)}</strong>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Formulaire Remise */}
      <div className="card" style={{ marginTop: '2rem', border: '2px solid #f59e0b' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
          <Tag size={18} /> Appliquer / Modifier une remise
        </h3>
        {(devis.montants?.montantRemise || 0) > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#92400e' }}>
              ⚠️ Remise active : <strong>
                {devis.montants.remise?.type === 'pourcentage'
                  ? `${devis.montants.remise.valeur}%`
                  : `${devis.montants.remise?.valeur} €`}
              </strong>{devis.montants.remise?.raison ? ` — ${devis.montants.remise.raison}` : ''}
            </span>
            <button
              onClick={supprimerRemise}
              disabled={applyingRemise}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              × Supprimer
            </button>
          </div>
        )}
        <form onSubmit={appliquerRemise} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Type de remise</label>
            <select
              value={remiseForm.type}
              onChange={e => setRemiseForm(f => ({ ...f, type: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
            >
              <option value="pourcentage">Pourcentage (%)</option>
              <option value="montant">Montant fixe (€)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
              Valeur {remiseForm.type === 'pourcentage' ? '(%)' : '(€)'}
            </label>
            <input
              type="number"
              min="0"
              max={remiseForm.type === 'pourcentage' ? '100' : undefined}
              step="0.01"
              placeholder={remiseForm.type === 'pourcentage' ? 'Ex: 10' : 'Ex: 50'}
              value={remiseForm.valeur}
              onChange={e => setRemiseForm(f => ({ ...f, valeur: e.target.value }))}
              required
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem', width: '120px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Raison (optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Fidélité, promotion..."
              value={remiseForm.raison}
              onChange={e => setRemiseForm(f => ({ ...f, raison: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={applyingRemise || !remiseForm.valeur}
            className="btn btn-success"
            style={{ whiteSpace: 'nowrap' }}
          >
            {applyingRemise ? '⏳ Application...' : '✅ Appliquer la remise'}
          </button>
        </form>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem', margin: '0.75rem 0 0' }}>
          Le client recevra un email de notification. Les montants (totalTTC, acompte) seront recalculés automatiquement.
        </p>
      </div>

      {/* Section signature admin */}
      {['transforme_contrat', 'contrat_signe'].includes(devis?.statut) && (
        <div className="card signature-section" style={{ marginTop: '2rem' }}>
          <h3>✍️ Signature prestataire</h3>
          {devis.statut === 'transforme_contrat' && (
            <p className="sig-desc" style={{ color: '#888' }}>
              ⏳ En attente de la signature du client avant votre signature.
            </p>
          )}
          {devis.statut === 'contrat_signe' && (
            <>
              <p className="sig-desc">
                Le client a signé. Apposez votre signature pour finaliser le contrat (statut → <strong>valide_final</strong>).
              </p>
              {adminSignFeedback && (
                <div className={`sig-feedback ${adminSignFeedback.type}`}>{adminSignFeedback.msg}</div>
              )}
              {devis.signatures?.admin?.dateSignature ? (
                <div className="sig-signed-badge">
                  ✅ Signé le {new Date(devis.signatures.admin.dateSignature).toLocaleDateString('fr-FR')}
                  {devis.signatures.admin.signePar && <> par <strong>{devis.signatures.admin.signePar}</strong></>}
                </div>
              ) : !showAdminSignPad ? (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => setShowAdminSignPad(true)}
                  style={{ marginTop: '8px' }}
                >
                  ✍️ Signer le contrat (prestataire)
                </button>
              ) : (
                <>
                  <label className="sig-input-label" style={{ marginTop: '12px' }}>Nom du signataire *</label>
                  <input
                    type="text"
                    className="sig-input"
                    value={adminSignataire}
                    onChange={e => setAdminSignataire(e.target.value)}
                    placeholder="Prénom Nom"
                  />
                  {signingAdmin ? (
                    <p style={{ color: '#555', textAlign: 'center' }}>⏳ Enregistrement...</p>
                  ) : (
                    <SignaturePad
                      label="Signature du prestataire"
                      onConfirm={signerContratAdmin}
                      onCancel={() => setShowAdminSignPad(false)}
                    />
                  )}
                </>
              )}
            </>
          )}
          {/* Rappel signature client */}
          {devis.signatures?.client?.dateSignature && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', fontSize: '0.88rem', color: '#166534' }}>
              ✍️ Client a signé le {new Date(devis.signatures.client.dateSignature).toLocaleDateString('fr-FR')}
              {devis.signatures.client.signePar && <> ({devis.signatures.client.signePar})</>}
            </div>
          )}
        </div>
      )}

      {devis?.statut === 'valide_final' && (
        <div className="card" style={{ marginTop: '2rem', border: '2px solid #27ae60' }}>
          <h3 style={{ color: '#27ae60', margin: '0 0 10px' }}>🏆 Contrat entièrement signé</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {devis.signatures?.client?.dateSignature && (
              <div className="sig-signed-badge">✅ Client : {new Date(devis.signatures.client.dateSignature).toLocaleDateString('fr-FR')}</div>
            )}
            {devis.signatures?.admin?.dateSignature && (
              <div className="sig-signed-badge">✅ Prestataire : {new Date(devis.signatures.admin.dateSignature).toLocaleDateString('fr-FR')}</div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {devis.notes && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📝 Notes</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{devis.notes}</p>
        </div>
      )}
    </div>
  );
}

export default DevisDetailAdmin;
