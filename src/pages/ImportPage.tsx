import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ArrowLeft, Calendar } from 'lucide-react';
import { useExcelImport } from '../hooks/useExcelImport';
import { useAppStore } from '../store/useAppStore';
import { FileDropzone } from '../components/import/FileDropzone';
import { ColumnMapper } from '../components/import/ColumnMapper';
import { ImportPreview } from '../components/import/ImportPreview';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';

export function ImportPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { parseFile, parseResult, selectedSheet, selectSheet, isLoading, error, buildRecords } = useExcelImport();
  const importRecords = useAppStore((s) => s.importRecords);
  const existingRecords = useAppStore((s) => s.records);
  const conferences = useAppStore((s) => s.conferences);
  const createConference = useAppStore((s) => s.createConference);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [nsColumn, setNsColumn] = useState('');
  const [clientColumn, setClientColumn] = useState('');
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [mergeModal, setMergeModal] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<ReturnType<typeof buildRecords>>([]);

  // Conference selection
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>('');
  const [newConfName, setNewConfName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  // Auto-suggest name from current month/year
  const defaultName = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  useEffect(() => {
    if (parseResult) {
      setSelectedRowIndices(new Set(parseResult.rows.map((_, i) => i)));
      setNsColumn(parseResult.autoNsCol || parseResult.columns[0] || '');
      setClientColumn(parseResult.autoClientCol || parseResult.columns[1] || parseResult.columns[0] || '');
    }
  }, [parseResult]);

  const handleConferenceNext = async () => {
    if (creatingNew) {
      const name = newConfName.trim() || defaultName;
      const existing = conferences.find(c => c.name.trim().toLowerCase() === name.toLowerCase());
      if (existing) {
        setSelectedConferenceId(existing.id);
      } else {
        const conf = await createConference(name);
        setSelectedConferenceId(conf.id);
      }
    } else if (!selectedConferenceId) {
      showToast('Selecione ou crie uma conferência.', 'error');
      return;
    }
    setStep(1);
  };

  const handleFile = async (f: File) => {
    setFile(f);
    await parseFile(f);
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2 && (!nsColumn || !clientColumn)) {
      showToast('Selecione as colunas de NS e Cliente.', 'error');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleConfirm = () => {
    if (!parseResult) return;
    const selectedRows = parseResult.rows.filter((_, i) => selectedRowIndices.has(i));
    const confId = selectedConferenceId;
    const built = buildRecords(nsColumn, clientColumn, selectedRows, parseResult.stageColMap, confId);

    const existingNs = new Set(existingRecords.filter(r => r.conferenceId === confId).map((r) => r.ns));
    const hasDuplicates = built.some((r) => existingNs.has(r.ns));

    if (hasDuplicates) {
      setPendingRecords(built);
      setMergeModal(true);
    } else {
      importRecords(built, 'keep');
      showToast(`${built.length} NS importados com sucesso!`, 'success');
      navigate('/');
    }
  };

  const handleMerge = (strategy: 'keep' | 'replace' | 'replace_all') => {
    importRecords(pendingRecords, strategy);
    showToast(`${pendingRecords.length} NS importados com sucesso!`, 'success');
    setMergeModal(false);
    navigate('/');
  };

  const toggleRow = (i: number) => {
    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleAll = (all: boolean) => {
    if (!parseResult) return;
    if (all) setSelectedRowIndices(new Set(parseResult.rows.map((_, i) => i)));
    else setSelectedRowIndices(new Set());
  };

  const stepConfig = [
    { label: 'CONFERÊNCIA', num: '01' },
    { label: 'ARQUIVO',     num: '02' },
    { label: 'COLUNAS',     num: '03' },
    { label: 'REVISÃO',     num: '04' },
    { label: 'CONFIRMAR',   num: '05' },
  ];

  const selectedConf = conferences.find(c => c.id === selectedConferenceId);

  return (
    <div className="import-wrapper animate-fade-in">

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {stepConfig.map(({ label, num }, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: i < step ? 'rgba(16,185,129,0.12)' : i === step ? 'rgba(76,110,245,0.16)' : 'rgba(13,21,38,0.8)',
                border: `1px solid ${i < step ? 'rgba(16,185,129,0.3)' : i === step ? 'rgba(76,110,245,0.38)' : 'rgba(76,110,245,0.09)'}`,
                boxShadow: i === step ? '0 0 16px rgba(76,110,245,0.15)' : 'none',
                transition: 'all 0.25s ease',
              }}>
                {i < step
                  ? <CheckCircle2 size={14} color="#10b981" />
                  : <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: i === step ? '#748ffc' : 'rgba(141,160,200,0.25)' }}>{num}</span>
                }
              </div>
              <div className="import-step-label sm-show" style={{ display: 'none' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: i < step ? '#10b981' : i === step ? '#748ffc' : 'rgba(141,160,200,0.28)', transition: 'color 0.25s ease' }}>
                  {label}
                </span>
              </div>
            </div>
            {i < stepConfig.length - 1 && (
              <div style={{
                flex: 1, height: '1px', margin: '0 10px',
                background: i < step ? 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.2))' : 'rgba(76,110,245,0.09)',
                transition: 'background 0.25s ease',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="import-card" style={{
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(76,110,245,0.16)',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>

        {/* ── Step 0: Conference ── */}
        {step === 0 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(141,160,200,0.4)', marginBottom: '6px' }}>ETAPA 01</p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#f0f4ff', letterSpacing: '0.04em', marginBottom: '6px' }}>
              CONFERÊNCIA
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(141,160,200,0.45)', marginBottom: '22px' }}>
              Selecione o mês de referência desta importação.
            </p>

            {/* Toggle: new or existing */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {(['existing', 'new'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setCreatingNew(mode === 'new')}
                  style={{
                    flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700,
                    fontFamily: 'inherit', cursor: 'pointer', borderRadius: '9px',
                    letterSpacing: '0.06em',
                    background: (mode === 'new') === creatingNew ? 'rgba(76,110,245,0.16)' : 'rgba(76,110,245,0.05)',
                    border: `1px solid ${(mode === 'new') === creatingNew ? 'rgba(76,110,245,0.4)' : 'rgba(76,110,245,0.12)'}`,
                    color: (mode === 'new') === creatingNew ? '#748ffc' : 'rgba(141,160,200,0.4)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mode === 'new' ? '+ NOVA CONFERÊNCIA' : 'CONFERÊNCIA EXISTENTE'}
                </button>
              ))}
            </div>

            {creatingNew ? (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(141,160,200,0.55)', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  NOME DA CONFERÊNCIA
                </label>
                <input
                  type="text"
                  value={newConfName}
                  onChange={e => setNewConfName(e.target.value)}
                  placeholder={defaultName}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '13px',
                    background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(76,110,245,0.22)',
                    borderRadius: '10px', color: '#c5d0e8', fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(76,110,245,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(76,110,245,0.22)')}
                />
                <p style={{ fontSize: '11px', color: 'rgba(141,160,200,0.3)', marginTop: '6px' }}>
                  Deixe em branco para usar "{defaultName}"
                </p>
              </div>
            ) : (
              <div>
                {conferences.length === 0 ? (
                  <div style={{
                    padding: '24px', textAlign: 'center', borderRadius: '10px',
                    background: 'rgba(76,110,245,0.04)', border: '1px solid rgba(76,110,245,0.1)',
                    color: 'rgba(141,160,200,0.35)', fontSize: '12px',
                  }}>
                    Nenhuma conferência encontrada.{' '}
                    <button onClick={() => setCreatingNew(true)} style={{ background: 'none', border: 'none', color: '#748ffc', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', padding: 0 }}>
                      Criar nova
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {conferences.map(conf => {
                      const isSelected = selectedConferenceId === conf.id;
                      const count = existingRecords.filter(r => r.conferenceId === conf.id).length;
                      return (
                        <button
                          key={conf.id}
                          onClick={() => setSelectedConferenceId(conf.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '11px 14px', borderRadius: '10px', textAlign: 'left',
                            fontFamily: 'inherit', cursor: 'pointer',
                            background: isSelected ? 'rgba(76,110,245,0.12)' : 'rgba(76,110,245,0.04)',
                            border: `1px solid ${isSelected ? 'rgba(76,110,245,0.4)' : 'rgba(76,110,245,0.1)'}`,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Calendar size={14} color={isSelected ? '#748ffc' : 'rgba(116,143,252,0.4)'} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#e8edf7' : 'rgba(197,208,232,0.7)' }}>
                              {conf.name}
                            </p>
                            <p style={{ fontSize: '10px', color: 'rgba(141,160,200,0.35)', marginTop: '1px' }}>
                              {count} NS registrados
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={14} color="#10b981" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleConferenceNext}>
                Próximo <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1: File ── */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(141,160,200,0.4)', marginBottom: '6px' }}>ETAPA 02</p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#f0f4ff', letterSpacing: '0.04em', marginBottom: '4px' }}>
              SELECIONAR ARQUIVO
            </h2>
            {selectedConf && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.2)' }}>
                <Calendar size={11} color="#748ffc" />
                <span style={{ fontSize: '11px', color: '#748ffc', fontWeight: 600 }}>{selectedConf.name}</span>
              </div>
            )}
            <FileDropzone onFile={handleFile} selectedFile={file} onClear={() => { setFile(null); setStep(1); }} />
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                <Spinner size={20} />
                <p style={{ fontSize: '13px', color: 'rgba(141,160,200,0.6)' }}>Processando arquivo...</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Columns ── */}
        {!isLoading && step === 2 && parseResult && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(141,160,200,0.4)', marginBottom: '6px' }}>ETAPA 03</p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#f0f4ff', letterSpacing: '0.04em', marginBottom: '20px' }}>
              MAPEAR COLUNAS
            </h2>
            <ColumnMapper
              sheetNames={parseResult.sheetNames}
              selectedSheet={selectedSheet}
              onSheetChange={selectSheet}
              columns={parseResult.columns}
              nsColumn={nsColumn}
              onNsColumnChange={setNsColumn}
              clientColumn={clientColumn}
              onClientColumnChange={setClientColumn}
              stageColMap={parseResult.stageColMap}
            />
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(76,110,245,0.08)', border: '1px solid rgba(76,110,245,0.18)', fontSize: '12px', color: '#748ffc' }}>
              <strong>{parseResult.rows.length}</strong> linhas detectadas na planilha.
            </div>
            <details style={{ marginTop: '12px' }}>
              <summary style={{ fontSize: '11px', color: 'rgba(141,160,200,0.4)', cursor: 'pointer', userSelect: 'none' }}>
                Ver colunas encontradas no arquivo ({parseResult.columns.length})
              </summary>
              <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(76,110,245,0.1)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parseResult.columns.map(col => (
                  <span key={col} style={{ fontSize: '10px', fontFamily: "'Geist Mono', monospace", color: '#c5d0e8', background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.2)', borderRadius: '4px', padding: '2px 7px' }}>{col}</span>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* ── Step 3: Preview ── */}
        {!isLoading && step === 3 && parseResult && (
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(141,160,200,0.4)', marginBottom: '6px' }}>ETAPA 04</p>
            <h2 className="font-display" style={{ fontSize: '24px', color: '#f0f4ff', letterSpacing: '0.04em', marginBottom: '4px' }}>
              REVISAR DADOS
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(141,160,200,0.5)', marginBottom: '16px' }}>
              Desmarque as linhas que não deseja importar.
            </p>
            <ImportPreview
              rows={parseResult.rows}
              nsColumn={nsColumn}
              clientColumn={clientColumn}
              selectedRowIndices={selectedRowIndices}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
            />
            <p style={{ fontSize: '11px', color: 'rgba(141,160,200,0.45)', marginTop: '10px', fontFamily: "'Geist Mono', monospace" }}>
              <strong style={{ color: '#748ffc' }}>{selectedRowIndices.size}</strong> de {parseResult.rows.length} linhas selecionadas.
            </p>
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {!isLoading && step === 4 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 20px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={28} color="#10b981" />
            </div>
            <h2 className="font-display" style={{ fontSize: '28px', color: '#f0f4ff', letterSpacing: '0.06em', marginBottom: '8px' }}>
              PRONTO PARA IMPORTAR
            </h2>
            {selectedConf && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: '4px 12px', borderRadius: '6px', background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.2)' }}>
                <Calendar size={11} color="#748ffc" />
                <span style={{ fontSize: '11px', color: '#748ffc', fontWeight: 600 }}>{selectedConf.name}</span>
              </div>
            )}
            <p style={{ fontSize: '13px', color: 'rgba(141,160,200,0.5)', marginBottom: '28px' }}>
              <strong style={{ color: '#748ffc', fontFamily: "'Geist Mono', monospace" }}>{selectedRowIndices.size}</strong> NS serão importados ao sistema.
            </p>
            <Button variant="accent" size="lg" onClick={handleConfirm}>
              Confirmar Importação
            </Button>
          </div>
        )}

        {/* Navigation */}
        {!isLoading && step > 0 && step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(76,110,245,0.1)' }}>
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={14} /> Voltar
            </Button>
            {step !== 1 && (
              <Button variant="primary" onClick={handleNext}>
                Próximo <ChevronRight size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Merge modal */}
      <Modal isOpen={mergeModal} onClose={() => setMergeModal(false)} title="Registros Duplicados">
        <p style={{ fontSize: '12px', color: 'rgba(141,160,200,0.55)', marginBottom: '18px', lineHeight: 1.65 }}>
          Alguns NS já existem nesta conferência. Escolha como tratar os duplicados:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { fn: () => handleMerge('keep'), title: 'Manter progresso', desc: 'Atualiza o nome do cliente, preserva o progresso das etapas.', dotColor: '#748ffc', border: 'rgba(76,110,245,0.25)', bg: 'rgba(76,110,245,0.07)', hoverBorder: 'rgba(76,110,245,0.4)', hoverBg: 'rgba(76,110,245,0.12)' },
            { fn: () => handleMerge('replace'), title: 'Substituir duplicados', desc: 'Reinicia as etapas dos NS duplicados. NS únicos não são afetados.', dotColor: '#ff8c42', border: 'rgba(255,107,53,0.2)', bg: 'rgba(255,107,53,0.04)', hoverBorder: 'rgba(255,107,53,0.4)', hoverBg: 'rgba(255,107,53,0.08)' },
            { fn: () => handleMerge('replace_all'), title: 'Substituir tudo', desc: 'Apaga todos os registros existentes e importa apenas os novos.', dotColor: '#ef4444', border: 'rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.04)', hoverBorder: 'rgba(239,68,68,0.4)', hoverBg: 'rgba(239,68,68,0.08)' },
          ].map(({ fn, title, desc, dotColor, border, bg, hoverBorder, hoverBg }) => (
            <button key={title} onClick={fn} style={{ width: '100%', textAlign: 'left', padding: '13px 14px', borderRadius: '11px', background: bg, border: `1px solid ${border}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = hoverBg; el.style.borderColor = hoverBorder; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = bg; el.style.borderColor = border; }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 8px ${dotColor}66` }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '12px', color: '#e8edf7', marginBottom: '3px' }}>{title}</p>
                <p style={{ fontSize: '11px', color: 'rgba(141,160,200,0.45)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
