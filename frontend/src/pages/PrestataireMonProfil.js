import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrestataireContext } from '../context/PrestataireContext';
import './PrestataireMonProfil.css';

import { API_URL } from '../config';

/**
 * ✏️ MON PROFIL PRESTATAIRE
 * Permet au prestataire de modifier ses informations et d'ajouter des médias
 */
function PrestataireMonProfil() {
  const { prestataire, mettreAJourProfil, uploadMedia, isAuthenticated, loading } =
    useContext(PrestataireContext);
  const navigate = useNavigate();

  // --- Formulaire info de base ---
  const [form, setForm] = useState({
    nomEntreprise: prestataire?.nomEntreprise || '',
    description: prestataire?.description || '',
    telephone: prestataire?.telephone || '',
    siteWeb: prestataire?.siteWeb || '',
    specialites: prestataire?.specialites?.join(', ') || '',
    adresseVille: prestataire?.adresse?.ville || '',
    adresseCodePostal: prestataire?.adresse?.codePostal || '',
    instagram: prestataire?.reseauxSociaux?.instagram || '',
    facebook: prestataire?.reseauxSociaux?.facebook || '',
    youtube: prestataire?.reseauxSociaux?.youtube || '',
    video: prestataire?.video || '',
  });
  const [sauvegardeOk, setSauvegardeOk] = useState(false);
  const [erreurForm, setErreurForm] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  // --- Upload médias ---
  const [fichiersSelectionnes, setFichiersSelectionnes] = useState([]);
  const [aperçus, setAperçus] = useState([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [uploadOk, setUploadOk] = useState(false);
  const [erreurUpload, setErreurUpload] = useState('');
  const inputFichierRef = useRef(null);

  // Redirection si non connecté (dans useEffect pour éviter l'appel navigate pendant le rendu)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/prestataire/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !prestataire) {
    return (
      <div className="mon-profil-loading">
        <div className="spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // Gestion du formulaire de profil
  // ──────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSauvegardeOk(false);
    setErreurForm('');
  };

  const handleSubmitProfil = async (e) => {
    e.preventDefault();
    setEnregistrement(true);
    setErreurForm('');
    try {
      const payload = {
        nomEntreprise: form.nomEntreprise,
        description: form.description,
        telephone: form.telephone,
        siteWeb: form.siteWeb,
        specialites: form.specialites
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        adresse: {
          ville: form.adresseVille,
          codePostal: form.adresseCodePostal,
        },
        reseauxSociaux: {
          instagram: form.instagram,
          facebook: form.facebook,
          youtube: form.youtube,
        },
        video: form.video,
      };

      await mettreAJourProfil(payload);
      setSauvegardeOk(true);
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err);
      setErreurForm(
        err.response?.data?.message || 'Erreur lors de la mise à jour. Réessayez.'
      );
    } finally {
      setEnregistrement(false);
    }
  };

  // ──────────────────────────────────────────
  // Gestion de l'upload de médias
  // ──────────────────────────────────────────
  const handleSelectFichiers = (e) => {
    const selectes = Array.from(e.target.files);
    setFichiersSelectionnes(selectes);
    setUploadOk(false);
    setErreurUpload('');

    // Générer les aperçus locaux
    const urls = selectes.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      nom: f.name,
    }));
    setAperçus(urls);
  };

  const handleUploadMedia = async () => {
    if (!fichiersSelectionnes.length) return;
    setUploadEnCours(true);
    setErreurUpload('');

    try {
      await uploadMedia(fichiersSelectionnes);
      setUploadOk(true);
      setFichiersSelectionnes([]);
      setAperçus([]);
      if (inputFichierRef.current) inputFichierRef.current.value = '';
    } catch (err) {
      console.error('❌ Erreur upload médias:', err);
      setErreurUpload(
        err.response?.data?.message || 'Erreur lors de l\'envoi des fichiers. Réessayez.'
      );
    } finally {
      setUploadEnCours(false);
    }
  };

  const supprimerAperçu = (index) => {
    const nouveauxFichiers = fichiersSelectionnes.filter((_, i) => i !== index);
    const nouveauxAperçus = aperçus.filter((_, i) => i !== index);
    setFichiersSelectionnes(nouveauxFichiers);
    setAperçus(nouveauxAperçus);
  };

  return (
    <div className="mon-profil-page">
      <div className="mon-profil-container">
        {/* En-tête */}
        <div className="mon-profil-header">
          <button className="btn-retour" onClick={() => navigate('/prestataire/dashboard')}>
            ← Retour au tableau de bord
          </button>
          <h1>✏️ Mon Profil</h1>
          <p className="sous-titre">
            Personnalisez votre profil public visible par les clients
          </p>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 1 — Informations professionnelles  */}
        {/* ═══════════════════════════════════════════ */}
        <section className="section-card">
          <h2>📋 Informations professionnelles</h2>
          <form onSubmit={handleSubmitProfil} className="form-profil">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nomEntreprise">Nom de l'entreprise *</label>
                <input
                  id="nomEntreprise"
                  name="nomEntreprise"
                  type="text"
                  value={form.nomEntreprise}
                  onChange={handleChange}
                  placeholder="Mon Entreprise"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div className="form-group form-full">
                <label htmlFor="description">
                  Description <span className="info">(max 1000 caractères)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre activité, votre style, votre expérience..."
                />
                <span className="char-count">{form.description.length}/1000</span>
              </div>

              <div className="form-group form-full">
                <label htmlFor="specialites">
                  Spécialités <span className="info">(séparées par des virgules)</span>
                </label>
                <input
                  id="specialites"
                  name="specialites"
                  type="text"
                  value={form.specialites}
                  onChange={handleChange}
                  placeholder="Mariage, Anniversaire, Soirée d'entreprise"
                />
              </div>

              <div className="form-group">
                <label htmlFor="adresseVille">Ville</label>
                <input
                  id="adresseVille"
                  name="adresseVille"
                  type="text"
                  value={form.adresseVille}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>

              <div className="form-group">
                <label htmlFor="adresseCodePostal">Code postal</label>
                <input
                  id="adresseCodePostal"
                  name="adresseCodePostal"
                  type="text"
                  value={form.adresseCodePostal}
                  onChange={handleChange}
                  placeholder="75001"
                />
              </div>

              <div className="form-group form-full">
                <label htmlFor="siteWeb">Site web</label>
                <input
                  id="siteWeb"
                  name="siteWeb"
                  type="url"
                  value={form.siteWeb}
                  onChange={handleChange}
                  placeholder="https://mon-site.fr"
                />
              </div>
            </div>

            <h3 className="sous-section-titre">🔗 Réseaux sociaux</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  id="instagram"
                  name="instagram"
                  type="url"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/moncompte"
                />
              </div>
              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  value={form.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/mapage"
                />
              </div>
              <div className="form-group">
                <label htmlFor="youtube">YouTube</label>
                <input
                  id="youtube"
                  name="youtube"
                  type="url"
                  value={form.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/c/machaîne"
                />
              </div>
              <div className="form-group">
                <label htmlFor="video">
                  🎬 Vidéo de présentation <span className="info">(URL YouTube/Vimeo)</span>
                </label>
                <input
                  id="video"
                  name="video"
                  type="url"
                  value={form.video}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="form-actions">
              {sauvegardeOk && (
                <span className="succes-message">✅ Profil mis à jour !</span>
              )}
              {erreurForm && (
                <span className="erreur-message">❌ {erreurForm}</span>
              )}
              <button
                type="submit"
                className="btn-primaire"
                disabled={enregistrement}
              >
                {enregistrement ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* SECTION 2 — Galerie photos & vidéos        */}
        {/* ═══════════════════════════════════════════ */}
        <section className="section-card">
          <h2>📸 Galerie de médias</h2>
          <p className="section-desc">
            Ajoutez des photos et vidéos pour illustrer votre travail.
            Formats acceptés : JPG, PNG, WebP, GIF, MP4, MOV (max 50 Mo par fichier).
          </p>

          {/* Photos existantes */}
          {prestataire.photos && prestataire.photos.length > 0 && (
            <div className="galerie-actuelle">
              <h4>Photos actuelles ({prestataire.photos.length})</h4>
              <div className="galerie-grille">
                {prestataire.photos.map((photo, i) => (
                  <div key={i} className="galerie-item">
                    <img
                      src={
                        photo.url.startsWith('/')
                          ? `${API_URL}${photo.url}`
                          : photo.url
                      }
                      alt={photo.description || `Photo ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vidéo de présentation existante */}
          {prestataire.video && (
            <div className="video-actuelle">
              <h4>Vidéo de présentation</h4>
              {prestataire.video.startsWith('/') ? (
                <video controls className="video-player">
                  <source
                    src={`${API_URL}${prestataire.video}`}
                    type="video/mp4"
                  />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <a
                  href={prestataire.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lien-video"
                >
                  🎬 Voir la vidéo de présentation ↗
                </a>
              )}
            </div>
          )}

          {/* Zone de dépôt / sélection de fichiers */}
          <div className="zone-upload">
            <div
              className="dropzone"
              onClick={() => inputFichierRef.current?.click()}
            >
              <span className="dropzone-icone">📁</span>
              <p>Cliquez pour sélectionner des images ou vidéos</p>
              <p className="dropzone-sous">
                JPG · PNG · WebP · GIF · MP4 · MOV — max 50 Mo / fichier
              </p>
              <input
                ref={inputFichierRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleSelectFichiers}
                className="input-fichier-cache"
              />
            </div>

            {/* Aperçu des fichiers sélectionnés */}
            {aperçus.length > 0 && (
              <div className="aperçus-container">
                <h4>Fichiers sélectionnés ({aperçus.length})</h4>
                <div className="aperçus-grille">
                  {aperçus.map((a, i) => (
                    <div key={i} className="aperçu-item">
                      {a.type === 'image' ? (
                        <img src={a.url} alt={a.nom} />
                      ) : (
                        <div className="aperçu-video">
                          <span>🎬</span>
                          <p>{a.nom}</p>
                        </div>
                      )}
                      <button
                        className="btn-suppr-aperçu"
                        onClick={() => supprimerAperçu(i)}
                        title="Retirer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="upload-actions">
                  {uploadOk && (
                    <span className="succes-message">✅ Médias ajoutés au profil !</span>
                  )}
                  {erreurUpload && (
                    <span className="erreur-message">❌ {erreurUpload}</span>
                  )}
                  <button
                    className="btn-primaire"
                    onClick={handleUploadMedia}
                    disabled={uploadEnCours}
                  >
                    {uploadEnCours
                      ? '⏳ Envoi en cours...'
                      : `📤 Envoyer ${aperçus.length} fichier${aperçus.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrestataireMonProfil;
