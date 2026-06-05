import { StageItem } from './StageItem';
import type { NSRecord } from '../../store/types';

interface StageListProps {
  record: NSRecord;
}

export function StageList({ record }: StageListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <h2 style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(141,160,200,0.4)', marginBottom: '8px' }}>
        ETAPAS DE PRODUÇÃO
      </h2>
      {record.stages.map((stage, i) => (
        <StageItem
          key={stage.stageId}
          entry={stage}
          recordId={record.id}
          index={i}
        />
      ))}
    </div>
  );
}
