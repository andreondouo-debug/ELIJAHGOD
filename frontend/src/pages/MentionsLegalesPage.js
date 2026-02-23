import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

/**
 * 📄 MENTIONS LÉGALES
 * Conformes à la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN)
 */
function MentionsLegalesPage() {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        <div className="legal-header">
          <h1>Mentions Légales</h1>
          <p className="legal-version">Conformément à l'article 6 de la LCEN — Loi n°2004-575 du 21 juin 2004</p>
        </div>

        {/* ÉDITEUR DU SITE */}
        <section className="legal-section">
          <h2>1. Éditeur du site</h2>
          <div className="legal-box">
            <p><strong>Dénomination :</strong> ELIJAH'GOD Events</p>
            <p><strong>Statut :</strong> Auto-entrepreneur / Entreprise individuelle</p>
            <p><strong>Pays :</strong> France</p>
            <p><strong>Email de contact :</strong> <a href="mailto:contact@elijahgod.fr">contact@elijahgod.fr</a></p>
            <p><em>Les informations légales complètes (adresse, SIRET) sont disponibles sur simple demande écrite.</em></p>
          </div>
        </section>

        {/* DIRECTEUR DE PUBLICATION */}
        <section className="legal-section">
          <h2>2. Directeur de la publication</h2>
          <p>
            Le directeur de la publication est le représentant légal de l'entreprise ELIJAH'GOD Events.
            Pour toute demande, vous pouvez écrire à l'adresse email mentionnée ci-dessus.
          </p>
        </section>

        {/* HÉBERGEMENT */}
        <section className="legal-section">
          <h2>3. Hébergement du site</h2>
          <p>Le site est hébergé par les sociétés suivantes :</p>

          <div className="legal-box">
            <p><strong>Frontend (interface utilisateur) :</strong></p>
            <p>Vercel Inc.<br />
            440 N Barranca Ave #4133<br />
            Covina, CA 91723, États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a></p>
          </div>

          <div className="legal-box">
            <p><strong>Backend (serveur et API) :</strong></p>
            <p>Render Services, Inc.<br />
            525 Brannan St, Suite 300<br />
            San Francisco, CA 94107, États-Unis<br />
            <a href="https://render.com" target="_blank" rel="noopener noreferrer">https://render.com</a></p>
          </div>

          <div className="legal-box">
            <p><strong>Base de données :</strong></p>
            <p>MongoDB Atlas — MongoDB, Inc.<br />
            1633 Broadway, 38th Floor<br />
            New York, NY 10019, États-Unis<br />
            <a href="https://www.mongodb.com" target="_blank" rel="noopener noreferrer">https://www.mongodb.com</a></p>
          </div>

          <div className="legal-box">
            <p><strong>Hébergement des images :</strong></p>
            <p>Cloudinary Ltd.<br />
            3400 Central Expressway, Suite 110<br />
            Santa Clara, CA 95051, États-Unis<br />
            <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer">https://cloudinary.com</a></p>
          </div>
        </section>

        {/* PROPRIÉTÉ INTELLECTUELLE */}
        <section className="legal-section">
          <h2>4. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, sons, mise en page) est la propriété exclusive d'ELIJAH'GOD Events ou de ses partenaires, et est protégé par les lois françaises et internationales relatives au droit d'auteur et à la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable d'ELIJAH'GOD Events.
          </p>
          <p>
            Toute exploitation non autorisée du site ou de l'un de ses éléments sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
          </p>
        </section>

        {/* RESPONSABILITÉ */}
        <section className="legal-section">
          <h2>5. Limitation de responsabilité</h2>
          <p>
            ELIJAH'GOD Events met tout en œuvre pour proposer un site fiable et à jour. Cependant, la responsabilité du site ne peut être engagée en cas d'erreur ou d'omission dans le contenu, d'indisponibilité du service, ou de dommages directs ou indirects résultant de l'utilisation du site.
          </p>
          <p>
            Ce site peut contenir des liens hypertextes vers des sites tiers. ELIJAH'GOD Events n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        {/* DONNÉES PERSONNELLES */}
        <section className="legal-section">
          <h2>6. Données personnelles</h2>
          <p>
            Les informations concernant la collecte et le traitement des données personnelles sont détaillées dans notre{' '}
            <Link to="/politique-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </section>

        {/* COOKIES */}
        <section className="legal-section">
          <h2>7. Cookies</h2>
          <p>
            Ce site peut utiliser des cookies techniques nécessaires à son bon fonctionnement (authentification, session). Aucun cookie publicitaire ou de suivi de comportement tiers n'est utilisé sans votre consentement.
          </p>
          <p>
            Pour en savoir plus sur la gestion des cookies, consultez notre{' '}
            <Link to="/politique-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </section>

        {/* DROIT APPLICABLE */}
        <section className="legal-section">
          <h2>8. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <div className="legal-footer-links">
          <Link to="/cgv">Conditions Générales de Vente</Link>
          <Link to="/politique-confidentialite">Politique de Confidentialité</Link>
          <Link to="/">Retour à l'accueil</Link>
        </div>

      </div>
    </div>
  );
}

export default MentionsLegalesPage;
