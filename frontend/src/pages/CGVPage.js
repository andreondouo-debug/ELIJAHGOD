import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

/**
 * 📜 CONDITIONS GÉNÉRALES DE VENTE
 * Conformes à la directive européenne 2011/83/UE, au Code civil français
 * et aux usages professionnels du secteur événementiel.
 * Version : 1.0 — Février 2026
 */
function CGVPage() {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        <div className="legal-header">
          <h1>Conditions Générales de Vente</h1>
          <p className="legal-version">Version 1.0 — Mise à jour : février 2026</p>
        </div>

        {/* TABLE DES MATIÈRES */}
        <nav className="legal-toc">
          <h2>Sommaire</h2>
          <ol>
            <li><a href="#article1">Identification des parties</a></li>
            <li><a href="#article2">Objet et champ d'application</a></li>
            <li><a href="#article3">Formation du contrat</a></li>
            <li><a href="#article4">Devis et acceptation</a></li>
            <li><a href="#article5">Prix et modalités de paiement</a></li>
            <li><a href="#article6">Acompte et confirmation de prestation</a></li>
            <li><a href="#article7">Conditions d'annulation et de report</a></li>
            <li><a href="#article8">Obligations du prestataire</a></li>
            <li><a href="#article9">Obligations du client</a></li>
            <li><a href="#article10">Responsabilité et limites</a></li>
            <li><a href="#article11">Force majeure</a></li>
            <li><a href="#article12">Protection des données personnelles</a></li>
            <li><a href="#article13">Propriété intellectuelle</a></li>
            <li><a href="#article14">Règlement des litiges</a></li>
            <li><a href="#article15">Droit applicable</a></li>
          </ol>
        </nav>

        {/* ARTICLE 1 */}
        <section id="article1" className="legal-section">
          <h2>Article 1 — Identification des parties</h2>
          <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre :</p>
          <div className="legal-box">
            <p><strong>Le Prestataire :</strong> ELIJAH'GOD Events, dont le siège social est établi en France, ci-après dénommé « le Prestataire ».</p>
            <p><strong>Le Client :</strong> toute personne physique ou morale, particulier ou professionnel, ayant accepté un devis émis par le Prestataire, ci-après dénommée « le Client ».</p>
          </div>
          <p>Toute commande implique l'acceptation pleine et entière des présentes CGV, sans réserve ni restriction.</p>
        </section>

        {/* ARTICLE 2 */}
        <section id="article2" className="legal-section">
          <h2>Article 2 — Objet et champ d'application</h2>
          <p>
            Les présentes CGV définissent les droits et obligations des parties dans le cadre de la fourniture de prestations événementielles par le Prestataire, notamment :
          </p>
          <ul>
            <li>Animation DJ et programmation musicale</li>
            <li>Sonorisation et ingénierie du son</li>
            <li>Éclairage scénique et effets visuels</li>
            <li>Services de captation photo / vidéo</li>
            <li>Animation musicale live (groupe de louange, musiciens)</li>
            <li>Location de matériel événementiel</li>
            <li>Toute autre prestation décrite dans le devis accepté</li>
          </ul>
          <p>
            Ces CGV s'appliquent à l'exclusion de toutes autres, notamment celles du Client.
            Elles sont accessibles en permanence sur le site internet du Prestataire.
          </p>
          <div className="legal-notice">
            <strong>⚠️ Exception au droit de rétractation (art. 16 de la directive 2011/83/UE) :</strong> Conformément à la directive européenne sur les droits des consommateurs, les contrats portant sur des activités de loisirs exécutées à une date ou une période déterminée (événements, mariages, concerts, etc.) sont expressément exclus du droit légal de rétractation de 14 jours. Les conditions d'annulation spécifiques figurent à l'article 7.
          </div>
        </section>

        {/* ARTICLE 3 */}
        <section id="article3" className="legal-section">
          <h2>Article 3 — Formation du contrat</h2>
          <p>Le contrat entre le Prestataire et le Client est formé selon les étapes suivantes :</p>
          <ol>
            <li>Le Client soumet une demande de devis via le site internet ou par tout autre moyen.</li>
            <li>Le Prestataire adresse au Client un devis détaillé par voie électronique.</li>
            <li>Le Client accepte le devis en le signant numériquement ou en confirmant par écrit, et verse l'acompte visé à l'article 6.</li>
            <li>La réception de l'acompte et de l'acceptation du devis constitue la formation définitive du contrat.</li>
          </ol>
          <p>Aucune réservation de date n'est garantie sans réception de l'acompte.</p>
        </section>

        {/* ARTICLE 4 */}
        <section id="article4" className="legal-section">
          <h2>Article 4 — Devis et acceptation</h2>
          <p>
            Les devis émis sont valables <strong>30 jours calendaires</strong> à compter de leur date d'émission, sauf mention contraire.
            Passé ce délai, le Prestataire se réserve le droit de modifier les tarifs.
          </p>
          <p>
            Chaque devis précise : la nature des prestations, la date et le lieu de l'événement, la durée, le nombre d'invités estimé, le matériel prévu et le montant total TTC.
          </p>
          <p>
            Le Client est invité à lire attentivement le devis et à signaler toute inexactitude au Prestataire avant acceptation. Toute modification après acceptation fera l'objet d'un avenant écrit.
          </p>
        </section>

        {/* ARTICLE 5 */}
        <section id="article5" className="legal-section">
          <h2>Article 5 — Prix et modalités de paiement</h2>
          <h3>5.1 Prix</h3>
          <p>
            Les prix sont indiqués en euros (€) toutes taxes comprises (TTC).
            Le Prestataire n'est pas assujetti à la TVA (franchise en base — article 293 B du CGI) sauf mention contraire explicite sur le devis.
            Les prix tiennent compte de la durée de la prestation, du nombre d'invités, du matériel mobilisé et des frais de déplacement le cas échéant.
          </p>
          <h3>5.2 Modalités de paiement</h3>
          <ul>
            <li><strong>Acompte (30 %) :</strong> à verser à la signature du contrat (articles 6 et ci-après).</li>
            <li><strong>Solde (70 %) :</strong> à régler au plus tard le jour de l'événement, avant le début de la prestation, ou selon l'échéancier figurant sur le devis.</li>
          </ul>
          <p>Moyens de paiement acceptés : virement bancaire, PayPal, espèces (dans la limite légale), et tout autre moyen mentionné sur le devis.</p>
          <p>
            Tout retard de paiement entraîne de plein droit l'application de pénalités égales à 3 fois le taux d'intérêt légal en vigueur, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de <strong>40 €</strong> (art. L.441-10 du Code de commerce).
          </p>
        </section>

        {/* ARTICLE 6 */}
        <section id="article6" className="legal-section">
          <h2>Article 6 — Acompte et confirmation de prestation</h2>
          <div className="legal-highlight">
            <p>
              <strong>Un acompte de 30 % du montant total TTC</strong> est exigé pour confirmer la réservation et bloquer la date dans l'agenda du Prestataire. Sans réception de cet acompte, aucune date ne peut être considérée comme réservée, et le Prestataire reste libre d'accepter d'autres demandes pour la même date.
            </p>
          </div>
          <p>
            L'acompte est calculé automatiquement sur le devis et constitue une avance sur le paiement total. Il n'est pas remboursable en cas d'annulation à l'initiative du Client (voir article 7), sauf dans les cas de force majeure définis à l'article 11.
          </p>
          <p>
            Le versement de l'acompte vaut confirmation de la commande et acceptation des présentes CGV.
          </p>
        </section>

        {/* ARTICLE 7 */}
        <section id="article7" className="legal-section">
          <h2>Article 7 — Conditions d'annulation et de report</h2>
          <h3>7.1 Annulation à l'initiative du Client</h3>
          <p>En cas d'annulation notifiée par écrit au Prestataire, les indemnités suivantes sont dues :</p>
          <div className="legal-table-wrapper">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Délai avant l'événement</th>
                  <th>Indemnité due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plus de 90 jours</td>
                  <td>Perte de l'acompte (30 %)</td>
                </tr>
                <tr>
                  <td>Entre 30 et 90 jours</td>
                  <td>50 % du montant total TTC</td>
                </tr>
                <tr>
                  <td>Entre 14 et 30 jours</td>
                  <td>75 % du montant total TTC</td>
                </tr>
                <tr>
                  <td>Moins de 14 jours</td>
                  <td>100 % du montant total TTC</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>7.2 Report à l'initiative du Client</h3>
          <p>
            Un report de date est possible <strong>une seule fois</strong> et uniquement si la demande est formulée au moins <strong>60 jours avant</strong> la date initiale, sous réserve de disponibilité du Prestataire. Aucun frais supplémentaire ne sera facturé pour un premier report dans ce délai.
            Au-delà d'un premier report ou en deçà du délai, le report est traité comme une annulation suivie d'une nouvelle commande.
          </p>
          <h3>7.3 Annulation à l'initiative du Prestataire</h3>
          <p>
            En cas d'annulation par le Prestataire (hors force majeure), le Client est remboursé intégralement des sommes versées dans un délai de <strong>14 jours</strong> et peut prétendre à une indemnisation complémentaire à hauteur de l'acompte versé.
          </p>
        </section>

        {/* ARTICLE 8 */}
        <section id="article8" className="legal-section">
          <h2>Article 8 — Obligations du Prestataire</h2>
          <p>Le Prestataire s'engage à :</p>
          <ul>
            <li>Se présenter à l'heure et au lieu convenus, avec le matériel prévu au devis, en bon état de fonctionnement.</li>
            <li>Fournir une prestation de qualité professionnelle, conforme à la description du devis accepté.</li>
            <li>Disposer d'une assurance responsabilité civile professionnelle couvrant les dommages pouvant survenir lors de l'exécution de la prestation.</li>
            <li>Respecter la réglementation applicable (droits SACEM/SPRE si applicable, volumes sonores légaux, réglementation des lieux accueillant du public).</li>
            <li>Traiter les données personnelles du Client conformément au RGPD (voir article 12).</li>
            <li>Informer le Client dans les meilleurs délais de tout aléa susceptible d'affecter l'exécution de la prestation.</li>
          </ul>
          <p>
            Le Prestataire est tenu à une <strong>obligation de moyens</strong> et non de résultat en matière artistique et créative, la prestation relevant d'un savoir-faire subjectif.
          </p>
        </section>

        {/* ARTICLE 9 */}
        <section id="article9" className="legal-section">
          <h2>Article 9 — Obligations du Client</h2>
          <p>Le Client s'engage à :</p>
          <ul>
            <li>Fournir des informations exactes et complètes lors de la commande (date, lieu, nombre d'invités, nature de l'événement).</li>
            <li>Informer le Prestataire de toute contrainte particulière du lieu (accès, horaires, restrictions sonores, etc.) au moins <strong>15 jours avant</strong> l'événement.</li>
            <li>Assurer un espace de travail suffisant, sécurisé et accessible pour l'installation du matériel.</li>
            <li>Prévoir une alimentation électrique conforme aux besoins indiqués par le Prestataire.</li>
            <li>Assurer le respect du matériel du Prestataire par les convives et êtres responsable de tout dommage causé par un tiers sous sa responsabilité.</li>
            <li>Régler l'intégralité des sommes dues aux échéances convenues.</li>
            <li>Ne pas demander au Prestataire d'enfreindre la réglementation en vigueur (volumes sonores, droits des tiers, etc.).</li>
          </ul>
          <p>
            Tout dommage causé au matériel du Prestataire par le Client ou ses invités sera facturé au Client à sa valeur de remplacement, justificatifs à l'appui.
          </p>
        </section>

        {/* ARTICLE 10 */}
        <section id="article10" className="legal-section">
          <h2>Article 10 — Responsabilité et limites</h2>
          <p>
            La responsabilité du Prestataire ne saurait être engagée en cas de :
          </p>
          <ul>
            <li>Dysfonctionnement du matériel appartenant au Client ou fourni par un tiers.</li>
            <li>Retard imputable à des conditions de circulation exceptionnelles, à un accès au lieu non anticipé, ou à une cause extérieure.</li>
            <li>Dommage indirect ou immatériel (manque à gagner, préjudice moral) dont le montant dépasserait le prix de la prestation concernée.</li>
            <li>Non-respect par le Client de ses propres obligations (accès, alimentation électrique, etc.).</li>
          </ul>
          <p>
            En tout état de cause, la responsabilité du Prestataire est plafonnée au <strong>montant total TTC de la prestation</strong> faisant l'objet du litige.
          </p>
          <p>
            Le Prestataire ne sera pas responsable des dommages causés par les décisions artistiques ou musicales prises en accord avec les souhaits du Client exprimés lors de la commande.
          </p>
        </section>

        {/* ARTICLE 11 */}
        <section id="article11" className="legal-section">
          <h2>Article 11 — Force majeure</h2>
          <p>
            Est considéré comme cas de force majeure tout événement imprévisible, irrésistible et extérieur aux parties, au sens de l'article 1218 du Code civil, rendant impossible l'exécution du contrat. Sont notamment visés : catastrophes naturelles, épidémies officiellement déclarées, décision administrative de restriction des rassemblements, incendie, attentat, et tout autre événement reconnu par les tribunaux français comme cas de force majeure.
          </p>
          <p>
            En cas de force majeure dûment caractérisée :
          </p>
          <ul>
            <li>Le contrat est suspendu pendant la durée de l'empêchement.</li>
            <li>Si l'empêchement est définitif, le contrat est résolu et chaque partie est libérée de ses obligations.</li>
            <li>Les sommes versées (acompte inclus) sont remboursées intégralement au Client dans un délai de <strong>30 jours</strong>.</li>
          </ul>
        </section>

        {/* ARTICLE 12 */}
        <section id="article12" className="legal-section">
          <h2>Article 12 — Protection des données personnelles</h2>
          <p>
            Les données personnelles collectées lors de la commande (nom, prénom, email, téléphone) sont traitées conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679).
          </p>
          <p>
            Pour plus d'informations, consultez notre <Link to="/politique-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </section>

        {/* ARTICLE 13 */}
        <section id="article13" className="legal-section">
          <h2>Article 13 — Propriété intellectuelle</h2>
          <p>
            Les enregistrements sonores, photos et vidéos réalisés par le Prestataire lors de l'événement restent la propriété intellectuelle du Prestataire. Le Client dispose d'une licence d'utilisation personnelle et non commerciale.
          </p>
          <p>
            Le Prestataire peut utiliser des visuels ou extraits de l'événement à des fins de communication et de promotion, sauf opposition expresse et écrite du Client formulée avant la prestation.
          </p>
          <p>
            Les œuvres musicales diffusées lors des prestations sont soumises aux droits d'auteur. Le Prestataire s'acquitte des redevances SACEM/SPRE applicables selon le contexte légal.
          </p>
        </section>

        {/* ARTICLE 14 */}
        <section id="article14" className="legal-section">
          <h2>Article 14 — Règlement des litiges</h2>
          <p>
            En cas de litige, le Client est invité à contacter d'abord le Prestataire par email afin de trouver une solution amiable dans un délai de <strong>30 jours</strong>.
          </p>
          <p>
            À défaut d'accord amiable, le Client consommateur résidant dans l'Union Européenne peut recourir gratuitement à un médiateur de la consommation agréé ou à la plateforme européenne de règlement en ligne des litiges (RLL) accessible à l'adresse :<br />
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
          </p>
          <p>
            En cas d'échec, le tribunal compétent sera celui du lieu du siège social du Prestataire, sauf disposition légale impérative contraire applicable au Client consommateur.
          </p>
        </section>

        {/* ARTICLE 15 */}
        <section id="article15" className="legal-section">
          <h2>Article 15 — Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. Elles sont rédigées en langue française, qui fait foi en cas de traduction.
          </p>
          <p>
            Pour les Clients résidant dans un autre État membre de l'Union Européenne, les dispositions impératives de protection des consommateurs prévues par la loi de leur pays de résidence s'appliquent également, conformément au Règlement Rome I (CE n° 593/2008).
          </p>
        </section>

        <div className="legal-footer-links">
          <Link to="/mentions-legales">Mentions Légales</Link>
          <Link to="/politique-confidentialite">Politique de Confidentialité</Link>
          <Link to="/">Retour à l'accueil</Link>
        </div>

      </div>
    </div>
  );
}

export default CGVPage;
