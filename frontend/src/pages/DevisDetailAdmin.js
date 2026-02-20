import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminContext from '../context/AdminContext';
import { ArrowLeft, Download, Edit, Trash2, Check, X, Calendar, User, Mail, Phone, MapPin, Package, Euro } from 'lucide-react';
import './AdminDashboard.css';
import './MesDevisPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * 📄 DÉTAIL DEVIS ADMIN
 */
function DevisDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useContext(AdminContext);
  
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatut, setUpdatingStatut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    chargerDevis();
  }, [id, isAuthenticated]);

  const chargerDevis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/devis/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDevis(response.data.devis);
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

  const getStatutBadge = (statut) => {
    const styles = {
      'brouillon': { bg: '#f3f4f6', color: '#374151', label: '🗒️ Brouillon' },
      'soumis': { bg: '#fef3c7', color: '#92400e', label: '📤 Soumis' },
      'en_etude': { bg: '#dbeafe', color: '#1e40af', label: '🔍 En étude' },
      'accepte': { bg: '#d1fae5', color: '#065f46', label: '✅ Accepté' },
      'refuse': { bg: '#fee2e2', color: '#991b1b', label: '❌ Refusé' },
      'annule': { bg: '#e5e7eb', color: '#374151', label: '🚫 Annulé' },
      'devis_final': { bg: '#e0e7ff', color: '#3730a3', label: '📝 Devis final' },
      'contrat_signe': { bg: '#dcfce7', color: '#166534', label: '✍️ Contrat signé' }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span>Sous-total:</span>
          <strong style={{ fontSize: '1.1rem' }}>{devis.sousTotal?.toFixed(2)} €</strong>
        </div>
        {devis.remise > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', color: '#16a34a' }}>
            <span>Remise ({devis.remisePourcentage}%):</span>
            <strong>- {devis.remise?.toFixed(2)} €</strong>
          </div>
        )}
        {devis.fraisSupplementaires > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span>Frais supplémentaires:</span>
            <strong>+ {devis.fraisSupplementaires?.toFixed(2)} €</strong>
          </div>
        )}
        <div style={{ borderTop: '2px solid #0ea5e9', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              <Euro size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              TOTAL:
            </span>
            <strong style={{ fontSize: '1.8rem', color: '#0369a1' }}>{devis.total?.toFixed(2)} €</strong>
          </div>
        </div>
      </div>

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
