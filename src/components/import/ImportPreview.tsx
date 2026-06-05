import React from 'react';

interface ImportPreviewProps {
  rows: Record<string, string>[];
  nsColumn: string;
  clientColumn: string;
  selectedRowIndices: Set<number>;
  onToggleRow: (index: number) => void;
  onToggleAll: (all: boolean) => void;
}

export function ImportPreview({
  rows,
  nsColumn,
  clientColumn,
  selectedRowIndices,
  onToggleRow,
  onToggleAll,
}: ImportPreviewProps) {
  const allSelected = selectedRowIndices.size === rows.length;

  const thStyle: React.CSSProperties = {
    padding: '8px 12px', textAlign: 'left',
    fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em',
    color: 'rgba(141,160,200,0.5)',
  };

  return (
    <div style={{
      overflow: 'auto', borderRadius: '12px',
      border: '1px solid rgba(76,110,245,0.14)',
      maxHeight: '320px',
      background: '#133a5e',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#133a5e', zIndex: 1 }}>
          <tr style={{ borderBottom: '1px solid rgba(76,110,245,0.14)' }}>
            <th style={{ ...thStyle, width: '40px' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                style={{ accentColor: '#4c6ef5', cursor: 'pointer' }}
              />
            </th>
            <th style={thStyle}>#</th>
            <th style={thStyle}>NS</th>
            <th style={thStyle}>CLIENTE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isSelected = selectedRowIndices.has(i);
            return (
              <tr
                key={i}
                onClick={() => onToggleRow(i)}
                style={{
                  borderBottom: '1px solid rgba(76,110,245,0.07)',
                  background: isSelected ? 'rgba(76,110,245,0.06)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
              >
                <td style={{ padding: '8px 12px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleRow(i)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: '#4c6ef5', cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(141,160,200,0.35)', fontFamily: "'Geist Mono', monospace", fontSize: '10px' }}>
                  {i + 1}
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#e8edf7', fontFamily: "'Geist Mono', monospace" }}>
                  {row[nsColumn] ?? '-'}
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(141,160,200,0.7)' }}>
                  {row[clientColumn] ?? '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
