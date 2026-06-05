import { useRef } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { PDFTemplate } from './PDFTemplate';
import { usePDFExport } from '../../hooks/usePDFExport';
import type { NSRecord } from '../../store/types';

interface PDFExportButtonProps {
  record: NSRecord;
}

export function PDFExportButton({ record }: PDFExportButtonProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const { exportSingle, isExporting } = usePDFExport();

  return (
    <>
      <PDFTemplate record={record} ref={templateRef} />
      <Button
        variant="accent"
        loading={isExporting}
        onClick={() => exportSingle(record, templateRef)}
      >
        <FileDown size={16} />
        Exportar PDF
      </Button>
    </>
  );
}
