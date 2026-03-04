import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

/**
 * 🔒 POLITIQUE DE CONFIDENTIALITÉ
 * Conforme au Règlement (UE) 2016/679 — RGPD (Règlement Général sur la Protection des Données)
 * et à la loi Informatique et Libertés n°78-17 du 6 janvier 1978 modifiée.
 */
function PolitiqueConfidentialitePage() {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        <div className="legal-header">
          <h1>Politique de Confidentialité</h1>
          <p className="legal-version">
            Conforme au RGPD (Règlement UE 2016/679) — Version 1.0 — Février 2026
          </p>
        </div>

        {/* INTRO */}
        <section className="legal-section">
          <p>
            ELIJAH'GOD Events s'engage à protéger votre vie privée et vos données personnelles.
            Cette politique explique quelles données nous collectons, pourquoi, comment nous les utilisons
            et quels sont vos droits.
          </p>
        </section>

        {/* ARTICLE 1 */}
        <section className="legal-section">
          <h2>1. Responsable du traitement</h2>
          <div className="legal-box">
            <p><strong>ELIJAH'GOD Events</strong></p>
            <p>Entreprise enregistrée en France</p>
            <p>Email : <a href="mailto:contact@elijahgod.fr">contact@elijahgod.fr</a></p>
          </div>
          <p>
            Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse email ci-dessus.
          </p>
        </section>

        {/* ARTICLE 2 */}
        <section className="legal-section">
          <h2>2. Données collectées et finalités</h2>

          <h3>2.1 Données collectées lors de la création de compte</h3>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Donnée</th>
                  <th>Finalité</th>
                  <th>Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nom, prénom</td>
                  <td>Identification, personnalisation</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Adresse email</td>
                  <td>Authentification, notifications, devis</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Numéro de téléphone</td>
                  <td>Contact pour coordonnées de la prestation</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Mot de passe (hashé)</td>
                  <td>Sécurité du compte</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.2 Données collectées lors d'une demande de devis</h3>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Donnée</th>
                  <th>Finalité</th>
                  <th>Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Type d'événement, date, lieu</td>
                  <td>Établissement du devis</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Nombre d'invités estimé</td>
                  <td>Calcul du tarif, logistique</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Prestations souhaitées</td>
                  <td>Établissement du devis</td>
                  <td>Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td>Messages et notes</td>
                  <td>Personnalisation de la prestation</td>
                  <td>Intérêt légitime (art. 6.1.f RGPD)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.3 Données techniques</h3>
          <p>
            Lors de votre navigation, des données techniques peuvent être collectées automatiquement :
            adresse IP (anonymisée), type de navigateur, pages visitées, durée de visite.
            Ces données sont utilisées à des fins de sécurité et d'amélioration du service.
          </p>
        </section>

        {/* ARTICLE 3 */}
        <section className="legal-section">
          <h2>3. Durée de conservation</h2>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Type de données</th>
                  <th>Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Données de compte client</td>
                  <td>3 ans après la dernière activité, puis suppression ou archivage</td>
                </tr>
                <tr>
                  <td>Données de devis et contrats</td>
                  <td>10 ans (obligations comptables et légales — art. L.123-22 Code de commerce)</td>
                </tr>
                <tr>
                  <td>Données de paiement</td>
                  <td>5 ans (obligations fiscales)</td>
                </tr>
                <tr>
                  <td>Logs de connexion et données techniques</td>
                  <td>12 mois maximum</td>
                </tr>
                <tr>
                  <td>Témoignages publiés</td>
                  <td>Jusqu'au retrait de votre consentement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ARTICLE 4 */}
        <section className="legal-section">
          <h2>4. Destinataires des données</h2>
          <p>Vos données personnelles sont accessibles uniquement aux personnes suivantes :</p>
          <ul>
            <li>L'équipe ELIJAH'GOD Events, dans la limite de leurs attributions.</li>
            <li>Nos sous-traitants techniques hébergeant le service (Vercel, Render, MongoDB Atlas, Cloudinary) — tous soumis à des contrats de traitement conformes au RGPD.</li>
            <li>Notre prestataire de paiement (PayPal) pour les transactions financières, soumis à ses propres obligations de sécurité et de conformité.</li>
          </ul>
          <p>
            Vos données ne sont <strong>jamais vendues ni cédées</strong> à des tiers à des fins commerciales.
          </p>
          <p>
            En cas de transfert hors Union Européenne (notamment vers des hébergeurs américains), les garanties appropriées prévues par le RGPD (Clauses Contractuelles Types, Data Privacy Framework EU-US) sont mises en place.
          </p>
        </section>

        {/* ARTICLE 5 */}
        <section className="legal-section">
          <h2>5. Vos droits</h2>
          <p>
            Conformément aux articles 15 à 22 du RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données personnelles :
          </p>
          <div className="legal-rights-grid">
            <div className="legal-right-item">
              <h3>📄 Droit d'accès</h3>
              <p>Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.</p>
            </div>
            <div className="legal-right-item">
              <h3>✏️ Droit de rectification</h3>
              <p>Vous pouvez corriger vos données si elles sont inexactes ou incomplètes, directement depuis votre espace client.</p>
            </div>
            <div className="legal-right-item">
              <h3>🗑️ Droit à l'effacement</h3>
              <p>Vous pouvez demander la suppression de vos données personnelles, sous réserve des obligations légales de conservation.</p>
            </div>
            <div className="legal-right-item">
              <h3>🔒 Droit à la limitation</h3>
              <p>Vous pouvez demander de limiter le traitement de vos données dans certaines circonstances (contestation d'inexactitude, opposition en cours).</p>
            </div>
            <div className="legal-right-item">
              <h3>📦 Droit à la portabilité</h3>
              <p>Vous pouvez recevoir vos données dans un format structuré et courant (JSON, CSV) afin de les transmettre à un autre responsable de traitement.</p>
            </div>
            <div className="legal-right-item">
              <h3>🚫 Droit d'opposition</h3>
              <p>Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes, notamment à des fins de prospection commerciale.</p>
            </div>
            <div className="legal-right-item">
              <h3>🤝 Droit de retrait du consentement</h3>
              <p>Lorsque le traitement est fondé sur votre consentement, vous pouvez le retirer à tout moment, sans remettre en cause la licéité du traitement antérieur.</p>
            </div>
            <div className="legal-right-item">
              <h3>⚙️ Directives post-mortem</h3>
              <p>Vous pouvez formuler des directives relatives au sort de vos données après votre décès (loi Informatique et Libertés, art. 85).</p>
            </div>
          </div>

          <div className="legal-notice" style={{marginTop: '1.5rem'}}>
            <strong>Comment exercer vos droits :</strong> Envoyez votre demande par email à{' '}
            <a href="mailto:contact@elijahgod.fr">contact@elijahgod.fr</a> en précisant votre identité et le droit que vous souhaitez exercer. Nous répondrons dans un délai maximum de <strong>30 jours</strong>.
          </div>

          <p style={{marginTop: '1rem'}}>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :
          </p>
          <p>
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
              https://www.cnil.fr/fr/plaintes
            </a>
          </p>
        </section>

        {/* ARTICLE 6 */}
        <section className="legal-section">
          <h2>6. Cookies et traceurs</h2>

          <h3>6.1 Cookies strictement nécessaires</h3>
          <p>
            Ces cookies sont indispensables au fonctionnement du site (authentification, sécurité de session).
            Ils ne nécessitent pas votre consentement conformément à la recommandation de la CNIL.
          </p>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>token_client</td>
                  <td>Maintien de la session authentifiée</td>
                  <td>Durée de la session</td>
                </tr>
                <tr>
                  <td>token_admin</td>
                  <td>Maintien de la session administrateur</td>
                  <td>Durée de la session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>6.2 Cookies optionnels</h3>
          <p>
            Aucun cookie publicitaire, de profilage ou de mesure d'audience tiers n'est utilisé sur ce site sans votre consentement préalable.
          </p>
        </section>

        {/* ARTICLE 7 */}
        <section className="legal-section">
          <h2>7. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, divulgation, altération ou destruction :
          </p>
          <ul>
            <li>Chiffrement des mots de passe (bcrypt)</li>
            <li>Communications sécurisées via HTTPS (TLS)</li>
            <li>Authentification par JWT (JSON Web Token) avec expiration</li>
            <li>Accès aux données restreint aux seules personnes habilitées</li>
            <li>Hébergement chez des prestataires certifiés (SOC 2, ISO 27001)</li>
          </ul>
        </section>

        {/* ARTICLE 8 */}
        <section className="legal-section">
          <h2>8. Modifications de cette politique</h2>
          <p>
            Cette politique de confidentialité peut être mise à jour pour refléter les évolutions légales, réglementaires ou techniques.
            La date de mise à jour est indiquée en tête de document. En cas de modification substantielle, les utilisateurs en seront informés par email.
          </p>
        </section>

        <div className="legal-footer-links">
          <Link to="/cgv">Conditions Générales de Vente</Link>
          <Link to="/mentions-legales">Mentions Légales</Link>
          <Link to="/">Retour à l'accueil</Link>
        </div>

      </div>
    </div>
  );
}

export default PolitiqueConfidentialitePage;
