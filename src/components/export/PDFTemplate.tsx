import React from 'react';
import type { NSRecord, StageStatus } from '../../store/types';
import { STAGES } from '../../utils/stages';

const statusLabel: Record<StageStatus, string> = {
  pending: 'Aguardando',
  in_progress: 'Em Progresso',
  done: 'Concluído',
  n_a: 'Não aplica',
};

const statusColor: Record<StageStatus, string> = {
  pending: '#94a3b8',
  in_progress: '#f97316',
  done: '#16a34a',
  n_a: '#4da6cc',
};

const statusBg: Record<StageStatus, string> = {
  pending: '#f8fafc',
  in_progress: '#fff7ed',
  done: '#f0fdf4',
  n_a: '#f0f9ff',
};

function fmt(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PDFTemplate = React.forwardRef<HTMLDivElement, { record: NSRecord }>(
  ({ record }, ref) => {
    const done = record.stages.filter((s) => s.status === 'done').length;
    const progress = Math.round((done / STAGES.length) * 100);
    const importedDate = new Date(record.importedAt).toLocaleDateString('pt-BR');

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#1e293b',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#1e3a5f',
            color: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#93c5fd', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Gerencial de Processos
              </p>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                NS: {record.ns}
              </h1>
              <p style={{ fontSize: '14px', color: '#bfdbfe', marginTop: '4px', margin: 0 }}>
                {record.clientName}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: '6px solid #f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                  {progress}%
                </span>
              </div>
              <p style={{ color: '#93c5fd', fontSize: '10px', marginTop: '4px' }}>
                {done}/{STAGES.length} etapas
              </p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '24px', fontSize: '11px', color: '#93c5fd' }}>
            <span>Importado: {importedDate}</span>
            <span>Gerado em: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Stages table */}
        <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Etapas de Produção
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', width: '30px' }}>#</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Etapa</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', width: '120px' }}>Status</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', width: '140px' }}>Iniciado</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0', width: '140px' }}>Concluído</th>
            </tr>
          </thead>
          <tbody>
            {record.stages.map((stage, i) => {
              const stageInfo = STAGES.find((s) => s.id === stage.stageId);
              return (
                <tr
                  key={stage.stageId}
                  style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                >
                  <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '11px' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>
                    {stageInfo?.label ?? stage.stageId}
                    {stage.notes && (
                      <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontWeight: 'normal' }}>
                        Obs: {stage.notes}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: statusColor[stage.status],
                      backgroundColor: statusBg[stage.status],
                      border: `1px solid ${statusColor[stage.status]}40`,
                    }}>
                      {statusLabel[stage.status]}
                    </span>
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                    {fmt(stage.startedAt)}
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                    {fmt(stage.completedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* General notes */}
        {record.generalNotes && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Observações Gerais
            </h3>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {record.generalNotes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
          <span>Joinville Implementos - Sistema Gerencial</span>
          <span>Gerado em {new Date().toLocaleString('pt-BR')}</span>
        </div>
      </div>
    );
  }
);

PDFTemplate.displayName = 'PDFTemplate';
