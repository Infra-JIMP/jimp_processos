import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import { STAGES } from '../utils/stages';
import type { StageId } from '../utils/stages';
import type { NSRecord } from '../store/types';

const STAGES_WITH_LOCATION = new Set<StageId>([
  'PAT', 'MONT_ASOALHO', 'PINTURA', 'REBIT',
  'PROD_PORTAS', 'CARPINTARIA', 'ELETRICA', 'REVISAO_FINAL',
]);

function fmtDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString('pt-BR');
  return new Date(iso).toLocaleDateString('pt-BR');
}

function getCurrentStageLabel(record: NSRecord): string {
  const firstPending = record.stages.findIndex(s => s.status !== 'done');
  if (firstPending === -1) return 'CONCLUÍDO';
  const inProgress = record.stages.find(s => s.status === 'in_progress');
  if (inProgress) {
    const stage = STAGES.find(s => s.id === inProgress.stageId);
    return stage?.label ?? '-';
  }
  const stage = STAGES[firstPending];
  return stage?.label ?? '-';
}

function getStatusColor(record: NSRecord): [number, number, number] {
  if (record.stages.every(s => s.status === 'done')) return [16, 185, 129];
  if (record.stages.some(s => s.status === 'in_progress')) return [255, 107, 53];
  return [141, 160, 200];
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportMultiple = useCallback(async (records: NSRecord[]) => {
    if (records.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const W = 210;
      const ML = 14;
      const MR = 14;
      const CW = W - ML - MR;

      // ── HEADER ──────────────────────────────────────────────────
      doc.setFillColor(10, 20, 50);
      doc.rect(0, 0, W, 38, 'F');
      doc.setFillColor(76, 110, 245);
      doc.rect(0, 0, W, 1.5, 'F');
      doc.setFillColor(255, 107, 53);
      doc.rect(0, 0, 4, 38, 'F');

      doc.setTextColor(116, 143, 252);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('JOINVILLE IMPLEMENTOS', ML + 6, 12);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTROLE DE PRODUÇÃO', ML + 6, 24);

      doc.setTextColor(141, 160, 200);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Emitido em ${fmtDate(new Date().toISOString())}   ·   ${records.length} registros`, ML + 6, 32);

      // Stats (top right)
      const done = records.filter(r => r.stages.every(s => s.status === 'done')).length;
      const inProg = records.filter(r => r.stages.some(s => s.status === 'in_progress')).length;
      const waiting = records.length - done - inProg;

      const statsX = W - MR - 60;
      [
        { label: 'Concluídos', value: done, color: [16, 185, 129] as [number,number,number] },
        { label: 'Andamento', value: inProg, color: [255, 107, 53] as [number,number,number] },
        { label: 'Aguardando', value: waiting, color: [141, 160, 200] as [number,number,number] },
      ].forEach(({ label, value, color }, i) => {
        const x = statsX + i * 22;
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), x, 22, { align: 'center' });
        doc.setTextColor(141, 160, 200);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x, 28, { align: 'center' });
      });

      // ── TABLE HEADER ─────────────────────────────────────────────
      let y = 44;
      const ROW_H = 8;
      const COL = { seq: 10, ns: 22, client: 80, stage: 55, progress: 15 };

      doc.setFillColor(20, 34, 65);
      doc.rect(ML, y, CW, ROW_H, 'F');

      doc.setTextColor(116, 143, 252);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');

      let xc = ML + 2;
      doc.text('SEQ', xc, y + 5.5); xc += COL.seq;
      doc.text('NS', xc, y + 5.5); xc += COL.ns;
      doc.text('CLIENTE', xc, y + 5.5); xc += COL.client;
      doc.text('SITUAÇÃO ATUAL', xc, y + 5.5); xc += COL.stage;
      doc.text('%', xc, y + 5.5, { align: 'right' });

      y += ROW_H;

      // ── ROWS ─────────────────────────────────────────────────────
      records.forEach((record, i) => {
        // Nova página se necessário
        if (y > 272) {
          doc.addPage();
          y = 14;

          // Mini header repetido
          doc.setFillColor(20, 34, 65);
          doc.rect(ML, y, CW, ROW_H, 'F');
          doc.setTextColor(116, 143, 252);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          xc = ML + 2;
          doc.text('SEQ', xc, y + 5.5); xc += COL.seq;
          doc.text('NS', xc, y + 5.5); xc += COL.ns;
          doc.text('CLIENTE', xc, y + 5.5); xc += COL.client;
          doc.text('SITUAÇÃO ATUAL', xc, y + 5.5); xc += COL.stage;
          doc.text('%', xc, y + 5.5, { align: 'right' });
          y += ROW_H;
        }

        const isEven = i % 2 === 0;
        const stageLabel = getCurrentStageLabel(record);
        const statusRgb = getStatusColor(record);
        const doneCount = record.stages.filter(s => s.status === 'done').length;
        const progress = Math.round((doneCount / STAGES.length) * 100);

        // Row bg
        doc.setFillColor(isEven ? 15 : 17, isEven ? 24 : 29, isEven ? 44 : 53);
        doc.rect(ML, y, CW, ROW_H, 'F');

        // Status left bar
        doc.setFillColor(statusRgb[0], statusRgb[1], statusRgb[2]);
        doc.rect(ML, y, 1.2, ROW_H, 'F');

        xc = ML + 2;

        // SEQ
        doc.setTextColor(80, 100, 140);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(String(i + 1).padStart(2, '0'), xc, y + 5.5);
        xc += COL.seq;

        // NS
        doc.setTextColor(232, 237, 247);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(record.ns, xc, y + 5.5);
        xc += COL.ns;

        // Cliente
        doc.setTextColor(141, 160, 200);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        const clientTrunc = doc.splitTextToSize(record.clientName, COL.client - 4)[0];
        doc.text(clientTrunc, xc, y + 5.5);
        xc += COL.client;

        // Situação — badge colorido
        const badgeW = Math.min(stageLabel.length * 1.9 + 6, COL.stage - 2);
        doc.setFillColor(statusRgb[0], statusRgb[1], statusRgb[2]);
        doc.roundedRect(xc, y + 2, badgeW, 4, 0.8, 0.8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(stageLabel, xc + badgeW / 2, y + 5.2, { align: 'center' });
        xc += COL.stage;

        // Progress %
        doc.setTextColor(statusRgb[0], statusRgb[1], statusRgb[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`${progress}%`, xc + COL.progress - 2, y + 5.5, { align: 'right' });

        y += ROW_H;

        // Sub-linhas de localização/obs das etapas com esse campo
        const locStages = record.stages.filter(s =>
          STAGES_WITH_LOCATION.has(s.stageId as StageId) && (s.location || s.notes)
        );

        if (locStages.length > 0) {
          locStages.forEach(s => {
            if (y > 272) { doc.addPage(); y = 14; }
            const sInfo = STAGES.find(st => st.id === s.stageId);

            doc.setFillColor(12, 20, 38);
            doc.rect(ML, y, CW, 6, 'F');

            // Etiqueta etapa
            doc.setTextColor(80, 100, 140);
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'bold');
            doc.text(`  ${sInfo?.label ?? s.stageId}`, ML + 4, y + 4);

            // Localização
            if (s.location) {
              doc.setFillColor(255, 107, 53);
              doc.roundedRect(ML + 34, y + 1.2, 3, 3, 0.5, 0.5, 'F');
              doc.setTextColor(255, 140, 66);
              doc.setFontSize(5.5);
              doc.setFont('helvetica', 'bold');
              doc.text('LOC:', ML + 39, y + 4);
              doc.setTextColor(232, 237, 247);
              doc.setFont('helvetica', 'normal');
              const locText = doc.splitTextToSize(s.location, 55)[0];
              doc.text(locText, ML + 50, y + 4);
            }

            // Observação
            if (s.notes) {
              const obsX = s.location ? ML + 108 : ML + 39;
              doc.setTextColor(141, 160, 200);
              doc.setFontSize(5.5);
              doc.setFont('helvetica', 'bold');
              doc.text('OBS:', obsX, y + 4);
              doc.setFont('helvetica', 'normal');
              const obsText = doc.splitTextToSize(s.notes, s.location ? 60 : 115)[0];
              doc.text(obsText, obsX + 10, y + 4);
            }

            y += 6;
          });

          // Separador
          doc.setDrawColor(20, 34, 65);
          doc.setLineWidth(0.3);
          doc.line(ML, y, W - MR, y);
          y += 1;
        }
      });

      // ── FOOTER ────────────────────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(10, 20, 50);
        doc.rect(0, 285, W, 12, 'F');
        doc.setFillColor(76, 110, 245);
        doc.rect(0, 285, W, 0.4, 'F');
        doc.setTextColor(80, 100, 140);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Joinville Implementos — Sistema Gerencial de Processos', ML + 4, 290);
        doc.text(`Página ${p} de ${totalPages}`, W - MR, 290, { align: 'right' });
      }

      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      doc.save(`Controle_Producao_${date}.pdf`);
    } catch (e) {
      console.error('Erro ao exportar PDF:', e);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Compat com ReportsPage
  const exportSingle = useCallback(async (_record: NSRecord, _ref?: unknown) => {}, []);
  const exportSingleDirect = useCallback(async (record: NSRecord) => {
    await exportMultiple([record]);
  }, [exportMultiple]);

  return { exportSingle, exportMultiple, exportSingleDirect, isExporting };
}
