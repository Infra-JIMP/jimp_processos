import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }: SearchInputProps) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Search size={13} style={{
        position: 'absolute', left: '10px', top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(116,143,252,0.6)', pointerEvents: 'none',
      }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          paddingLeft: '30px', paddingRight: '12px',
          paddingTop: '7px', paddingBottom: '7px',
          fontSize: '12px',
          background: 'rgba(13,21,38,0.8)',
          border: '1px solid rgba(76,110,245,0.18)',
          borderRadius: '10px',
          color: '#c5d0e8',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(76,110,245,0.5)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(76,110,245,0.18)')}
      />
    </div>
  );
}
