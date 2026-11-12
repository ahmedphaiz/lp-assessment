/* Builds the Loss Prevention Assessment PDF with jsPDF + autotable */
(function () {
  'use strict';
  const NAVY = [19, 38, 63], NAVY2 = [30, 58, 92], AMBER = [232, 163, 61], INK = [24, 32, 43], MUTED = [102, 113, 128],
    LINE = [214, 217, 210], SOFT = [244, 245, 241];
  const PW = 210, PH = 297, M = 14, CW = PW - 2 * M, TOP = 27, BOTTOM = PH - 18;

  function fmtDate(iso) {
    if (!iso) return '';
    const p = iso.split('-'); if (p.length !== 3) return iso;
    return (+p[2]) + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+p[1] - 1] + ' ' + p[0];
  }
  const clean = (s) => String(s || '').replace(/\r/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim();
  const typesOf = (r) => (Array.isArray(r.types) ? r.types : (r.type ? [r.type] : [])).map(clean).filter(Boolean);
  const typeText = (r) => typesOf(r).join(', ');
  const filled = (l) => l.risks.filter(r => typesOf(r).length || r.standard || r.timeline);

  window.buildReport = function ({ site, locations, includePlan, photoData }) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const year = (site.date || '').slice(0, 4) || String(new Date().getFullYear());
    const title = 'Loss Prevention Assessment ' + year;
    const siteName = clean(site.name) || 'Untitled site';

    const font = (size, style, color) => { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor.apply(doc, color || INK); };
    const label = (txt, x, y) => { font(8, 'bold', MUTED); doc.setCharSpace(0.4); doc.text(txt.toUpperCase(), x, y); doc.setCharSpace(0); };

    // ================= COVER =================
    doc.setFillColor.apply(doc, NAVY); doc.rect(0, 0, PW, 112, 'F');
    doc.setFillColor.apply(doc, AMBER); doc.rect(M, 26, 18, 2.2, 'F');
    font(10, 'bold', [200, 210, 225]); doc.setCharSpace(0.8); doc.text('LOSS PREVENTION ASSESSMENT', M, 38); doc.setCharSpace(0);
    font(30, 'bold', [255, 255, 255]);
    const nameLines = doc.splitTextToSize(siteName, CW);
    doc.text(nameLines.slice(0, 3), M, 54);
    let cy = 54 + Math.min(nameLines.length, 3) * 12;
    font(12, 'normal', [210, 218, 230]);
    doc.text(title, M, cy); cy += 14;

    // meta row
    const meta = [['Date of assessment', fmtDate(site.date)], ['Assessed by', clean(site.assessor) || '-'], ['Reference', clean(site.ref) || '-']];
    const colW = CW / 3;
    meta.forEach((m, i) => {
      const x = M + i * colW;
      font(7.5, 'bold', [160, 175, 195]); doc.setCharSpace(0.4); doc.text(m[0].toUpperCase(), x, Math.max(cy, 96)); doc.setCharSpace(0);
      font(10.5, 'bold', [255, 255, 255]); doc.text(doc.splitTextToSize(m[1], colW - 4)[0], x, Math.max(cy, 96) + 6);
    });

    // key figures
    const allRisks = locations.reduce((a, l) => a.concat(filled(l).map(r => Object.assign({ loc: l }, r))), []);
    const nPhotos = locations.reduce((n, l) => n + l.photos.length, 0);
    const figs = [[locations.length, 'Locations assessed'], [allRisks.length, 'Risks identified'], [nPhotos, 'Photos attached']];
    let y = 124;
    const fw = (CW - 8) / 3;
    figs.forEach((f, i) => {
      const x = M + i * (fw + 4);
      doc.setFillColor.apply(doc, SOFT); doc.roundedRect(x, y, fw, 24, 2.5, 2.5, 'F');
      doc.setFillColor.apply(doc, AMBER); doc.rect(x, y + 4, 1.2, 16, 'F');
      font(20, 'bold', NAVY); doc.text(String(f[0]), x + 6, y + 13);
      font(8.5, 'normal', MUTED); doc.text(f[1], x + 6, y + 19.5);
    });
    y += 34;

    // risk profile
    const tally = {};
    allRisks.forEach(r => { const ts = typesOf(r); (ts.length ? ts : ['Unspecified']).forEach(k => { tally[k] = (tally[k] || 0) + 1; }); });
    const tallyRows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    if (tallyRows.length) {
      label('Risk profile', M, y); y += 3;
      const max = tallyRows[0][1];
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: TOP, bottom: PH - BOTTOM + 2 },
        head: [['Risk type', 'Count', '']], body: tallyRows.map(r => [r[0], String(r[1]), '']),
        theme: 'plain', styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 }, lineColor: LINE },
        headStyles: { fontStyle: 'bold', textColor: MUTED, fontSize: 8, lineWidth: { bottom: 0.3 } },
        bodyStyles: { lineWidth: { bottom: 0.15 } },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 16, halign: 'right', fontStyle: 'bold' }, 2: { cellWidth: 'auto' } },
        didDrawCell: (d) => {
          if (d.section === 'body' && d.column.index === 2) {
            const v = tallyRows[d.row.index][1];
            const w = (d.cell.width - 6) * v / max;
            doc.setFillColor.apply(doc, AMBER); doc.roundedRect(d.cell.x + 3, d.cell.y + d.cell.height / 2 - 1.6, Math.max(w, 1.5), 3.2, 1, 1, 'F');
          }
        }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // locations summary
    if (y > BOTTOM - 30) { doc.addPage(); y = TOP + 4; }
    label('Locations assessed', M, y); y += 3;
    doc.autoTable({
      startY: y, margin: { left: M, right: M, top: TOP + 2, bottom: PH - BOTTOM + 2 },
      head: [['#', 'Location', 'Risks', 'Risk types']],
      body: locations.map((l, i) => [String(i + 1), clean(l.name) || 'Unnamed location', String(filled(l).length),
        Array.from(new Set([].concat.apply([], filled(l).map(typesOf)))).join(', ') || '-']),
      theme: 'plain', styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, cellPadding: 2.2, lineColor: LINE, valign: 'top' },
      headStyles: { fontStyle: 'bold', textColor: MUTED, fontSize: 8, lineWidth: { bottom: 0.3 } },
      bodyStyles: { lineWidth: { bottom: 0.15 } },
      columnStyles: { 0: { cellWidth: 9, textColor: MUTED }, 1: { cellWidth: 62, fontStyle: 'bold' }, 2: { cellWidth: 15, halign: 'center' }, 3: { cellWidth: 'auto', textColor: [70, 80, 92] } }
    });

    // ================= LOCATION PAGES =================
    locations.forEach((l, li) => {
      doc.addPage();
      let y = TOP + 3;
      // location heading
      doc.setFillColor.apply(doc, NAVY); doc.roundedRect(M, y, 10, 10, 1.8, 1.8, 'F');
      font(11, 'bold', [255, 255, 255]); doc.text(String(li + 1), M + 5, y + 6.8, { align: 'center' });
      label('Location', M + 14, y + 3.4);
      font(15, 'bold', INK);
      const ln = doc.splitTextToSize(clean(l.name) || 'Unnamed location', CW - 14);
      doc.text(ln, M + 14, y + 9.5);
      y += 9.5 + (ln.length - 1) * 6.2 + 7;

      // findings
      label('Findings', M, y); y += 3;
      font(10, 'normal', INK);
      const ftxt = clean(l.findings) || 'No findings recorded.';
      const flines = doc.splitTextToSize(ftxt, CW - 8);
      const lh = 4.6;
      let i = 0;
      while (i < flines.length) {
        const room = Math.floor((BOTTOM - y - 6) / lh);
        if (room < 2) { doc.addPage(); y = TOP + 3; continue; }
        const chunk = flines.slice(i, i + room);
        const bh = chunk.length * lh + 6;
        doc.setFillColor.apply(doc, SOFT); doc.roundedRect(M, y, CW, bh, 2, 2, 'F');
        doc.setFillColor.apply(doc, AMBER); doc.rect(M, y, 1.1, bh, 'F');
        font(10, clean(l.findings) ? 'normal' : 'italic', clean(l.findings) ? INK : MUTED);
        doc.text(chunk, M + 5, y + 5.6, { lineHeightFactor: 1.32 });
        y += bh; i += chunk.length;
        if (i < flines.length) { doc.addPage(); y = TOP + 3; }
      }
      y += 8;

      // risks table
      const rs = filled(l);
      if (y > BOTTOM - 25) { doc.addPage(); y = TOP + 3; }
      label('Risks, required standards & timeline', M, y); y += 2.5;
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: TOP + 2, bottom: PH - BOTTOM + 2 },
        head: [['Risk', 'Required Standard', 'Timeline']],
        body: rs.length ? rs.map(r => [typesOf(r).join('\n') || '-', clean(r.standard) || '-', clean(r.timeline) || '-']) : [['No risks recorded for this location.', '', '']],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, cellPadding: 2.6, lineColor: LINE, lineWidth: 0.2, valign: 'top' },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9.5 },
        alternateRowStyles: { fillColor: [250, 250, 248] },
        columnStyles: { 0: { cellWidth: 44, fontStyle: 'bold' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 32 } },
        didParseCell: (d) => { if (!rs.length && d.section === 'body' && d.column.index === 0) { d.cell.colSpan = 3; d.cell.styles.fontStyle = 'italic'; d.cell.styles.textColor = MUTED; } }
      });
      y = doc.lastAutoTable.finalY + 9;

      // photos
      if (l.photos.length) {
        if (y > BOTTOM - 50) { doc.addPage(); y = TOP + 3; }
        label('Photos (' + l.photos.length + ')', M, y); y += 3;
        const gap = 6, pw = (CW - gap) / 2, maxH = 74;
        for (let p = 0; p < l.photos.length; p += 2) {
          const pair = l.photos.slice(p, p + 2).map(ph => {
            const data = photoData(ph.id);
            let w = ph.w, h = ph.h;
            if (data && (!w || !h)) { try { const pr = doc.getImageProperties(data); w = pr.width; h = pr.height; } catch (e) { } }
            const ratio = (w && h) ? h / w : 0.75;
            let dw = pw, dh = pw * ratio;
            if (dh > maxH) { dh = maxH; dw = maxH / ratio; }
            return { ph, data, dw, dh };
          });
          const rowH = Math.max.apply(null, pair.map(x => x.dh)) + 7;
          if (y + rowH > BOTTOM) { doc.addPage(); y = TOP + 3; }
          pair.forEach((x, k) => {
            const cx = M + k * (pw + gap);
            const ox = cx + (pw - x.dw) / 2;
            doc.setFillColor.apply(doc, SOFT); doc.rect(cx, y, pw, rowH - 7, 'F');
            if (x.data) {
              try { doc.addImage(x.data, 'JPEG', ox, y + (rowH - 7 - x.dh) / 2, x.dw, x.dh, 'p' + x.ph.id, 'FAST'); }
              catch (e) { font(8, 'italic', MUTED); doc.text('Image could not be loaded', cx + 4, y + 8); }
            } else { font(8, 'italic', MUTED); doc.text('Image missing', cx + 4, y + 8); }
            font(7.5, 'normal', MUTED); doc.text('Photo ' + (p + k + 1), cx, y + rowH - 2.6);
          });
          y += rowH + 3;
        }
      }
    });

    // ================= ACTION PLAN =================
    if (includePlan && allRisks.length) {
      doc.addPage();
      let y = TOP + 3;
      font(15, 'bold', INK); doc.text('Action plan', M, y + 5);
      font(9.5, 'normal', MUTED); doc.text('All risks identified across the site, with the required standard and timeline for each.', M, y + 11);
      y += 16;
      let n = 0;
      const rows = [];
      locations.forEach((l, li) => filled(l).forEach(r => rows.push([String(++n), (li + 1) + '. ' + (clean(l.name) || 'Unnamed'), typeText(r) || '-', clean(r.standard) || '-', clean(r.timeline) || '-'])));
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: TOP + 2, bottom: PH - BOTTOM + 2 },
        head: [['#', 'Location', 'Risk', 'Required Standard', 'Timeline']], body: rows, theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8.8, textColor: INK, cellPadding: 2.2, lineColor: LINE, lineWidth: 0.2, valign: 'top' },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 248] },
        columnStyles: { 0: { cellWidth: 8, textColor: MUTED }, 1: { cellWidth: 36, fontStyle: 'bold' }, 2: { cellWidth: 33 }, 3: { cellWidth: 'auto' }, 4: { cellWidth: 26 } }
      });
    }

    // ================= HEADERS & FOOTERS =================
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      if (p > 1) {
        doc.setFillColor.apply(doc, NAVY); doc.rect(0, 0, PW, 17, 'F');
        doc.setFillColor.apply(doc, AMBER); doc.rect(0, 17, PW, 0.9, 'F');
        font(11, 'bold', [255, 255, 255]); doc.text(title, M, 10.8);
        font(9, 'normal', [200, 210, 225]);
        const sn = doc.splitTextToSize(siteName, 80)[0];
        doc.text(sn, PW - M, 10.8, { align: 'right' });
      }
      doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.3); doc.line(M, PH - 13, PW - M, PH - 13);
      font(8, 'normal', MUTED); doc.text(fmtDate(site.date), M, PH - 8);
      font(8, 'bold', MUTED); doc.setCharSpace(0.5); doc.text('CONFIDENTIAL', PW / 2, PH - 8, { align: 'center' }); doc.setCharSpace(0);
      font(8, 'normal', MUTED); doc.text('Page ' + p + ' of ' + total, PW - M, PH - 8, { align: 'right' });
    }
    doc.setProperties({ title: title + ' - ' + siteName, subject: 'Loss Prevention Assessment', author: clean(site.assessor), creator: 'LP Assessment app' });
    return doc;
  };
})();
