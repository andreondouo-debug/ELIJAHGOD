import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionPrestationsAdmin.css';

import { API_URL } from '../config';

/**
 * 🎛️ INTERFACE ADMIN - GESTION PRESTATIONS AVANCÉE
 * Permet d'associer des prestataires aux prestations
 * Configurer les tarifs par nombre d'invités
 * Gérer les galeries et caractéristiques
 */
const GestionPrestationsAdmin = () => {
  const [prestations, setPrestations] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [selectedPrestation, setSelectedPrestation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('prestataires'); // prestataires, tarifs, galerie, contenu

  // États contenu (inclus / non inclus)
  const [editInclus, setEditInclus] = useState([]);
  const [editNonInclus, setEditNonInclus] = useState([]);
  const [contentModified, setContentModified] = useState(false);

  // États pour les modales
  const [isCreatingPrestation, setIsCreatingPrestation] = useState(false);
  const [isEditingPrestation, setIsEditingPrestation] = useState(false);
  const [isAddingPrestataire, setIsAddingPrestataire] = useState(false);
  const [isAddingTarif, setIsAddingTarif] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  // Édition prestation
  const [editPrestation, setEditPrestation] = useState({
    nom: '', description: '', categorie: '', prixBase: 0, dureeEstimee: '', disponible: true
  });
  const [editingPrestationId, setEditingPrestationId] = useState(null);

  // Données des formulaires
  const [newAssociation, setNewAssociation] = useState({
    prestataireId: '',
    disponibilite: 'disponible',
    ordre: 0,
    tarifSpecifique: null
  });

  const [newTarif, setNewTarif] = useState({
    min: 0,
    max: null,
    prix: 0,
    label: ''
  });

  const [newPhoto, setNewPhoto] = useState({
    url: '',
    type: 'image',
    description: '',
    ordre: 0,
    file: null  // Fichier à uploader
  });

  const [uploadMode, setUploadMode] = useState('url'); // 'url' ou 'file'

  const [newPrestation, setNewPrestation] = useState({
    nom: '',
    description: '',
    categorie: '',
    prixBase: 0,
    dureeEstimee: '',
    caracteristiques: [],
    disponible: true
  });

  // Charger les données
  useEffect(() => {
    fetchPrestations();
    fetchPrestataires();
  }, []);

  const fetchPrestations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/prestations`);
      setPrestations(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement prestations:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement' });
      setLoading(false);
    }
  };

  const fetchPrestataires = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/prestataires`);
      setPrestataires(data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement prestataires:', error);
    }
  };

  const handleSelectPrestation = (prestation) => {
    setSelectedPrestation(prestation);
    setEditInclus([...(prestation.inclus || [])]);
    setEditNonInclus([...(prestation.nonInclus || [])]);
    setContentModified(false);
    setActiveTab('prestataires');
  };

  // SAUVEGARDE CONTENU (inclus / non inclus)
  const handleSaveContenu = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        {
          inclus: editInclus.filter(i => i.trim() !== ''),
          nonInclus: editNonInclus.filter(i => i.trim() !== '')
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: '✅ Contenu mis à jour !' });
      setContentModified(false);
      setSelectedPrestation(data.data);
      setEditInclus([...(data.data.inclus || [])]);
      setEditNonInclus([...(data.data.nonInclus || [])]);
      await fetchPrestations();
    } catch (error) {
      console.error('❌ Erreur sauvegarde contenu:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du contenu' });
    } finally {
      setSaving(false);
    }
  };

  // CRÉATION D'UNE NOUVELLE PRESTATION

  const handleCreatePrestation = async () => {
    if (!newPrestation.nom || !newPrestation.categorie || !newPrestation.description) {
      setMessage({ type: 'error', text: '❌ Nom, catégorie et description requis' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const prestationData = {
        ...newPrestation,
        prixBase: parseFloat(newPrestation.prixBase) || 0,
        caracteristiques: newPrestation.caracteristiques.filter(c => c.trim() !== '')
      };

      const { data } = await axios.post(
        `${API_URL}/api/prestations`,
        prestationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Prestation créée avec succès !' });
      setIsCreatingPrestation(false);
      setNewPrestation({
        nom: '',
        description: '',
        categorie: '',
        prixBase: 0,
        dureeEstimee: '',
        caracteristiques: [],
        disponible: true
      });
      
      // Recharger la liste et sélectionner la nouvelle prestation
      await fetchPrestations();
      setSelectedPrestation(data.data);

    } catch (error) {
      console.error('❌ Erreur création prestation:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la création' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCaracteristique = () => {
    setNewPrestation({
      ...newPrestation,
      caracteristiques: [...newPrestation.caracteristiques, '']
    });
  };

  const handleUpdateCaracteristique = (index, value) => {
    const updated = [...newPrestation.caracteristiques];
    updated[index] = value;
    setNewPrestation({ ...newPrestation, caracteristiques: updated });
  };

  const handleRemoveCaracteristique = (index) => {
    const updated = newPrestation.caracteristiques.filter((_, idx) => idx !== index);
    setNewPrestation({ ...newPrestation, caracteristiques: updated });
  };

  // GESTION DES PRESTATAIRES ASSOCIÉS

  const handleAddPrestataire = async () => {
    if (!newAssociation.prestataireId) {
      setMessage({ type: 'error', text: 'Sélectionnez un prestataire' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedAssociations = [
        ...(selectedPrestation.prestatairesAssocies || []),
        {
          prestataireId: newAssociation.prestataireId,
          disponibilite: newAssociation.disponibilite,
          ordre: newAssociation.ordre,
          tarifSpecifique: newAssociation.tarifSpecifique
        }
      ];

      await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        { prestatairesAssocies: updatedAssociations },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Prestataire ajouté !' });
      setIsAddingPrestataire(false);
      setNewAssociation({
        prestataireId: '',
        disponibilite: 'disponible',
        ordre: 0,
        tarifSpecifique: null
      });
      
      // Recharger
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur ajout prestataire:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePrestataire = async (index) => {
    if (!window.confirm('Supprimer cette association ?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedAssociations = selectedPrestation.prestatairesAssocies.filter(
        (_, idx) => idx !== index
      );

      await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        { prestatairesAssocies: updatedAssociations },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Association supprimée' });
      
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setSaving(false);
    }
  };

  // GESTION DES TARIFS PAR INVITÉS

  const handleAddTarif = async () => {
    if (newTarif.prix <= 0) {
      setMessage({ type: 'error', text: 'Prix invalide' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedTarifs = [
        ...(selectedPrestation.tarifsParInvites || []),
        {
          min: parseInt(newTarif.min),
          max: newTarif.max ? parseInt(newTarif.max) : null,
          prix: parseFloat(newTarif.prix),
          label: newTarif.label
        }
      ];

      await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        { tarifsParInvites: updatedTarifs },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Tarif ajouté !' });
      setIsAddingTarif(false);
      setNewTarif({ min: 0, max: null, prix: 0, label: '' });
      
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur ajout tarif:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTarif = async (index) => {
    if (!window.confirm('Supprimer ce tarif ?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedTarifs = selectedPrestation.tarifsParInvites.filter(
        (_, idx) => idx !== index
      );

      await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        { tarifsParInvites: updatedTarifs },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Tarif supprimé' });
      
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setSaving(false);
    }
  };

  // GESTION DE LA GALERIE

  const handleAddPhoto = async () => {
    // Mode URL: Vérifier que l'URL est fournie
    if (uploadMode === 'url' && !newPhoto.url) {
      setMessage({ type: 'error', text: '❌ URL requise' });
      return;
    }

    // Mode fichier: Vérifier qu'un fichier est sélectionné
    if (uploadMode === 'file' && !newPhoto.file) {
      setMessage({ type: 'error', text: '❌ Fichier requis' });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Mode fichier: Upload vers le serveur
      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('imagePrestation', newPhoto.file);
        formData.append('description', newPhoto.description);

        const { data } = await axios.post(
          `${API_URL}/api/prestations/${selectedPrestation._id}/upload-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        setMessage({ type: 'success', text: '✅ Fichier uploadé avec succès !' });
      } else {
        // Mode URL: Ajout direct à la galerie
        const updatedGalerie = [
          ...(selectedPrestation.galerie || []),
          {
            url: newPhoto.url,
            type: newPhoto.type,
            description: newPhoto.description,
            ordre: parseInt(newPhoto.ordre),
            miniature: newPhoto.url
          }
        ];

        await axios.put(
          `${API_URL}/api/prestations/${selectedPrestation._id}`,
          { galerie: updatedGalerie },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessage({ type: 'success', text: '✅ Photo ajoutée !' });
      }
      
      setIsAddingPhoto(false);
      setNewPhoto({ url: '', type: 'image', description: '', ordre: 0, file: null });
      setUploadMode('url');
      
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur ajout photo:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'ajout' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto({ ...newPhoto, file });
    }
  };

  const handleRemovePhoto = async (index) => {
    if (!window.confirm('Supprimer cette photo ?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updatedGalerie = selectedPrestation.galerie.filter(
        (_, idx) => idx !== index
      );

      await axios.put(
        `${API_URL}/api/prestations/${selectedPrestation._id}`,
        { galerie: updatedGalerie },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Photo supprimée' });
      
      await fetchPrestations();
      const updated = prestations.find(p => p._id === selectedPrestation._id);
      setSelectedPrestation(updated);

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setSaving(false);
    }
  };

  const getPrestataireNom = (id) => {
    const prest = prestataires.find(p => p._id === id);
    return prest ? prest.nomEntreprise : 'Inconnu';
  };

  // SUPPRESSION D'UNE PRESTATION
  const handleDeletePrestation = async (e, prestation) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer définitivement "${prestation.nom}" ?`)) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/prestations/${prestation._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: '✅ Prestation supprimée' });
      if (selectedPrestation?._id === prestation._id) setSelectedPrestation(null);
      await fetchPrestations();
    } catch (error) {
      console.error('❌ Erreur suppression prestation:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setSaving(false);
    }
  };

  // OUVERTURE MODALE ÉDITION PRESTATION
  const handleOpenEditPrestation = (e, prestation) => {
    e.stopPropagation();
    setEditingPrestationId(prestation._id);
    setEditPrestation({
      nom: prestation.nom || '',
      description: prestation.description || '',
      categorie: prestation.categorie || '',
      prixBase: prestation.prixBase || 0,
      dureeEstimee: prestation.dureeEstimee || '',
      disponible: prestation.disponible !== false
    });
    setIsEditingPrestation(true);
  };

  // SAUVEGARDE ÉDITION PRESTATION
  const handleSaveEditPrestation = async () => {
    if (!editPrestation.nom || !editPrestation.categorie || !editPrestation.description) {
      setMessage({ type: 'error', text: '❌ Nom, catégorie et description requis' });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.put(
        `${API_URL}/api/prestations/${editingPrestationId}`,
        { ...editPrestation, prixBase: parseFloat(editPrestation.prixBase) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: '✅ Prestation modifiée avec succès !' });
      setIsEditingPrestation(false);
      setEditingPrestationId(null);
      await fetchPrestations();
      if (selectedPrestation?._id === data.data?._id) setSelectedPrestation(data.data);
    } catch (error) {
      console.error('❌ Erreur édition prestation:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la modification' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="gestion-prestations-admin">
        <div className="loading-center">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="gestion-prestations-admin">
      <div className="admin-header">
        <h1>🎛️ Gestion avancée des prestations</h1>
        <p>Associez des prestataires, configurez les tarifs et gérez les galeries</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      {/* MODAL CRÉATION PRESTATION */}
      {isCreatingPrestation && (
        <div className="modal-overlay" onClick={() => setIsCreatingPrestation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Créer une nouvelle prestation</h2>
              <button className="modal-close" onClick={() => setIsCreatingPrestation(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nom de la prestation *</label>
                <input
                  type="text"
                  placeholder="Ex: DJ Professionnel"
                  value={newPrestation.nom}
                  onChange={(e) => setNewPrestation({ ...newPrestation, nom: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Catégorie *</label>
                <select
                  value={newPrestation.categorie}
                  onChange={(e) => setNewPrestation({ ...newPrestation, categorie: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  <option value="DJ">🎧 DJ</option>
                  <option value="Photographe">📸 Photographe</option>
                  <option value="Vidéaste">🎬 Vidéaste</option>
                  <option value="Animateur">🎤 Animateur</option>
                  <option value="Groupe de louange">🎵 Groupe de louange</option>
                  <option value="Wedding planner">💍 Wedding planner</option>
                  <option value="Traiteur">🍽️ Traiteur</option>
                  <option value="Sonorisation">🔊 Sonorisation</option>
                  <option value="Éclairage">💡 Éclairage</option>
                  <option value="Décoration">🎨 Décoration</option>
                  <option value="Animation">🎭 Animation</option>
                  <option value="Pack Complet">📦 Pack Complet</option>
                  <option value="Location matériel">🛠️ Location matériel</option>
                  <option value="Autre">➕ Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Décrivez la prestation en détail..."
                  value={newPrestation.description}
                  onChange={(e) => setNewPrestation({ ...newPrestation, description: e.target.value })}
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix de base (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newPrestation.prixBase}
                    onChange={(e) => setNewPrestation({ ...newPrestation, prixBase: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Durée estimée</label>
                  <input
                    type="text"
                    placeholder="Ex: 4 heures"
                    value={newPrestation.dureeEstimee}
                    onChange={(e) => setNewPrestation({ ...newPrestation, dureeEstimee: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Caractéristiques</label>
                <div className="caracteristiques-list">
                  {newPrestation.caracteristiques.map((carac, idx) => (
                    <div key={idx} className="caracteristique-item">
                      <input
                        type="text"
                        placeholder="Ex: Matériel professionnel inclus"
                        value={carac}
                        onChange={(e) => handleUpdateCaracteristique(idx, e.target.value)}
                        className="form-input"
                      />
                      <button 
                        className="btn-remove-small"
                        onClick={() => handleRemoveCaracteristique(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    className="btn-add-caracteristique"
                    onClick={handleAddCaracteristique}
                  >
                    ➕ Ajouter une caractéristique
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newPrestation.disponible}
                    onChange={(e) => setNewPrestation({ ...newPrestation, disponible: e.target.checked })}
                  />
                  <span>Prestation disponible</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsCreatingPrestation(false)}
                disabled={saving}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreatePrestation}
                disabled={saving || !newPrestation.nom || !newPrestation.categorie}
              >
                {saving ? '⏳ Création...' : '✅ Créer la prestation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ÉDITION PRESTATION */}
      {isEditingPrestation && (
        <div className="modal-overlay" onClick={() => setIsEditingPrestation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Modifier la prestation</h2>
              <button className="modal-close" onClick={() => setIsEditingPrestation(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" className="form-input"
                  value={editPrestation.nom}
                  onChange={(e) => setEditPrestation({ ...editPrestation, nom: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Catégorie *</label>
                <select className="form-input"
                  value={editPrestation.categorie}
                  onChange={(e) => setEditPrestation({ ...editPrestation, categorie: e.target.value })}
                >
                  <option value="">-- Sélectionner --</option>
                  {['DJ', 'Photographe', 'Vidéaste', 'Animateur', 'Groupe de louange', 'Wedding planner', 'Traiteur', 'Sonorisation', 'Éclairage', 'Décoration', 'Animation', 'Pack Complet', 'Location matériel', 'Autre'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="3"
                  value={editPrestation.description}
                  onChange={(e) => setEditPrestation({ ...editPrestation, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix de base (€)</label>
                  <input type="number" step="0.01" min="0" className="form-input"
                    value={editPrestation.prixBase}
                    onChange={(e) => setEditPrestation({ ...editPrestation, prixBase: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Durée estimée</label>
                  <input type="text" placeholder="Ex: 4 heures" className="form-input"
                    value={editPrestation.dureeEstimee}
                    onChange={(e) => setEditPrestation({ ...editPrestation, dureeEstimee: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox"
                    checked={editPrestation.disponible}
                    onChange={(e) => setEditPrestation({ ...editPrestation, disponible: e.target.checked })}
                  />
                  <span>Prestation disponible</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditingPrestation(false)} disabled={saving}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSaveEditPrestation}
                disabled={saving || !editPrestation.nom || !editPrestation.categorie || !editPrestation.description}
              >
                {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* LISTE DES PRESTATIONS */}
        <div className="prestations-sidebar">
          <div className="sidebar-header">
            <h2>📋 Prestations</h2>
            <button 
              className="btn-create-prestation"
              onClick={() => setIsCreatingPrestation(true)}
              title="Créer une nouvelle prestation"
            >
              ➕ Nouvelle
            </button>
          </div>
          <div className="prestations-list">
            {prestations.map(prestation => (
              <div
                key={prestation._id}
                className={`prestation-item ${selectedPrestation?._id === prestation._id ? 'active' : ''}`}
                onClick={() => handleSelectPrestation(prestation)}
              >
                <div className="prestation-item-nom">{prestation.nom}</div>
                <div className="prestation-item-badges">
                  <span className="badge">{prestation.prestatairesAssocies?.length || 0} prestataires</span>
                  <span className="badge">{prestation.tarifsParInvites?.length || 0} tarifs</span>
                </div>
                <div className="prestation-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-edit-small"
                    title="Modifier"
                    onClick={(e) => handleOpenEditPrestation(e, prestation)}
                  >✏️</button>
                  <button
                    className="btn-delete-small"
                    title="Supprimer"
                    onClick={(e) => handleDeletePrestation(e, prestation)}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DÉTAILS DE LA PRESTATION SÉLECTIONNÉE */}
        <div className="prestation-details">
          {!selectedPrestation ? (
            <div className="empty-state">
              <p>👈 Sélectionnez une prestation pour commencer</p>
            </div>
          ) : (
            <>
              <div className="details-header">
                <h2>{selectedPrestation.nom}</h2>
                <span className="categorie-badge">{selectedPrestation.categorie}</span>
              </div>

              {/* TABS */}
              <div className="details-tabs">
                <button
                  className={`tab ${activeTab === 'prestataires' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prestataires')}
                >
                  👥 Prestataires ({selectedPrestation.prestatairesAssocies?.length || 0})
                </button>
                <button
                  className={`tab ${activeTab === 'tarifs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tarifs')}
                >
                  💰 Tarifs ({selectedPrestation.tarifsParInvites?.length || 0})
                </button>
                <button
                  className={`tab ${activeTab === 'galerie' ? 'active' : ''}`}
                  onClick={() => setActiveTab('galerie')}
                >
                  📸 Galerie ({selectedPrestation.galerie?.length || 0})
                </button>
                <button
                  className={`tab ${activeTab === 'contenu' ? 'active' : ''}${contentModified ? ' tab-modified' : ''}`}
                  onClick={() => setActiveTab('contenu')}
                >
                  📝 Contenu {contentModified ? '●' : `(${(selectedPrestation.inclus?.length || 0) + (selectedPrestation.nonInclus?.length || 0)})`}
                </button>
              </div>

              {/* CONTENU DES TABS */}
              <div className="details-content">
                
                {/* TAB PRESTATAIRES */}
                {activeTab === 'prestataires' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h3>Prestataires associés</h3>
                      <button
                        className="btn-primary"
                        onClick={() => setIsAddingPrestataire(true)}
                      >
                        + Ajouter un prestataire
                      </button>
                    </div>

                    {isAddingPrestataire && (
                      <div className="add-form">
                        <h4>Ajouter un prestataire</h4>
                        <div className="form-row">
                          <select
                            value={newAssociation.prestataireId}
                            onChange={(e) => setNewAssociation({ ...newAssociation, prestataireId: e.target.value })}
                          >
                            <option value="">-- Sélectionner --</option>
                            {prestataires.map(p => (
                              <option key={p._id} value={p._id}>
{p.nomEntreprise} ({p.categorie})
                              </option>
                            ))}
                          </select>

                          <select
                            value={newAssociation.disponibilite}
                            onChange={(e) => setNewAssociation({ ...newAssociation, disponibilite: e.target.value })}
                          >
                            <option value="disponible">Disponible</option>
                            <option value="sur_demande">Sur demande</option>
                            <option value="indisponible">Indisponible</option>
                          </select>

                          <input
                            type="number"
                            placeholder="Ordre (0 = premier)"
                            value={newAssociation.ordre}
                            onChange={(e) => setNewAssociation({ ...newAssociation, ordre: e.target.value })}
                          />

                          <input
                            type="number"
                            placeholder="Tarif spécifique (optionnel)"
                            value={newAssociation.tarifSpecifique || ''}
                            onChange={(e) => setNewAssociation({ ...newAssociation, tarifSpecifique: e.target.value || null })}
                          />
                        </div>

                        <div className="form-actions">
                          <button className="btn-secondary" onClick={() => setIsAddingPrestataire(false)}>
                            Annuler
                          </button>
                          <button className="btn-primary" onClick={handleAddPrestataire} disabled={saving}>
                            {saving ? 'Ajout...' : 'Ajouter'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="associations-list">
                      {selectedPrestation.prestatairesAssocies?.length === 0 ? (
                        <p className="empty-message">Aucun prestataire associé</p>
                      ) : (
                        selectedPrestation.prestatairesAssocies?.map((assoc, idx) => (
                          <div key={idx} className="association-item">
                            <div className="association-info">
                              <strong>{getPrestataireNom(assoc.prestataireId)}</strong>
                              <span className={`dispo-badge ${assoc.disponibilite}`}>
                                {assoc.disponibilite === 'disponible' && '✅ Disponible'}
                                {assoc.disponibilite === 'sur_demande' && '📞 Sur demande'}
                                {assoc.disponibilite === 'indisponible' && '❌ Indisponible'}
                              </span>
                              {assoc.tarifSpecifique && (
                                <span className="tarif-badge">{assoc.tarifSpecifique}€</span>
                              )}
                            </div>
                            <button
                              className="btn-danger-small"
                              onClick={() => handleRemovePrestataire(idx)}
                            >
                              🗑️
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB TARIFS */}
                {activeTab === 'tarifs' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h3>Tarifs par nombre d'invités</h3>
                      <button
                        className="btn-primary"
                        onClick={() => setIsAddingTarif(true)}
                      >
                        + Ajouter un tarif
                      </button>
                    </div>

                    {isAddingTarif && (
                      <div className="add-form">
                        <h4>Ajouter un tarif</h4>
                        <div className="form-row">
                          <input
                            type="text"
                            placeholder="Libellé (ex: Petit événement)"
                            value={newTarif.label}
                            onChange={(e) => setNewTarif({ ...newTarif, label: e.target.value })}
                          />

                          <input
                            type="number"
                            placeholder="Min invités"
                            value={newTarif.min}
                            onChange={(e) => setNewTarif({ ...newTarif, min: e.target.value })}
                          />

                          <input
                            type="number"
                            placeholder="Max invités (vide = illimité)"
                            value={newTarif.max || ''}
                            onChange={(e) => setNewTarif({ ...newTarif, max: e.target.value || null })}
                          />

                          <input
                            type="number"
                            step="0.01"
                            placeholder="Prix (€)"
                            value={newTarif.prix}
                            onChange={(e) => setNewTarif({ ...newTarif, prix: e.target.value })}
                          />
                        </div>

                        <div className="form-actions">
                          <button className="btn-secondary" onClick={() => setIsAddingTarif(false)}>
                            Annuler
                          </button>
                          <button className="btn-primary" onClick={handleAddTarif} disabled={saving}>
                            {saving ? 'Ajout...' : 'Ajouter'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="tarifs-table">
                      {selectedPrestation.tarifsParInvites?.length === 0 ? (
                        <p className="empty-message">Aucun tarif configuré. Le prix de base sera utilisé.</p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>Libellé</th>
                              <th>Invités</th>
                              <th>Prix</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPrestation.tarifsParInvites?.map((tarif, idx) => (
                              <tr key={idx}>
                                <td>{tarif.label || '-'}</td>
                                <td>
                                  {tarif.min} - {tarif.max || '∞'}
                                </td>
                                <td>{tarif.prix}€</td>
                                <td>
                                  <button
                                    className="btn-danger-small"
                                    onClick={() => handleRemoveTarif(idx)}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB CONTENU (inclus / non inclus) */}
                {activeTab === 'contenu' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h3>Contenu de la prestation</h3>
                      {contentModified && (
                        <button className="btn-primary" onClick={handleSaveContenu} disabled={saving}>
                          {saving ? '⏳ Sauvegarde...' : '💾 Enregistrer les modifications'}
                        </button>
                      )}
                    </div>

                    <div className="contenu-grid">
                      {/* CE QUI EST INCLUS */}
                      <div className="contenu-section contenu-inclus">
                        <h4 className="contenu-section-title">✅ Ce qui est inclus</h4>
                        <div className="inclus-list">
                          {editInclus.map((item, idx) => (
                            <div key={idx} className="inclus-item">
                              <input
                                type="text"
                                value={item}
                                placeholder="Ex: Matériel professionnel inclus"
                                className="form-input"
                                onChange={(e) => {
                                  const updated = [...editInclus];
                                  updated[idx] = e.target.value;
                                  setEditInclus(updated);
                                  setContentModified(true);
                                }}
                              />
                              <button
                                className="btn-remove-small"
                                title="Supprimer"
                                onClick={() => {
                                  setEditInclus(editInclus.filter((_, i) => i !== idx));
                                  setContentModified(true);
                                }}
                              >✕</button>
                            </div>
                          ))}
                          {editInclus.length === 0 && (
                            <p className="empty-message">Aucun élément inclus. Cliquez ➕ pour en ajouter.</p>
                          )}
                          <button
                            className="btn-add-caracteristique"
                            onClick={() => {
                              setEditInclus([...editInclus, '']);
                              setContentModified(true);
                            }}
                          >
                            ➕ Ajouter un élément inclus
                          </button>
                        </div>
                      </div>

                      {/* CE QUI N'EST PAS INCLUS */}
                      <div className="contenu-section contenu-non-inclus">
                        <h4 className="contenu-section-title">❌ Ce qui n'est pas inclus</h4>
                        <div className="inclus-list">
                          {editNonInclus.map((item, idx) => (
                            <div key={idx} className="inclus-item">
                              <input
                                type="text"
                                value={item}
                                placeholder="Ex: Transport non inclus"
                                className="form-input"
                                onChange={(e) => {
                                  const updated = [...editNonInclus];
                                  updated[idx] = e.target.value;
                                  setEditNonInclus(updated);
                                  setContentModified(true);
                                }}
                              />
                              <button
                                className="btn-remove-small"
                                title="Supprimer"
                                onClick={() => {
                                  setEditNonInclus(editNonInclus.filter((_, i) => i !== idx));
                                  setContentModified(true);
                                }}
                              >✕</button>
                            </div>
                          ))}
                          {editNonInclus.length === 0 && (
                            <p className="empty-message">Aucun élément non inclus. Cliquez ➕ pour en ajouter.</p>
                          )}
                          <button
                            className="btn-add-caracteristique btn-non-inclus"
                            onClick={() => {
                              setEditNonInclus([...editNonInclus, '']);
                              setContentModified(true);
                            }}
                          >
                            ➕ Ajouter un élément non inclus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB GALERIE */}
                {activeTab === 'galerie' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h3>Galerie photos</h3>
                      <button
                        className="btn-primary"
                        onClick={() => setIsAddingPhoto(true)}
                      >
                        + Ajouter une photo
                      </button>
                    </div>

                    {isAddingPhoto && (
                      <div className="add-form">
                        <h4>Ajouter une photo/vidéo</h4>
                        
                        {/* Sélecteur de mode */}
                        <div className="upload-mode-selector">
                          <button
                            type="button"
                            className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
                            onClick={() => setUploadMode('url')}
                          >
                            🔗 URL
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
                            onClick={() => setUploadMode('file')}
                          >
                            📤 Upload fichier
                          </button>
                        </div>

                        <div className="form-column">
                          {uploadMode === 'url' ? (
                            <>
                              <input
                                type="url"
                                placeholder="URL de la photo/vidéo"
                                value={newPhoto.url}
                                onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                                className="form-input"
                              />
                              <input
                                type="number"
                                placeholder="Ordre d'affichage"
                                value={newPhoto.ordre}
                                onChange={(e) => setNewPhoto({ ...newPhoto, ordre: e.target.value })}
                                className="form-input"
                              />
                            </>
                          ) : (
                            <div className="file-upload-zone">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                id="file-upload"
                                className="file-input"
                              />
                              <label htmlFor="file-upload" className="file-upload-label">
                                {newPhoto.file ? (
                                  <>
                                    <span className="file-icon">✅</span>
                                    <span className="file-name">{newPhoto.file.name}</span>
                                    <span className="file-size">({(newPhoto.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="upload-icon">📸</span>
                                    <span>Cliquez pour choisir un fichier</span>
                                    <span className="upload-hint">Images: JPG, PNG, GIF, WEBP • Vidéos: MP4, MOV (max 50MB)</span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}

                          <textarea
                            placeholder="Description (optionnelle)"
                            value={newPhoto.description}
                            onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                            rows="2"
                            className="form-input"
                          />
                        </div>

                        <div className="form-actions">
                          <button 
                            type="button"
                            className="btn-secondary" 
                            onClick={() => {
                              setIsAddingPhoto(false);
                              setNewPhoto({ url: '', type: 'image', description: '', ordre: 0, file: null });
                              setUploadMode('url');
                            }}
                          >
                            Annuler
                          </button>
                          <button 
                            type="button"
                            className="btn-primary" 
                            onClick={handleAddPhoto} 
                            disabled={saving || (uploadMode === 'url' && !newPhoto.url) || (uploadMode === 'file' && !newPhoto.file)}
                          >
                            {saving ? '⏳ Upload...' : '✅ Ajouter'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="galerie-grid">
                      {selectedPrestation.galerie?.length === 0 ? (
                        <p className="empty-message">Aucune photo/vidéo dans la galerie</p>
                      ) : (
                        selectedPrestation.galerie?.map((photo, idx) => (
                          <div key={idx} className="galerie-item">
                            {photo.type === 'video' || photo.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
                              <video 
                                src={photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`} 
                                controls 
                                preload="metadata"
                              >
                                Votre navigateur ne supporte pas la vidéo.
                              </video>
                            ) : (
                              <img 
                                src={photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`} 
                                alt={photo.description || `Photo ${idx + 1}`} 
                              />
                            )}
                            <div className="galerie-item-overlay">
                              <span className="media-type-badge">
                                {photo.type === 'video' || photo.url?.match(/\.(mp4|mov|avi|webm)$/i) ? '🎬 Vidéo' : '📸 Image'}
                              </span>
                              <p>{photo.description || 'Sans description'}</p>
                              <button
                                className="btn-danger-small"
                                onClick={() => handleRemovePhoto(idx)}
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionPrestationsAdmin;
