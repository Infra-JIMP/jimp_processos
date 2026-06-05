import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileDropzone({ onFile, selectedFile, onClear }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const isValidFile = (file: File) =>
    /\.(xlsx|xls|csv)$/i.test(file.name);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) onFile(file);
  }, [onFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  if (selectedFile) {
    return (
      <div style={{
        border: '1px solid rgba(16,185,129,0.3)',
        background: 'rgba(16,185,129,0.06)',
        borderRadius: '14px', padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 14px',
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileSpreadsheet size={24} color="#34d399" />
        </div>
        <p style={{ fontWeight: 700, color: '#34d399', fontSize: '14px' }}>{selectedFile.name}</p>
        <p style={{ fontSize: '11px', color: 'rgba(52,211,153,0.6)', marginTop: '4px' }}>
          {(selectedFile.size / 1024).toFixed(1)} KB · Pronto para processar
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          <CheckCircle2 size={12} color="#10b981" />
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Arquivo válido</span>
        </div>
        <button
          onClick={onClear}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            marginTop: '14px', fontSize: '11px', color: 'rgba(239,68,68,0.7)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '6px', fontFamily: 'inherit',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
        >
          <X size={12} /> Remover arquivo
        </button>
      </div>
    );
  }

  return (
    <label
      style={{
        display: 'block',
        border: `1px dashed ${isDragging ? '#4c6ef5' : 'rgba(76,110,245,0.22)'}`,
        background: isDragging ? 'rgba(76,110,245,0.08)' : 'rgba(13,21,38,0.5)',
        borderRadius: '14px', padding: '48px 24px',
        textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileInput} style={{ display: 'none' }} />
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 16px',
        background: isDragging ? 'rgba(76,110,245,0.2)' : 'rgba(76,110,245,0.08)',
        border: `1px solid ${isDragging ? 'rgba(76,110,245,0.4)' : 'rgba(76,110,245,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        <Upload size={22} color={isDragging ? '#748ffc' : '#4c6ef5'} />
      </div>
      <p style={{ fontWeight: 700, color: '#c5d0e8', fontSize: '14px', marginBottom: '6px' }}>
        Arraste seu arquivo aqui
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(141,160,200,0.5)' }}>
        ou clique para selecionar · .xlsx, .xls, .csv
      </p>
    </label>
  );
}
