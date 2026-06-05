import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, MessageSquare, Image, CheckCircle2, Clock, Zap } from 'lucide-react';
import { STAGES } from '../../utils/stages';
import type { NSRecord } from '../../store/types';

interface RecordPreviewProps {
  record: NSRecord | null;
  visible: boolean;
}

const W = 228;
const H_MAX = 340;
const GAP = 20;

export function RecordPreview({ record, visible }: RecordPreviewProps) {
  const [pos, setPos] = useState({ top: -999, left: -999 });
  const [mounted, setMounted] = useState(false);

  // Delay mount slightly so first position is set before fade-in plays
  useEffect(() => {
    if (visible) {
      setMounted(false);
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [visible, record]);

  useEffect(() => {
    if (!visible) return;

    const handleMove = (e: MouseEvent) => {
      // Durante drag (botão pressionado sem mousemove normal) não atualiza
      if (e.buttons !== 0) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = e.clientX + GAP;
      if (left + W > vw - 8) left = e.clientX - W - GAP;
      if (left < 8) left = 8;

      let top = e.clientY - H_MAX / 2;
      if (top + H_MAX > vh - 8) top = vh - H_MAX - 8;
      if (top < 8) top = 8;

      setPos({ top, left });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [visible]);

  if (!visible || !record) return null;

  const done = record.stages.filter(s => s.status === 'done').length;
  const inProgress = record.stages.filter(s => s.status === 'in_progress').length;
  const pending = STAGES.length - done - inProgress;
  const progress = Math.round((done / STAGES.length) * 100);

  const isComplete = done === STAGES.length;
  const isActive = inProgress > 0;
  const accent = isComplete ? '#10b981' : isActive ? '#ff6b35' : '#748ffc';
  const accentRgb = isComplete ? '16,185,129' : isActive ? '255,107,53' : '116,143,252';

  const firstPhoto = (() => {
    for (const s of record.stages) {
      if (s.locationPhotos?.[0]) return s.locationPhotos[0];
      if (s.notesPhotos?.[0]) return s.notesPhotos[0];
    }
    return null;
  })();
  const totalPhotos = record.stages.reduce(
    (n, s) => n + (s.locationPhotos?.length ?? 0) + (s.notesPhotos?.length ?? 0), 0
  );

  const activeIdx = record.stages.findIndex(s => s.status !== 'done');
  const activeEntry = activeIdx >= 0 ? record.stages[activeIdx] : null;
  const activeStageInfo = activeEntry ? STAGES.find(s => s.id === activeEntry.stageId) : null;

  const stagesWithData = record.stages.filter(
    s => s.location || s.notes
  );

  return createPortal(
    <>
      <style>{`
        @keyframes rpIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: W,
          maxHeight: H_MAX,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'rpIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
        }}
      >
        {/* Glow behind card */}
        <div style={{
          position: 'absolute', inset: '-12px',
          background: `radial-gradient(ellipse at 50% 40%, rgba(${accentRgb},0.12) 0%, transparent 70%)`,
          borderRadius: '24px',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          background: 'linear-gradient(165deg, #1c2840 0%, #111e2e 100%)',
          border: `1px solid rgba(${accentRgb},0.22)`,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(${accentRgb},0.06)`,
        }}>

          {/* Top color bar */}
          <div style={{
            height: '3px',
            background: `linear-gradient(90deg, ${accent} 0%, rgba(${accentRgb},0.2) 60%, transparent 100%)`,
          }} />

          {/* Photo banner — full bleed with identity overlaid */}
          {firstPhoto ? (
            <div style={{ position: 'relative', height: '100px', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={firstPhoto}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
              {/* Strong scrim so text is always legible */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(5,10,22,0.15) 0%, rgba(5,10,22,0.55) 45%, rgba(5,10,22,0.97) 100%)',
              }} />
              {/* Photo count badge */}
              {totalPhotos > 0 && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  display: 'flex', alignItems: 'center', gap: '3px',
                  fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                  borderRadius: '20px', padding: '2px 7px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <Image size={8} />
                  {totalPhotos}
                </div>
              )}
              {/* Identity overlaid on photo bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 13px 9px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <p style={{
                    fontSize: '16px', fontWeight: 700, color: '#ffffff',
                    fontFamily: "'Geist Mono', monospace", letterSpacing: '0.02em', lineHeight: 1,
                    textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                  }}>
                    {record.ns}
                  </p>
                  <div style={{
                    flexShrink: 0,
                    padding: '2px 7px', borderRadius: '20px', fontSize: '8px', fontWeight: 700,
                    background: `rgba(${accentRgb},0.25)`, backdropFilter: 'blur(4px)',
                    border: `1px solid rgba(${accentRgb},0.4)`,
                    color: accent, letterSpacing: '0.08em',
                  }}>
                    {isComplete ? 'DONE' : isActive ? 'ATIVO' : 'FILA'}
                  </div>
                </div>
                <p style={{
                  fontSize: '10px', color: 'rgba(200,215,240,0.75)', marginTop: '3px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  {record.clientName}
                </p>
              </div>
            </div>
          ) : (
            /* Identity without photo */
            <div style={{ padding: '12px 13px 9px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                <p style={{
                  fontSize: '16px', fontWeight: 700, color: '#f0f4ff',
                  fontFamily: "'Geist Mono', monospace", letterSpacing: '0.02em', lineHeight: 1,
                }}>
                  {record.ns}
                </p>
                <div style={{
                  flexShrink: 0, marginTop: '1px',
                  padding: '2px 7px', borderRadius: '20px', fontSize: '8px', fontWeight: 700,
                  background: `rgba(${accentRgb},0.12)`,
                  border: `1px solid rgba(${accentRgb},0.28)`,
                  color: accent, letterSpacing: '0.08em',
                }}>
                  {isComplete ? 'DONE' : isActive ? 'ATIVO' : 'FILA'}
                </div>
              </div>
              <p style={{
                fontSize: '11px', color: 'rgba(141,160,200,0.6)', marginTop: '4px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontWeight: 400,
              }}>
                {record.clientName}
              </p>
            </div>
          )}

          {/* Progress */}
          <div style={{ padding: '9px 13px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              {/* Stage counters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={9} color="#10b981" />
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{done}</span>
                </div>
                {inProgress > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Zap size={9} color="#ff6b35" />
                    <span style={{ fontSize: '10px', color: '#ff6b35', fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{inProgress}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={9} color="rgba(116,143,252,0.4)" />
                  <span style={{ fontSize: '10px', color: 'rgba(116,143,252,0.4)', fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{pending}</span>
                </div>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 800, letterSpacing: '0.02em',
                fontFamily: "'Geist Mono', monospace", color: accent,
              }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: '3px', background: 'rgba(76,110,245,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px', width: `${progress}%`,
                background: isComplete
                  ? 'linear-gradient(90deg,#10b981,#34d399)'
                  : isActive
                  ? 'linear-gradient(90deg,#ff6b35,#ffa552)'
                  : 'linear-gradient(90deg,#4c6ef5,#748ffc)',
              }} />
            </div>
          </div>

          {/* Active stage chip */}
          {activeStageInfo && (
            <>
              <style>{`
                @keyframes rpPulse {
                  0%,100% { box-shadow: 0 0 4px rgba(255,107,53,0.6); }
                  50%      { box-shadow: 0 0 10px rgba(255,107,53,0.95); }
                }
              `}</style>
              <div style={{ padding: '0 13px 9px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '5px 10px', borderRadius: '7px',
                  background: 'rgba(255,107,53,0.07)',
                  border: '1px solid rgba(255,107,53,0.16)',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    background: '#ff6b35',
                    animation: 'rpPulse 1.6s ease-in-out infinite',
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffb380', letterSpacing: '0.01em' }}>
                    {activeStageInfo.label}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Loc/obs snapshot */}
          {stagesWithData.length > 0 && (
            <div style={{
              borderTop: '1px solid rgba(76,110,245,0.07)',
              padding: '8px 13px 10px',
              display: 'flex', flexDirection: 'column', gap: '5px',
            }}>
              {stagesWithData.slice(0, 2).map(s => (
                <div key={s.stageId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {s.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={9} color="rgba(255,140,66,0.7)" style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: '11px', color: '#ffb380', fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.location}
                      </span>
                    </div>
                  )}
                  {s.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                      <MessageSquare size={9} color="rgba(141,160,200,0.3)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{
                        fontSize: '10px', color: 'rgba(141,160,200,0.5)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                      }}>
                        {s.notes}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom shimmer line */}
          <div style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.35), transparent)`,
          }} />
        </div>
      </div>
    </>,
    document.body
  );
}

export function useRecordPreview() {
  const [previewRecord, setPreviewRecord] = useState<NSRecord | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onDragStart = () => setPreviewRecord(null);
    window.addEventListener('dragstart', onDragStart);
    return () => window.removeEventListener('dragstart', onDragStart);
  }, []);

  const showPreview = (record: NSRecord) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPreviewRecord(record);
  };

  const hidePreview = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPreviewRecord(null), 60);
  };

  return { previewRecord, showPreview, hidePreview };
}
