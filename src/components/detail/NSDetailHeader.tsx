import { ArrowLeft, Calendar, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../ui/ProgressRing';
import { STAGES } from '../../utils/stages';
import type { NSRecord } from '../../store/types';

interface NSDetailHeaderProps {
  record: NSRecord;
}

export function NSDetailHeader({ record }: NSDetailHeaderProps) {
  const navigate = useNavigate();
  const done = record.stages.filter((s) => s.status === 'done').length;
  const inProgress = record.stages.filter((s) => s.status === 'in_progress').length;
  const progress = (done / STAGES.length) * 100;

  const importedDate = new Date(record.importedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const isComplete = done === STAGES.length;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(76,110,245,0.18)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}
      className="animate-slide-up"
    >
      {/* BG decoration */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: isComplete ? '#10b981' : '#4c6ef5',
        opacity: 0.04, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', borderRadius: '8px',
          background: 'rgba(76,110,245,0.08)',
          border: '1px solid rgba(76,110,245,0.18)',
          color: '#748ffc', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', marginBottom: '18px', fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.08)')}
      >
        <ArrowLeft size={13} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Hash size={11} color="#4c6ef5" />
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(76,110,245,0.7)' }}>
              NÚMERO DE SÉRIE
            </span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(26px, 6vw, 40px)', color: '#f0f4ff', lineHeight: 1, letterSpacing: '0.04em', marginBottom: '6px' }}
          >
            {record.ns}
          </h1>
          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#8da0c8', fontWeight: 500, marginBottom: '14px', wordBreak: 'break-word' }}>
            {record.clientName}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={11} color="rgba(141,160,200,0.35)" />
            <span style={{ fontSize: '11px', color: 'rgba(141,160,200,0.4)', fontFamily: "'Geist Mono', monospace" }}>
              {importedDate}
            </span>
          </div>

          {/* Stage pills */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#34d399',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              {done} concluídas
            </div>
            {inProgress > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)',
                color: '#ffa552',
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff6b35', flexShrink: 0 }} />
                {inProgress} em andamento
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              background: 'rgba(76,110,245,0.07)', border: '1px solid rgba(76,110,245,0.14)',
              color: 'rgba(116,143,252,0.75)',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(76,110,245,0.5)', flexShrink: 0 }} />
              {STAGES.length - done - inProgress} aguardando
            </div>
          </div>
        </div>

        {/* Progress ring — stacks below text on very small screens */}
        <div style={{ textAlign: 'center', flexShrink: 0, alignSelf: 'center' }}>
          <ProgressRing percentage={progress} size={96} strokeWidth={7} />
          <p style={{
            fontSize: '10px', color: 'rgba(141,160,200,0.35)', marginTop: '6px',
            fontFamily: "'Geist Mono', monospace", letterSpacing: '0.04em',
          }}>
            {done} / {STAGES.length}
          </p>
        </div>
      </div>
    </div>
  );
}
