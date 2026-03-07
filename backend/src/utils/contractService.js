const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * 📜 SERVICE DE GÉNÉRATION DE CONTRAT DE PRESTATION
 * Modèle conforme au contrat ELIJAH'GOD
 * Généré automatiquement depuis le devis validé
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:      '#1a1a2e',
  navyLight: '#252540',
  gold:      '#c9a227',
  goldLight: '#f5e9c0',
  text:      '#1a1a2e',
  textMid:   '#444444',
  textLight: '#888888',
  white:     '#ffffff',
  bgSection: '#faf9f5',
  bgAlt:     '#f7f6f2',
};

const LEFT   = 45;
const RIGHT  = 550;
const WIDTH  = RIGHT - LEFT;
const FOOTER = 50;
const PAGE_H = 842;

const LOGO_PATH = path.join(__dirname, '../../../frontend/public/images/logo.png');

class ContractService {

  async genererContratPDF(devis, outputPath, settings = {}) {
    return new Promise((resolve, reject) => {
      try {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 40, bottom: FOOTER + 20, left: LEFT, right: 45 },
          info: {
            Title: `Contrat ${devis.numeroContrat || devis.numeroDevis}`,
            Author: "ELIJAH'GOD",
            Subject: 'Contrat de prestation de services',
          },
          autoFirstPage: true,
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Footer automatique
        let isAddingFooter = false;
        const placerFooter = () => {
          if (isAddingFooter) return;
          isAddingFooter = true;
          const fy = PAGE_H - FOOTER;
          doc.save();
          doc.moveTo(LEFT, fy).lineTo(RIGHT, fy)
             .strokeColor(C.gold).lineWidth(0.4).stroke();
          doc.fontSize(7).fillColor(C.textLight).font('Helvetica');
          const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
          const emailContact  = settings?.contact?.email || 'contact@elijahgod.com';
          doc.text(
            `${nomEntreprise} · Contrat de prestation de services · ${emailContact}`,
            LEFT, fy + 8, { width: WIDTH, align: 'center', lineBreak: false }
          );
          isAddingFooter = false;
          doc.restore();
        };
        doc.on('pageAdded', placerFooter);

        // ── Construction ───────────────────────────────────────────────────────
        this._entete(doc, devis, settings);
        this._partiesContrat(doc, devis, settings);
        this._objetContrat(doc, devis);
        this._detailsEvenement(doc, devis);
        this._materielServices(doc, devis);
        this._conditionsFinancieres(doc, devis, settings);
        this._engagementsPrestataire(doc, devis);
        this._engagementsClient(doc);
        this._annulation(doc, settings);
        this._responsabilites(doc);
        this._procedureReclamation(doc);
        this._signatures(doc, devis, settings);
        this._annexePV(doc, devis, settings);

        placerFooter();
        doc.end();

        stream.on('finish', () => {
          console.log('✅ Contrat PDF généré:', outputPath);
          resolve(outputPath);
        });
        stream.on('error', reject);

      } catch (error) {
        console.error('❌ Erreur génération contrat:', error);
        reject(error);
      }
    });
  }

  // ── Contrôle espace ─────────────────────────────────────────────────────────
  _check(doc, needed) {
    if (doc.y + needed > PAGE_H - FOOTER - 20) doc.addPage();
  }

  // ── Titre de section ────────────────────────────────────────────────────────
  _titreSection(doc, titre) {
    this._check(doc, 28);
    const y = doc.y + 10;
    doc.rect(LEFT, y, WIDTH, 20).fill(C.navy);
    doc.fontSize(9).fillColor(C.gold).font('Helvetica-Bold')
       .text(titre.toUpperCase(), LEFT + 8, y + 6, { width: WIDTH - 16, lineBreak: false });
    doc.y = y + 26;
  }

  // ── Bullet point ─────────────────────────────────────────────────────────────
  _bullet(doc, texte, indent = 0) {
    this._check(doc, 16);
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica')
       .text(`• ${texte}`, LEFT + 8 + indent, doc.y, { width: WIDTH - 20 - indent });
    doc.y += 2;
  }

  _ligne(doc, label, valeur, highlight = false) {
    this._check(doc, 18);
    const y = doc.y;
    if (highlight) {
      doc.rect(LEFT, y, WIDTH, 20).fill(C.goldLight);
      doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold')
         .text(label, LEFT + 8, y + 5, { width: WIDTH * 0.55, lineBreak: false })
         .text(valeur, LEFT + WIDTH * 0.55, y + 5, { width: WIDTH * 0.44, align: 'right', lineBreak: false });
    } else {
      doc.rect(LEFT, y, WIDTH, 18).fill(C.bgAlt);
      doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
         .text(label, LEFT + 8, y + 4, { width: WIDTH * 0.55, lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(C.text)
         .text(valeur, LEFT + WIDTH * 0.55, y + 4, { width: WIDTH * 0.44, align: 'right', lineBreak: false });
    }
    doc.moveTo(LEFT, y + 18).lineTo(RIGHT, y + 18)
       .strokeColor('#e0ddd0').lineWidth(0.2).stroke();
    doc.y = y + 18;
  }

  // ── EN-TÊTE ─────────────────────────────────────────────────────────────────
  _entete(doc, devis, settings) {
    // Bande marine
    doc.rect(0, 0, 595, 100).fill(C.navy);

    // Logo
    let nomX = LEFT;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, LEFT, 20, { height: 58 });
        nomX = LEFT + 72;
      } catch (e) { /* pas de logo */ }
    }

    // Nom entreprise
    const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
    const slogan        = settings?.entreprise?.slogan || 'DJ · Sonorisation · Animation Événementielle';
    doc.fontSize(20).fillColor(C.white).font('Helvetica-Bold')
       .text(nomEntreprise, nomX, 24, { lineBreak: false });
    doc.fontSize(8).fillColor(C.gold).font('Helvetica')
       .text(slogan, nomX, 50, { lineBreak: false });

    // Coordonnées à droite
    const email  = settings?.contact?.email || 'contact@elijahgod.com';
    const tel    = settings?.contact?.telephone || '';
    doc.fontSize(7.5).fillColor(C.white).font('Helvetica')
       .text(email, LEFT, 26, { width: WIDTH, align: 'right', lineBreak: false });
    if (tel)
      doc.text(tel, LEFT, 38, { width: WIDTH, align: 'right', lineBreak: false });

    // Bande titre
    doc.rect(0, 100, 595, 46).fill(C.navyLight);
    const dateEv = devis.evenement?.date
      ? new Date(devis.evenement.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    doc.fontSize(15).fillColor(C.gold).font('Helvetica-Bold')
       .text('CONTRAT DE PRESTATION DE SERVICES', LEFT, 108, { lineBreak: false });
    doc.fontSize(9).fillColor(C.white).font('Helvetica')
       .text(`Événement du ${dateEv}`, LEFT, 126, { lineBreak: false })
       .text(devis.numeroContrat || devis.numeroDevis, LEFT, 126, { width: WIDTH, align: 'right', lineBreak: false });

    doc.y = 162;
  }

  // ── PARTIES ──────────────────────────────────────────────────────────────────
  _partiesContrat(doc, devis, settings) {
    this._check(doc, 130);
    const y = doc.y + 8;
    const halfW = (WIDTH - 10) / 2;

    // Box Prestataire
    doc.rect(LEFT, y, halfW, 108).fill(C.bgSection);
    doc.rect(LEFT, y, 3, 108).fill(C.gold);
    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text('INFORMATIONS SUR LE PRESTATAIRE', LEFT + 8, y + 7);

    const nomPrest = settings?.entreprise?.nom || "ELIJAH'GOD";
    const repPrest = settings?.contact?.representant   || 'M. ODOUNGA ETOUMBI Randy';
    const adrPrest = (() => {
      const a = settings?.contact?.adresse;
      if (!a) return '99 impasse de la Ricoulière';
      return [a.rue, a.codePostal, a.ville].filter(Boolean).join(', ');
    })();
    const telPrest = settings?.contact?.telephone || '07 61 27 71 99';
    const emailPrest = settings?.contact?.email || 'contact@elijahgod.com';

    doc.fontSize(9.5).fillColor(C.text).font('Helvetica-Bold')
       .text(nomPrest, LEFT + 8, y + 22);
    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
       .text(`Représenté par : ${repPrest}`, LEFT + 8, y + 38)
       .text(`Adresse : ${adrPrest}`,         LEFT + 8, y + 52)
       .text(`Tél : ${telPrest}`,              LEFT + 8, y + 66)
       .text(`Email : ${emailPrest}`,          LEFT + 8, y + 80);
    doc.fontSize(7.5).fillColor(C.textLight).font('Helvetica-Oblique')
       .text('Ci-après « le Prestataire »', LEFT + 8, y + 96);

    // Box Client
    const cx = LEFT + halfW + 10;
    doc.rect(cx, y, halfW, 108).fill(C.bgSection);
    doc.rect(cx, y, 3, 108).fill(C.gold);
    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text('INFORMATIONS SUR LE CLIENT', cx + 8, y + 7);

    const nomClient  = `${devis.client?.prenom || ''} ${devis.client?.nom || ''}`.trim();
    const emailCli   = devis.client?.email || '';
    const telCli     = devis.client?.telephone || '';
    const adrEv      = [
      devis.evenement?.lieu?.adresse || devis.evenement?.lieu?.nom,
      devis.evenement?.lieu?.codePostal,
      devis.evenement?.lieu?.ville
    ].filter(Boolean).join(', ');

    doc.fontSize(9.5).fillColor(C.text).font('Helvetica-Bold')
       .text(nomClient, cx + 8, y + 22);
    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
       .text(emailCli || '—', cx + 8, y + 38);
    if (telCli) doc.text(`Tél : ${telCli}`, cx + 8, y + 52);
    if (adrEv)  doc.text(`Adresse événement : ${adrEv}`, cx + 8, y + (telCli ? 66 : 52), { width: halfW - 20 });
    doc.fontSize(7.5).fillColor(C.textLight).font('Helvetica-Oblique')
       .text('Ci-après « le Client »', cx + 8, y + 96);

    doc.y = y + 122;
  }

  // ── OBJET ───────────────────────────────────────────────────────────────────
  _objetContrat(doc, devis) {
    this._titreSection(doc, 'Objet du Contrat');
    this._check(doc, 50);

    // Construire une description automatique
    const categories = [...new Set([
      ...( devis.prestations || []).map(p => p.categorie || p.nom).filter(Boolean),
      ...( devis.materiels   || []).map(m => m.categorie || m.nom).filter(Boolean),
    ])];

    const descBase = devis.evenement?.description
      || `prestation de sonorisation, éclairage, installation et ${categories.length > 0 ? categories.join(', ') : 'prestation DJ'}`;

    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
       .text(
         `Le présent document établit les conditions de la ${descBase} dans le cadre de l'événement `
         + `"${devis.evenement?.titre || devis.evenement?.type || 'Événement'}" organisé par le Client.`,
         LEFT + 8, doc.y + 4, { width: WIDTH - 16 }
       );
    doc.y += 10;
  }

  // ── DÉTAILS ÉVÉNEMENT ────────────────────────────────────────────────────────
  _detailsEvenement(doc, devis) {
    this._titreSection(doc, "Détails de l'Événement");
    const ev = devis.evenement || {};

    const date = ev.date
      ? new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '—';
    const lieu = [
      ev.lieu?.nom      || '',
      ev.lieu?.adresse  || '',
      ev.lieu?.codePostal || '',
      ev.lieu?.ville    || '',
    ].filter(Boolean).join(', ') || '—';

    this._bullet(doc, `Date : ${date}`);
    this._bullet(doc, `Lieu : ${lieu}`);
    if (ev.heureDebut) this._bullet(doc, `Heure d'arrivée du Prestataire : ${ev.heureDebut}`);
    if (ev.heureFin)   this._bullet(doc, `Fin estimée : ${ev.heureFin}`);
    if (ev.nbInvites)  this._bullet(doc, `Nombre d'invités : ${ev.nbInvites}`);
    if (ev.thematique) this._bullet(doc, `Thématique : ${ev.thematique}`);
    if (ev.ambiance)   this._bullet(doc, `Ambiance : ${ev.ambiance}`);

    doc.fontSize(8).fillColor(C.textLight).font('Helvetica-Oblique')
       .text("L'ensemble du matériel doit être installé et opérationnel avant l'arrivée des invités.",
             LEFT + 8, doc.y + 4, { width: WIDTH - 16 });
    doc.y += 10;
  }

  // ── MATÉRIEL & SERVICES ──────────────────────────────────────────────────────
  _materielServices(doc, devis) {
    this._titreSection(doc, 'Matériel et Services Fournis');

    const prestations = devis.prestations || [];
    const materiels   = devis.materiels   || [];

    if (prestations.length === 0 && materiels.length === 0) {
      doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
         .text('Détails à préciser.', LEFT + 8, doc.y);
      doc.y += 14;
      return;
    }

    if (prestations.length > 0) {
      this._check(doc, 20);
      doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
         .text('Prestations :', LEFT + 8, doc.y + 4);
      doc.y += 16;
      prestations.forEach(p => {
        const qte = p.quantite > 1 ? `${p.quantite} × ` : '';
        this._bullet(doc, `${qte}${p.nom || 'Prestation'}${p.commentaire ? ' — ' + p.commentaire : ''}`, 8);
      });
    }

    if (materiels.length > 0) {
      this._check(doc, 20);
      doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
         .text('Matériel :', LEFT + 8, doc.y + 6);
      doc.y += 16;
      materiels.forEach(m => {
        const qte = m.quantite > 1 ? `${m.quantite} × ` : '';
        this._bullet(doc, `${qte}${m.nom || 'Matériel'}`, 8);
      });
    }

    // Éléments de transport
    this._check(doc, 30);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Transport :', LEFT + 8, doc.y + 6);
    doc.y += 16;
    this._bullet(doc, 'Carburant', 8);

    if (devis.montants?.fraisKilometriques?.montant > 0) {
      const fk = devis.montants.fraisKilometriques;
      this._bullet(doc, `Frais kilométriques : ${fk.distanceAllerRetour} km (${fk.kmFacturables} km facturables × ${fk.tarifParKm} €/km)`, 8);
    } else {
      this._bullet(doc, 'Péage (si applicable)', 8);
    }

    // Câblage complet
    this._check(doc, 30);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Inclus :', LEFT + 8, doc.y + 6);
    doc.y += 16;
    this._bullet(doc, 'Câblage complet', 8);
    this._bullet(doc, 'Installation, réglages, tests son & lumière', 8);

    doc.y += 6;
  }

  // ── CONDITIONS FINANCIÈRES ───────────────────────────────────────────────────
  _conditionsFinancieres(doc, devis, settings) {
    this._titreSection(doc, 'Conditions Financières');

    const m         = devis.montants || {};
    const totalTTC  = m.totalTTC  || m.totalFinal || 0;
    const pctAcompte = m.acompte?.pourcentage || settings?.devis?.acompteMinimum || 30;
    const acompte   = m.acompte?.montant || (totalTTC * pctAcompte / 100);
    const solde     = totalTTC - acompte;
    const delaiAnnulation = settings?.devis?.delaiAnnulationJours || 15;

    this._ligne(doc, 'Montant total de la prestation (TTC)', this._fmt(totalTTC), true);
    doc.y += 6;

    this._check(doc, 20);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Modalités de paiement :', LEFT + 8, doc.y + 4);
    doc.y += 16;
    this._bullet(doc, `Acompte de ${pctAcompte} % : ${this._fmt(acompte)} — à verser pour la réservation de la date de l'événement`);
    this._bullet(doc, `Solde dû le jour J : ${this._fmt(solde)}`);
    this._bullet(doc, 'Modes de paiement acceptés : virement bancaire ou espèces');

    if ((m.montantRemise || 0) > 0) {
      this._check(doc, 16);
      doc.fontSize(8).fillColor(C.gold).font('Helvetica-Oblique')
         .text(`Remise accordée : ${this._fmt(m.montantRemise)}${m.remise?.raison ? ' (' + m.remise.raison + ')' : ''}`,
               LEFT + 8, doc.y + 4, { width: WIDTH - 16 });
      doc.y += 14;
    }

    doc.y += 6;
  }

  // ── ENGAGEMENTS PRESTATAIRE ──────────────────────────────────────────────────
  _engagementsPrestataire(doc, devis) {
    this._titreSection(doc, 'Engagements du Prestataire');
    const heureArrivee = devis.evenement?.heureDebut || '(heure convenue)';
    this._bullet(doc, `Présence sur le lieu à ${heureArrivee}`);
    this._bullet(doc, 'Installation et tests du matériel dans toutes les salles nécessaires');
    this._bullet(doc, 'Matériel professionnel en bon état de fonctionnement');
    this._bullet(doc, 'Prestation DJ complète et qualitative');
    this._bullet(doc, 'Réactivité en cas de problème technique');
    doc.y += 8;
  }

  // ── ENGAGEMENTS CLIENT ───────────────────────────────────────────────────────
  _engagementsClient(doc) {
    this._titreSection(doc, 'Engagements du Client');
    this._bullet(doc, "Accès aux salles et espaces dès l'heure d'arrivée convenue");
    this._bullet(doc, 'Sécurité du matériel installé assurée et surveillée');
    this._bullet(doc, 'Aucune manipulation non autorisée du matériel par les invités');
    this._bullet(doc, 'Alimentation électrique stable et suffisante');
    doc.y += 8;
  }

  // ── ANNULATION ───────────────────────────────────────────────────────────────
  _annulation(doc, settings) {
    this._titreSection(doc, 'Clause d\'Annulation');
    const delai = settings?.devis?.delaiAnnulationJours || 15;
    this._bullet(doc, `Annulation par le Client à moins de ${delai} jours avant l'événement : l'acompte versé est non remboursable.`);
    this._bullet(doc, "Annulation par le Prestataire pour cause de force majeure : l'acompte est remboursé intégralement.");
    doc.y += 8;
  }

  // ── RESPONSABILITÉS ──────────────────────────────────────────────────────────
  _responsabilites(doc) {
    this._titreSection(doc, 'Responsabilités');
    this._bullet(doc, 'Le Client est responsable des dégradations causées au matériel par des invités ou par l\'infrastructure du lieu.');
    this._bullet(doc, 'Le Prestataire n\'est pas responsable des coupures de courant ou incidents externes indépendants de sa volonté.');
    doc.y += 8;
  }

  // ── PROCÉDURE DE RÉCLAMATION ─────────────────────────────────────────────────
  _procedureReclamation(doc) {
    this._titreSection(doc, 'Procédure de Réclamation');

    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Forme de la réclamation :', LEFT + 8, doc.y + 4);
    doc.y += 14;
    this._bullet(doc, 'Toute réclamation doit être adressée par écrit : e-mail avec accusé de lecture ou courrier recommandé.');
    this._bullet(doc, 'Les réclamations orales ou par messagerie instantanée ne sont pas recevables.');

    this._check(doc, 20);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Délai de réclamation :', LEFT + 8, doc.y + 4);
    doc.y += 14;
    this._bullet(doc, 'La réclamation doit être formulée dans les 48 heures suivant la fin de la prestation.');
    this._bullet(doc, 'Passé ce délai, la prestation est réputée acceptée et conforme, sauf preuve contraire fournie par le Client.');

    this._check(doc, 20);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Contenu de la réclamation :', LEFT + 8, doc.y + 4);
    doc.y += 14;
    this._bullet(doc, 'Description précise du problème, horaire des faits, éléments concernés (son, lumière, micro…), impact constaté.');
    this._bullet(doc, 'Éléments factuels à l\'appui : photo, vidéo, témoignage du personnel du lieu.');
    this._bullet(doc, 'Les appréciations subjectives non signalées pendant la prestation ne constituent pas un motif recevable.');

    this._check(doc, 20);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Traitement :', LEFT + 8, doc.y + 4);
    doc.y += 14;
    this._bullet(doc, 'Analyse par le Prestataire sous 7 jours ouvrés et proposition d\'une réponse motivée.');

    this._check(doc, 26);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text('Exclusions :', LEFT + 8, doc.y + 4);
    doc.y += 14;
    this._bullet(doc, 'Incidents imputables à la salle, à l\'alimentation électrique ou à des tiers.');
    this._bullet(doc, 'Restrictions du lieu (volume, fumée, jets) ou accès tardif empêchant l\'installation.');
    this._bullet(doc, 'Demandes de dernière minute non prévues au contrat.');

    doc.y += 8;
  }

  // ── SIGNATURES ───────────────────────────────────────────────────────────────
  _signatures(doc, devis, settings) {
    this._check(doc, 120);
    this._titreSection(doc, 'Signatures');

    const y = doc.y + 8;
    const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
    const repPrest      = settings?.contact?.representant || 'M. ODOUNGA ETOUMBI Randy';
    const nomClient     = `${devis.client?.prenom || ''} ${devis.client?.nom || ''}`.trim();
    const boxW          = (WIDTH - 20) / 2;

    // Box Prestataire
    doc.rect(LEFT, y, boxW, 90).strokeColor(C.gold).lineWidth(0.8).stroke();
    doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
       .text(`Signature du Prestataire – ${nomEntreprise}`, LEFT + 8, y + 8, { width: boxW - 16 });
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica-Bold')
       .text(repPrest, LEFT + 8, y + 22, { width: boxW - 16 });

    // Si signé par l'admin
    if (devis.signatures?.admin?.dateSignature) {
      const dateSig = new Date(devis.signatures.admin.dateSignature)
        .toLocaleDateString('fr-FR');
      doc.fontSize(7.5).fillColor(C.textLight).font('Helvetica')
         .text(`Signé le ${dateSig}`, LEFT + 8, y + 38, { width: boxW - 16 });
      doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
         .text('✓ SIGNÉ', LEFT + 8, y + 52, { width: boxW - 16 });
    } else {
      doc.fontSize(7).fillColor(C.textLight).font('Helvetica-Oblique')
         .text('Mention « Lu et approuvé »', LEFT + 8, y + 38, { width: boxW - 16 });
      doc.moveTo(LEFT + 10, y + 72).lineTo(LEFT + boxW - 10, y + 72)
         .strokeColor(C.textLight).lineWidth(0.5).stroke();
    }

    doc.fontSize(7).fillColor(C.textLight).font('Helvetica')
       .text('Date : ____ / ____ / ______',  LEFT + 8, y + 78, { width: boxW - 16 });

    // Box Client
    const cx = LEFT + boxW + 20;
    doc.rect(cx, y, boxW, 90).strokeColor(C.gold).lineWidth(0.8).stroke();
    doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
       .text('Signature du Client', cx + 8, y + 8, { width: boxW - 16 });
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica-Bold')
       .text(nomClient, cx + 8, y + 22, { width: boxW - 16 });

    if (devis.signatures?.client?.dateSignature) {
      const dateSig = new Date(devis.signatures.client.dateSignature)
        .toLocaleDateString('fr-FR');
      doc.fontSize(7.5).fillColor(C.textLight).font('Helvetica')
         .text(`Signé le ${dateSig}`, cx + 8, y + 38, { width: boxW - 16 });
      doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
         .text('✓ SIGNÉ', cx + 8, y + 52, { width: boxW - 16 });
    } else {
      doc.fontSize(7).fillColor(C.textLight).font('Helvetica-Oblique')
         .text('Mention « Lu et approuvé »', cx + 8, y + 38, { width: boxW - 16 });
      doc.moveTo(cx + 10, y + 72).lineTo(cx + boxW - 10, y + 72)
         .strokeColor(C.textLight).lineWidth(0.5).stroke();
    }

    doc.fontSize(7).fillColor(C.textLight).font('Helvetica')
       .text('Date : ____ / ____ / ______',  cx + 8, y + 78, { width: boxW - 16 });

    doc.y = y + 106;
  }

  // ── ANNEXE A — PV d'acceptation ───────────────────────────────────────────────
  _annexePV(doc, devis, settings) {
    doc.addPage();

    // Entête annexe
    doc.rect(0, 0, 595, 80).fill(C.navy);
    doc.fontSize(14).fillColor(C.gold).font('Helvetica-Bold')
       .text("ANNEXE A — PROCÈS-VERBAL D'ACCEPTATION", LEFT, 28, { lineBreak: false });
    const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
    const dateEv = devis.evenement?.date
      ? new Date(devis.evenement.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    doc.fontSize(8.5).fillColor(C.white).font('Helvetica')
       .text(`Prestation ${nomEntreprise} — Événement du ${dateEv}`, LEFT, 50, { lineBreak: false });

    doc.y = 96;

    // Description
    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
       .text(
         `Ce procès-verbal atteste du bon déroulement de l'installation et/ou de la prestation réalisée par ${nomEntreprise}.`,
         LEFT + 8, doc.y + 8, { width: WIDTH - 16 }
       );
    doc.y += 22;

    // Informations générales
    this._titreSection(doc, 'Informations Générales');
    const lieu = [
      devis.evenement?.lieu?.adresse || devis.evenement?.lieu?.nom,
      devis.evenement?.lieu?.codePostal,
      devis.evenement?.lieu?.ville,
    ].filter(Boolean).join(', ') || '—';
    const nomClient = `${devis.client?.prenom || ''} ${devis.client?.nom || ''}`.trim();

    this._champPV(doc, 'Nom du Client', nomClient || '_________________________________');
    this._champPV(doc, 'Date de l\'événement', dateEv);
    this._champPV(doc, 'Adresse', lieu);
    this._champPV(doc, 'Heure d\'installation', devis.evenement?.heureDebut || '___________');

    // Contrôles techniques
    this._titreSection(doc, 'Contrôles Techniques à l\'Installation');

    const controles = [
      'Sonorisation – enceintes opérationnelles',
      'Microphone fonctionnel',
      'Éclairage / Lyres / Effets lumineux',
      'Machine à fumée',
      'Effets spéciaux (jets / confettis)',
      'Volume validé par le Client',
      'Tests musicaux effectués',
    ];

    // Ajouter les materiels qui seraient des éléments de contrôle
    const materielsNoms = (devis.materiels || []).map(m => m.nom).filter(Boolean);
    const controlesFinal = controles.slice();

    controles.forEach((ctrl, i) => {
      this._checkboxLigne(doc, ctrl);
    });

    doc.y += 6;

    // Observations
    this._titreSection(doc, 'Observations Éventuelles');
    this._check(doc, 70);
    const obsY = doc.y + 4;
    doc.rect(LEFT, obsY, WIDTH, 60).strokeColor(C.textLight).lineWidth(0.4).stroke();
    doc.fontSize(7).fillColor(C.textLight).font('Helvetica-Oblique')
       .text('(Espace réservé aux observations éventuelles)',
             LEFT + 8, obsY + 8, { width: WIDTH - 16 });
    doc.y = obsY + 68;

    // Validation fin prestation
    this._titreSection(doc, 'Fin de Prestation – Validation');
    this._checkboxLigne(doc, 'Prestation DJ réalisée conformément aux attentes');
    this._checkboxLigne(doc, 'Aucun incident technique durant l\'événement');
    this._checkboxLigne(doc, 'Ambiance générale validée par le Client');
    doc.y += 10;

    // Signatures PV
    this._check(doc, 120);
    const pvSigY = doc.y + 8;
    const boxW   = (WIDTH - 20) / 2;
    const nomPrest = settings?.contact?.representant || 'M. ODOUNGA ETOUMBI Randy';
    const nomCli   = `${devis.client?.prenom || ''} ${devis.client?.nom || ''}`.trim();

    doc.rect(LEFT, pvSigY, boxW, 90).strokeColor(C.gold).lineWidth(0.8).stroke();
    doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
       .text(`Signature du Prestataire – ${nomEntreprise}`, LEFT + 8, pvSigY + 8, { width: boxW - 16 });
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica-Bold')
       .text(nomPrest, LEFT + 8, pvSigY + 22, { width: boxW - 16 });
    doc.moveTo(LEFT + 10, pvSigY + 70).lineTo(LEFT + boxW - 10, pvSigY + 70)
       .strokeColor(C.textLight).lineWidth(0.5).stroke();
    doc.fontSize(7).fillColor(C.textLight).font('Helvetica')
       .text('Date : ____ / ____ / ______',  LEFT + 8, pvSigY + 78, { width: boxW - 16 })
       .text('Lieu : ___________________',   LEFT + 8, pvSigY + 60, { width: boxW - 16 });

    const cx2 = LEFT + boxW + 20;
    doc.rect(cx2, pvSigY, boxW, 90).strokeColor(C.gold).lineWidth(0.8).stroke();
    doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
       .text('Signature du Client (Mention « Lu et approuvé »)',
             cx2 + 8, pvSigY + 8, { width: boxW - 16 });
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica-Bold')
       .text(nomCli, cx2 + 8, pvSigY + 22, { width: boxW - 16 });
    doc.moveTo(cx2 + 10, pvSigY + 70).lineTo(cx2 + boxW - 10, pvSigY + 70)
       .strokeColor(C.textLight).lineWidth(0.5).stroke();
    doc.fontSize(7).fillColor(C.textLight).font('Helvetica')
       .text('Date : ____ / ____ / ______',  cx2 + 8, pvSigY + 78, { width: boxW - 16 })
       .text('Lieu : ___________________',   cx2 + 8, pvSigY + 60, { width: boxW - 16 });

    doc.y = pvSigY + 106;
  }

  // ── Champ PV ─────────────────────────────────────────────────────────────────
  _champPV(doc, label, valeur) {
    this._check(doc, 18);
    const y = doc.y;
    doc.fontSize(8).fillColor(C.textMid).font('Helvetica')
       .text(`${label} :`, LEFT + 8, y + 2, { width: 160, lineBreak: false });
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica-Bold')
       .text(valeur, LEFT + 175, y + 2, { width: WIDTH - 185 });
    doc.moveTo(LEFT, y + 16).lineTo(RIGHT, y + 16)
       .strokeColor('#e0ddd0').lineWidth(0.2).stroke();
    doc.y = y + 17;
  }

  // ── Case à cocher PV ─────────────────────────────────────────────────────────
  _checkboxLigne(doc, label) {
    this._check(doc, 18);
    const y  = doc.y + 2;
    const bx = LEFT + 8;
    const by = y + 1;
    // □ OUI
    doc.rect(bx, by, 9, 9).strokeColor(C.navy).lineWidth(0.5).stroke();
    doc.fontSize(7.5).fillColor(C.textMid).font('Helvetica')
       .text('OUI', bx + 11, by + 1, { lineBreak: false });
    // □ NON
    doc.rect(bx + 40, by, 9, 9).strokeColor(C.navy).lineWidth(0.5).stroke();
    doc.text('NON', bx + 51, by + 1, { lineBreak: false });
    // Label
    doc.fontSize(8.5).fillColor(C.text).font('Helvetica')
       .text(label, LEFT + 105, y, { width: WIDTH - 115, lineBreak: false });
    doc.moveTo(LEFT, y + 14).lineTo(RIGHT, y + 14)
       .strokeColor('#e0ddd0').lineWidth(0.2).stroke();
    doc.y = y + 15;
  }

  // ── Formatage prix ───────────────────────────────────────────────────────────
  _fmt(prix) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR',
    }).format(prix || 0);
  }

  /**
   * Génère le contrat en mémoire et retourne un Buffer
   * Utile pour les pièces jointes email (sans écrire sur disque)
   */
  async genererContratBuffer(devis, settings = {}) {
    const os   = require('os');
    const tmp  = require('path');
    const tmpPath = tmp.join(os.tmpdir(), `contrat-${devis._id || Date.now()}-${Date.now()}.pdf`);
    try {
      await this.genererContratPDF(devis, tmpPath, settings);
      const buffer = fs.readFileSync(tmpPath);
      try { fs.unlinkSync(tmpPath); } catch (_) {}
      return buffer;
    } catch (err) {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
      throw err;
    }
  }
}
