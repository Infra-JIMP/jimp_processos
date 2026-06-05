import React, { useState, useEffect, useRef } from 'react';
import { FileText, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { NSRecord } from '../../store/types';

interface NotesSectionProps {
  record: NSRecord;
}

export function NotesSection({ record }: NotesSectionProps) {
  const [value, setValue] = useState(record.generalNotes ?? '');
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState(false);
  const updateGeneralNotes = useAppStore(s => s.updateGeneralNotes);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(record.generalNotes ?? '');
  }, [record.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    setSaved(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateGeneralNotes(record.id, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #162035 0%, #111928 100%)',
      border: `1px solid ${focused ? 'rgba(76,110,245,0.28)' : 'rgba(76,110,245,0.1)'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      marginTop: '12px',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px',
        borderBottom: '1px solid rgba(76,110,245,0.07)',
        background: 'rgba(76,110,245,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <FileText size={12} color="rgba(76,110,245,0.55)" />
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(141,160,200,0.38)' }}>
            OBSERVAÇÕES GERAIS
          </span>
        </div>
        {saved && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
            <Check size={10} /> Salvo
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Adicionar observações gerais sobre este NS..."
        rows={4}
        style={{
          width: '100%', fontSize: '12px', lineHeight: 1.7,
          background: 'transparent',
          border: 'none',
          padding: '14px 16px',
          color: '#c5d0e8', fontFamily: 'inherit',
          resize: 'none', outline: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}
