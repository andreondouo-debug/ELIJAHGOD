const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * 📄 SERVICE DE GÉNÉRATION DE PDF POUR DEVIS
 * Design sobre : marine foncé + or — avec logo ELIJAH'GOD
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:      '#1a1a2e',   // fond entête
  navyLight: '#252540',   // fond bande titre
  gold:      '#c9a227',   // or accentuation
  goldLight: '#f5e9c0',   // fond totaux
  text:      '#1a1a2e',
  textMid:   '#444444',
  textLight: '#888888',
  white:     '#ffffff',
  bgAlt:     '#f7f6f2',   // ligne alternée tableau
  bgSection: '#faf9f5',
};

const LEFT   = 45;
const RIGHT  = 550;
const WIDTH  = RIGHT - LEFT;
const FOOTER = 55;        // hauteur réservée pied de page
const PAGE_H = 842;       // A4

// Logo
const LOGO_PATH = path.join(__dirname, '../../../frontend/public/images/logo.png');

class PDFService {

  async genererDevisPDF(devis, outputPath, settings = {}) {
    return new Promise((resolve, reject) => {
      try {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 45, bottom: FOOTER + 20, left: LEFT, right: 45 },
          info: {
            Title: `Devis ${devis.numeroDevis}`,
            Author: "ELIJAH'GOD",
            Subject: 'Devis événementiel',
          },
          autoFirstPage: true,
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Pied de page automatique à chaque nouvelle page
        let isAddingFooter = false; // Protection contre la récursion
        const placerFooter = () => {
          if (isAddingFooter) return; // Éviter la boucle infinie
          isAddingFooter = true;
          
          const fy = PAGE_H - FOOTER;
          doc.save();
          doc.moveTo(LEFT, fy).lineTo(RIGHT, fy)
             .strokeColor(C.gold).lineWidth(0.4).stroke();
          doc.fontSize(7).fillColor(C.textLight).font('Helvetica');
          // Utiliser des coordonnées fixes pour éviter l'ajout de pages
          const footerText = settings?.entreprise?.nom 
            ? `${settings.entreprise.nom} · DJ & Sonorisation Événementielle · ${settings?.contact?.email || 'contact@elijahgod.com'}`
            : "ELIJAH'GOD · DJ & Sonorisation Événementielle · contact@elijahgod.com";
          const footerY = fy + 8;
          doc.text(footerText, LEFT, footerY, { 
            width: WIDTH, 
            align: 'center',
            lineBreak: false // Empêcher les sauts de ligne automatiques
          });
          doc.restore();
          
          isAddingFooter = false;
        };
        doc.on('pageAdded', placerFooter);

        // Construction du contenu
        this._ajouterEntete(doc, devis, settings);
        this._ajouterInfosClient(doc, devis);
        this._ajouterInfosEvenement(doc, devis);
        this._ajouterTableauPrestations(doc, devis);
        this._ajouterTableauMateriels(doc, devis);
        this._ajouterFraisSupplementaires(doc, devis);
        this._ajouterTotaux(doc, devis);
        this._ajouterConditions(doc, devis);

        // Footer page 1 (pageAdded ne se déclenche pas sur la première page)
        placerFooter();

        doc.end();

        stream.on('finish', () => {
          console.log('✅ PDF généré:', outputPath);
          resolve(outputPath);
        });
        
        stream.on('error', reject);

      } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        reject(error);
      }
    });
  }

  // ── Vérification espace page ────────────────────────────────────────────────
  _check(doc, needed) {
    if (doc.y + needed > PAGE_H - FOOTER - 15) {
      doc.addPage();
    }
  }

  // ── EN-TÊTE ─────────────────────────────────────────────────────────────────
  _ajouterEntete(doc, devis, settings = {}) {
    // Bande marine
    doc.rect(0, 0, 595, 108).fill(C.navy);

    // Logo
    let logoX = LEFT;
    let nomX  = LEFT;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, LEFT, 24, { height: 62 });
        nomX = LEFT + 75;
      } catch (e) { /* logo introuvable */ }
    }

    // Nom & sous-titre
    const nomEntreprise = settings?.entreprise?.nom || "ELIJAH'GOD";
    const slogan = settings?.entreprise?.slogan || 'DJ · Sonorisation · Animation Événementielle';
    
    doc.fontSize(21).fillColor(C.white).font('Helvetica-Bold')
       .text(nomEntreprise, nomX, 30, { lineBreak: false });
    doc.fontSize(8.5).fillColor(C.gold).font('Helvetica')
       .text(slogan, nomX, 56, { lineBreak: false });

    // Coordonnées à droite
    const email = settings?.contact?.email || 'contact@elijahgod.com';
    const telephone = settings?.contact?.telephone || '+33 X XX XX XX XX';
    const ville = settings?.contact?.adresse?.ville || 'Paris';
    const pays = settings?.contact?.adresse?.pays || 'France';
    
    doc.fontSize(8).fillColor(C.white).font('Helvetica')
       .text(email, LEFT, 28, { width: WIDTH, align: 'right', lineBreak: false })
       .text(telephone, LEFT, 41, { width: WIDTH, align: 'right', lineBreak: false })
       .text(`${ville}, ${pays}`, LEFT, 54, { width: WIDTH, align: 'right', lineBreak: false });

    // Bande titre DEVIS
    doc.rect(0, 108, 595, 40).fill(C.navyLight);
    doc.fontSize(18).fillColor(C.gold).font('Helvetica-Bold')
       .text('DEVIS', LEFT, 117, { lineBreak: false });
    doc.fontSize(8.5).fillColor(C.white).font('Helvetica')
       .text(`N°  ${devis.numeroDevis}`, LEFT, 118, { width: WIDTH - 5, align: 'right', lineBreak: false });
    const dateStr = `Date : ${this._formaterDate(devis.createdAt)}${devis.validiteJusquau ? '   ·   Valide jusqu\'au : ' + this._formaterDate(devis.validiteJusquau) : ''}`;
    doc.fontSize(7.5).fillColor(C.gold)
       .text(dateStr, LEFT, 130, { width: WIDTH, align: 'right', lineBreak: false });

    doc.y = 162;
  }

  // ── CLIENT ──────────────────────────────────────────────────────────────────
  _ajouterInfosClient(doc, devis) {
    this._check(doc, 90);
    const y = doc.y + 12;
    const bW = WIDTH * 0.48;

    doc.rect(LEFT, y, bW, 76).fill(C.bgSection);
    doc.rect(LEFT, y, 3, 76).fill(C.gold);

    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text('CLIENT', LEFT + 10, y + 8);
    doc.fontSize(9).fillColor(C.text).font('Helvetica-Bold')
       .text(`${devis.client.prenom} ${devis.client.nom}`, LEFT + 10, y + 22);
    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica')
       .text(devis.client.email, LEFT + 10, y + 36)
       .text(devis.client.telephone || '', LEFT + 10, y + 49);
    if (devis.client.entreprise)
      doc.text(devis.client.entreprise, LEFT + 10, y + 62);

    doc.y = y + 90;
  }

  // ── ÉVÉNEMENT ───────────────────────────────────────────────────────────────
  _ajouterInfosEvenement(doc, devis) {
    this._check(doc, 88);
    const y = doc.y + 8;

    doc.rect(LEFT, y, WIDTH, 74).fill(C.bgSection);
    doc.rect(LEFT, y, 3, 74).fill(C.gold);

    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text('DÉTAILS ÉVÉNEMENT', LEFT + 10, y + 8);

    const ev = devis.evenement;
    const col2 = LEFT + WIDTH / 2;

    doc.fontSize(8.5).fillColor(C.textMid).font('Helvetica');

    doc.fillColor(C.text).font('Helvetica-Bold')
       .text('Type :', LEFT + 10, y + 24, { continued: true })
       .font('Helvetica').fillColor(C.textMid).text(`  ${ev.type || ''}`);

    if (ev.date)
      doc.fillColor(C.text).font('Helvetica-Bold')
         .text('Date :', col2, y + 24, { lineBreak: false, continued: true })
         .font('Helvetica').fillColor(C.textMid).text(`  ${this._formaterDate(ev.date)}`);

    if (ev.heureDebut)
      doc.fillColor(C.text).font('Helvetica-Bold')
         .text('Horaires :', LEFT + 10, y + 38, { continued: true })
         .font('Helvetica').fillColor(C.textMid)
         .text(`  ${ev.heureDebut}${ev.heureFin ? ' – ' + ev.heureFin : ''}`);

    const lieu = [ev.lieu?.adresse || ev.lieu?.nom, ev.lieu?.ville].filter(Boolean).join(', ');
    if (lieu)
      doc.fillColor(C.text).font('Helvetica-Bold')
         .text('Lieu :', LEFT + 10, y + 51, { continued: true })
         .font('Helvetica').fillColor(C.textMid).text(`  ${lieu}`);

    if (ev.nbInvites)
      doc.fillColor(C.text).font('Helvetica-Bold')
         .text("Invités :", col2, y + 51, { lineBreak: false, continued: true })
         .font('Helvetica').fillColor(C.textMid).text(`  ${ev.nbInvites}`);

    doc.y = y + 88;
  }

  // ── EN-TÊTE DE TABLEAU ──────────────────────────────────────────────────────
  _tableauEntetes(doc, titre, cols) {
    this._check(doc, 55);
    const y = doc.y + 14;

    doc.fontSize(9).fillColor(C.gold).font('Helvetica-Bold')
       .text(titre.toUpperCase(), LEFT, y);
    doc.moveTo(LEFT, y + 13).lineTo(RIGHT, y + 13)
       .strokeColor(C.gold).lineWidth(0.5).stroke();

    const hY = y + 17;
    doc.rect(LEFT, hY, WIDTH, 20).fill(C.navy);
    doc.fontSize(8).fillColor(C.white).font('Helvetica-Bold');
    cols.forEach(col => {
      doc.text(col.label, LEFT + col.x, hY + 6, { width: col.w, align: col.align || 'left' });
    });

    doc.y = hY + 20;
  }

  _tableauLigne(doc, cols, data, isOdd) {
    const rowH = 22;
    this._check(doc, rowH + 4);
    const y = doc.y;
    doc.rect(LEFT, y, WIDTH, rowH).fill(isOdd ? C.bgAlt : C.white);
    cols.forEach(col => {
      const val = data[col.key] !== undefined ? String(data[col.key]) : '';
      doc.fontSize(8.5).fillColor(col.color || C.text)
         .font(col.bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(val, LEFT + col.x, y + 5, { width: col.w, align: col.align || 'left' });
    });
    doc.moveTo(LEFT, y + rowH).lineTo(RIGHT, y + rowH)
       .strokeColor('#e0ddd0').lineWidth(0.3).stroke();
    doc.y = y + rowH;
  }

  _tableauSousTotal(doc, label, montant) {
    this._check(doc, 22);
    const y = doc.y;
    doc.rect(LEFT, y, WIDTH, 20).fill(C.goldLight);
    doc.fontSize(8.5).fillColor(C.navy).font('Helvetica-Bold')
       .text(label, LEFT + 8, y + 6)
       .text(this._formaterPrix(montant), LEFT, y + 6, { width: WIDTH - 5, align: 'right' });
    doc.y = y + 20;
  }

  // ── PRESTATIONS ─────────────────────────────────────────────────────────────
  _ajouterTableauPrestations(doc, devis) {
    if (!devis.prestations?.length) return;

    const cols = [
      { label: 'Désignation',    key: 'nom',   x: 5,   w: 240 },
      { label: 'Qté',            key: 'qte',   x: 255, w: 35,  align: 'center' },
      { label: 'Prix unit. HT',  key: 'prixU', x: 298, w: 90,  align: 'right' },
      { label: 'Total HT',       key: 'total', x: 396, w: 99,  align: 'right', bold: true },
    ];
    this._tableauEntetes(doc, 'Prestations', cols);

    let sousTotal = 0;
    devis.prestations.forEach((p, i) => {
      const total = (p.prixUnitaire || 0) * (p.quantite || 1);
      sousTotal += total;
      this._tableauLigne(doc, cols, {
        nom: p.nom, qte: p.quantite,
        prixU: this._formaterPrix(p.prixUnitaire),
        total: this._formaterPrix(total),
      }, i % 2 === 1);
    });
    this._tableauSousTotal(doc, 'Sous-total prestations', sousTotal);
  }

  // ── MATÉRIELS ────────────────────────────────────────────────────────────────
  _ajouterTableauMateriels(doc, devis) {
    if (!devis.materiels?.length) return;

    const cols = [
      { label: 'Désignation', key: 'nom',   x: 5,   w: 190 },
      { label: 'Qté',         key: 'qte',   x: 200, w: 35,  align: 'center' },
      { label: 'Durée',       key: 'duree', x: 242, w: 65,  align: 'center' },
      { label: 'Prix',        key: 'prix',  x: 315, w: 80,  align: 'right' },
      { label: 'Total HT',    key: 'total', x: 400, w: 95,  align: 'right', bold: true },
    ];
    this._tableauEntetes(doc, 'Location matériel', cols);

    let sousTotal = 0;
    devis.materiels.forEach((m, i) => {
      const total = (m.prixLocation || 0) * (m.quantite || 1);
      sousTotal += total;
      this._tableauLigne(doc, cols, {
        nom: m.nom, qte: m.quantite,
        duree: m.dureeLocation || '1 jour',
        prix: this._formaterPrix(m.prixLocation),
        total: this._formaterPrix(total),
      }, i % 2 === 1);
    });
    this._tableauSousTotal(doc, 'Sous-total matériel', sousTotal);
  }

  // ── FRAIS SUPPLÉMENTAIRES ────────────────────────────────────────────────────
  _ajouterFraisSupplementaires(doc, devis) {
    const frais = [];
    if (devis.montants?.fraisKilometriques?.montant > 0) {
      const fk = devis.montants.fraisKilometriques;
      frais.push({
        libelle: `Déplacement (${fk.distanceAllerRetour} km A/R · ${fk.kmFacturables} km × ${fk.tarifParKm} €/km)`,
        montant: fk.montant,
      });
    }
    (devis.montants?.fraisSupplementaires || []).forEach(f =>
      frais.push({ libelle: f.libelle, montant: f.montant })
    );
    if (!frais.length) return;

    const cols = [
      { label: 'Description', key: 'libelle', x: 5,   w: 385 },
      { label: 'Montant HT',  key: 'montant', x: 396, w: 99,  align: 'right', bold: true },
    ];
    this._tableauEntetes(doc, 'Frais supplémentaires', cols);
    frais.forEach((f, i) => {
      this._tableauLigne(doc, cols, {
        libelle: f.libelle,
        montant: this._formaterPrix(f.montant),
      }, i % 2 === 1);
    });
  }

  // ── TOTAUX ───────────────────────────────────────────────────────────────────
  _ajouterTotaux(doc, devis) {
    this._check(doc, 150);
    const m      = devis.montants || {};
    const bX     = LEFT + WIDTH * 0.52;
    const bW     = WIDTH * 0.48;
    let cy       = doc.y + 18;

    const ligne = (label, valeur, highlight = false, couleur = null) => {
      if (highlight) {
        doc.rect(bX, cy, bW, 30).fill(C.navy);
        doc.fontSize(11).fillColor(C.gold).font('Helvetica-Bold')
           .text(label, bX + 8, cy + 9)
           .text(this._formaterPrix(valeur), bX, cy + 9, { width: bW - 8, align: 'right' });
        cy += 30;
      } else {
        doc.rect(bX, cy, bW, 22).fill(C.bgSection);
        doc.fontSize(8.5).fillColor(couleur || C.text)
           .font('Helvetica').text(label, bX + 8, cy + 6);
        doc.font('Helvetica-Bold').fillColor(couleur || C.navy)
           .text(this._formaterPrix(valeur), bX, cy + 6, { width: bW - 8, align: 'right' });
        cy += 22;
      }
    };

    doc.rect(bX, cy - 1, bW, 2).fill(C.gold); cy += 3;
    ligne('Total HT', m.totalAvantRemise || 0);
    if ((m.montantRemise || 0) > 0) {
      ligne(`Remise (${m.tauxRemise || '?'} %)`, -(m.montantRemise), false, '#c0392b');
      ligne('Total HT après remise', m.totalFinal || 0);
    }
    ligne(`TVA (${m.tauxTVA || 20} %)`, m.montantTVA || 0);
    ligne('TOTAL TTC', m.totalTTC || m.totalFinal || 0, true);

    if ((m.acompte?.montant || 0) > 0) {
      ligne(`Acompte (${m.acompte.pourcentage} %)`, m.acompte.montant, false, '#27ae60');
      const reste = (m.totalTTC || m.totalFinal || 0) - m.acompte.montant;
      ligne('Reste à payer', reste, false, '#e67e22');
    }

    doc.rect(bX, cy, bW, 2).fill(C.gold);
    doc.y = cy + 14;
  }

  // ── CONDITIONS & SIGNATURES ──────────────────────────────────────────────────
  _ajouterConditions(doc, devis) {
    this._check(doc, 115);
    const y = doc.y + 14;

    doc.rect(LEFT, y, WIDTH, 2).fill(C.gold);
    doc.fontSize(7.5).fillColor(C.gold).font('Helvetica-Bold')
       .text('CONDITIONS GÉNÉRALES', LEFT, y + 7);

    const lignes = [
      '• Acompte de 30 % à la signature du devis',
      "• Solde à régler le jour de l'événement",
      '• Devis valable 30 jours à compter de la date d\'émission',
      '• Annulation possible jusqu\'à 15 jours avant l\'événement (sans frais)',
      "• TVA non applicable selon l'article 293B du CGI",
    ];
    doc.fontSize(8).fillColor(C.textMid).font('Helvetica');
    lignes.forEach((l, i) => doc.text(l, LEFT + 6, y + 20 + i * 13));

    // Signatures
    const sigY = doc.y + 22;
    this._check(doc, 55);
    doc.rect(LEFT, sigY, WIDTH * 0.44, 38).stroke();
    doc.rect(LEFT + WIDTH * 0.56, sigY, WIDTH * 0.44, 38).stroke();
    doc.fontSize(7.5).fillColor(C.textLight).font('Helvetica')
       .text('Signature prestataire', LEFT + 5, sigY + 4)
       .text('Signature client  (Bon pour accord)', LEFT + WIDTH * 0.56 + 5, sigY + 4);

    doc.y = sigY + 48;
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  _formaterDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  _formaterPrix(prix) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR',
    }).format(prix || 0);
  }
}

module.exports = new PDFService();
