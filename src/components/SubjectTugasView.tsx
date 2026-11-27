import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  Plus,
  StickyNote,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { CelestialBodyId } from './SolarSystemView';
import {
  deleteTugas,
  loadTugasForBody,
  saveTugas,
  type StoredTugas,
  type TugasKind,
} from '../utils/tugasStorage';

interface SubjectTugasViewProps {
  bodyId: CelestialBodyId;
  title: string;
  onBackToSolar: () => void;
  onBackToLanding: () => void;
}

type ModalMode = 'file' | 'link';

function formatTodayDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

function detectFileKind(file: File): TugasKind {
  const lower = file.name.toLowerCase();
  if (file.type === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/.test(lower)) return 'image';
  return 'file';
}

function getKindBadge(kind: TugasKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF';
    case 'image':
      return 'GAMBAR';
    case 'file':
      return 'FILE';
    case 'link':
      return 'TAUTAN';
    case 'note':
      return 'CATATAN';
  }
}

function getKindIcon(kind: TugasKind) {
  switch (kind) {
    case 'pdf':
    case 'file':
      return FileText;
    case 'image':
      return ImageIcon;
    case 'link':
      return Link2;
    case 'note':
      return StickyNote;
  }
}

export function SubjectTugasView({
  bodyId,
  title,
  onBackToSolar,
  onBackToLanding,
}: SubjectTugasViewProps) {
  const [assignments, setAssignments] = useState<StoredTugas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  // Add Tugas modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('file');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMeta, setDraftMeta] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved assignments from IndexedDB for this planet/sun
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    loadTugasForBody(bodyId)
      .then((items) => {
        if (!active) return;
        setAssignments(items);
        setSelectedId((prev) => {
          if (prev && items.some((i) => i.id === prev)) return prev;
          return items[0]?.id ?? null;
        });
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bodyId]);

  // Manage Blob object URLs cleanly
  useEffect(() => {
    const nextUrls: Record<string, string> = {};
    for (const item of assignments) {
      if (item.fileBlob) {
        nextUrls[item.id] = URL.createObjectURL(item.fileBlob);
      }
    }
    setObjectUrls(nextUrls);

    return () => {
      for (const url of Object.values(nextUrls)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [assignments]);

  // Escape key: close modal first if open, otherwise navigate back to Solar System
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddOpen) {
          setIsAddOpen(false);
        } else {
          onBackToSolar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddOpen, onBackToSolar]);

  const selectedFile = useMemo(
    () => assignments.find((item) => item.id === selectedId) ?? assignments[0] ?? null,
    [assignments, selectedId],
  );

  const openAddModal = () => {
    setFormError(null);
    setModalMode('file');
    setDraftTitle('');
    setDraftMeta(`${formatTodayDate()} · Tugas ${title} · Kelas 9D`);
    setDraftSummary('');
    setDraftUrl('');
    setDraftFile(null);
    setIsAddOpen(true);
  };

  const handleSelectAndScroll = (id: string) => {
    setSelectedId(id);
    const viewerEl = document.getElementById('subject-viewer');
    if (viewerEl) {
      viewerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const applySelectedFile = (file: File | null) => {
    if (!file) return;
    setDraftFile(file);
    setFormError(null);
    if (!draftTitle.trim()) {
      setDraftTitle(stripExtension(file.name));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    applySelectedFile(file);
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    applySelectedFile(file);
  };

  const handleSaveTugas = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setFormError('Judul tugas wajib diisi.');
      return;
    }

    if (modalMode === 'file' && !draftFile) {
      setFormError('Pilih file PDF, gambar, atau dokumen terlebih dahulu (atau ganti ke tab Link / Catatan).');
      return;
    }

    let kind: TugasKind = 'note';
    let externalUrl: string | undefined;

    if (modalMode === 'file' && draftFile) {
      kind = detectFileKind(draftFile);
    } else if (modalMode === 'link') {
      const trimmedUrl = draftUrl.trim();
      if (trimmedUrl) {
        if (!/^https?:\/\//i.test(trimmedUrl)) {
          externalUrl = `https://${trimmedUrl}`;
        } else {
          externalUrl = trimmedUrl;
        }
        kind = 'link';
      } else {
        kind = 'note';
      }
    }

    const newTugas: StoredTugas = {
      id: `${bodyId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bodyId,
      title: trimmedTitle,
      meta: draftMeta.trim() || `${formatTodayDate()} · Tugas ${title} · Kelas 9D`,
      summary:
        draftSummary.trim() ||
        (draftFile
          ? `File tugas ${title}: ${draftFile.name}`
          : externalUrl
            ? `Tautan tugas ${title}`
            : `Catatan tugas ${title}`),
      kind,
      fileName: draftFile?.name,
      mimeType: draftFile?.type || undefined,
      fileBlob: draftFile ?? undefined,
      externalUrl,
      createdAt: Date.now(),
    };

    setIsSaving(true);
    try {
      await saveTugas(newTugas);
      setAssignments((prev) => [...prev, newTugas]);
      setSelectedId(newTugas.id);
      setIsAddOpen(false);
    } catch {
      setFormError('Gagal menyimpan tugas. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTugas = async (id: string) => {
    try {
      await deleteTugas(id);
      setAssignments((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (selectedId === id) {
          setSelectedId(next[0]?.id ?? null);
        }
        return next;
      });
    } catch {
      // Ignore delete error
    }
  };

  const activePreviewUrl = selectedFile ? objectUrls[selectedFile.id] : undefined;

  return (
    <div
      data-blank-page={bodyId}
      className="relative z-10 w-full pointer-events-none"
      role="region"
      aria-label={title}
    >
      {/* Top Bar (3-zone contract) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#03050c]/85 border-b border-white/[0.06] pointer-events-auto">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 h-[72px] flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2.5 text-slate-50 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 fill-emerald-400"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <polygon points="50,12 90,85 10,85" />
            </svg>
            <span>Ascend</span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a
              href="#subject-assignments"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              File Tugas
            </a>
            <a
              href="#subject-viewer"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Pratinjau Dokumen
            </a>
            <button
              type="button"
              onClick={onBackToSolar}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Solar System
            </button>
            <button
              type="button"
              onClick={onBackToLanding}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Main Page
            </button>
          </nav>

          <button
            type="button"
            onClick={onBackToSolar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.15] hover:border-white/30 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex flex-col items-center justify-start pt-36 md:pt-40 text-center relative"
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <h1
            className="text-4xl sm:text-6xl md:text-[4.6rem] font-extrabold leading-[1.06] tracking-[-0.035em] mb-6 max-w-4xl mx-auto"
            style={{ textWrap: 'balance' }}
          >
            <span className="bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-100/75 max-w-[600px] mx-auto mb-10 leading-relaxed">
            File Tugas · Riffat Zaki Arrabani · Kelas 9D
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={onBackToSolar}
              className="pointer-events-auto w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_28px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Solar System</span>
            </button>

            <a
              href="#subject-assignments"
              className="pointer-events-auto w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/75 border border-white/15 text-white font-semibold text-sm hover:bg-slate-800/85 hover:border-white/30 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat File Tugas</span>
            </a>

            <button
              type="button"
              onClick={openAddModal}
              aria-label={`Tambah Tugas ${title}`}
              className="pointer-events-auto w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500/15 border border-emerald-400/45 text-emerald-200 font-semibold text-sm hover:bg-emerald-500/25 hover:border-emerald-300 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        <div className="h-[36vh] w-full" aria-hidden="true" />
      </section>

      {/* Spacer Strip */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <p className="font-mono-tabular text-xs tracking-[0.18em] uppercase text-white/45 mb-8">
            {title} · {assignments.length} File Tugas
          </p>
        </div>
      </section>

      {/* Assignment Files Grid */}
      <section id="subject-assignments" className="min-h-screen py-24 md:py-32">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
            <div>
              <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
                {title}
              </p>
              <h2
                className="text-3xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-5 max-w-xl"
                style={{ textWrap: 'balance' }}
              >
                Daftar File Tugas
              </h2>
              <p className="text-base md:text-lg text-slate-100/70 max-w-xl leading-relaxed mb-8">
                Kumpulan tugas {title} kelas 9D. Klik tombol + untuk menambahkan file PDF, gambar, tautan, atau catatan tugas baru.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="pointer-events-auto inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_24px_rgba(52,211,153,0.35)] hover:shadow-[0_0_36px_rgba(52,211,153,0.55)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isLoading ? (
                <div className="pointer-events-auto md:col-span-2 bg-[#0d1424]/80 border border-white/10 rounded-2xl p-8 text-center text-sm text-slate-100/60">
                  Memuat daftar tugas {title}...
                </div>
              ) : (
                assignments.map((file, index) => {
                  const Icon = getKindIcon(file.kind);
                  const isSelected = selectedFile?.id === file.id;
                  const numPrefix = String(index + 1).padStart(2, '0');
                  return (
                    <div
                      key={file.id}
                      className={`pointer-events-auto text-left rounded-2xl p-7 border transition-colors flex flex-col justify-between gap-5 ${
                        isSelected
                          ? 'bg-[#0d182b]/90 border-emerald-400/50'
                          : 'bg-[#0d1424]/85 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-mono-tabular text-xs text-white/45">
                            {numPrefix} · {getKindBadge(file.kind)}
                          </span>
                        </div>

                        <p className="font-mono-tabular text-xs text-emerald-300/90 mb-2">
                          {file.meta}
                        </p>
                        <h3 className="text-lg font-bold text-white mb-2.5 leading-snug">
                          {file.title}
                        </h3>
                        <p className="text-sm text-slate-100/70 leading-relaxed">
                          {file.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => handleSelectAndScroll(file.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-400 text-emerald-950 font-bold text-xs hover:bg-emerald-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Sedang Dibuka' : 'Buka File'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTugas(file.id)}
                          aria-label={`Hapus ${file.title}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.05] border border-white/10 text-white/65 font-medium text-xs hover:bg-rose-500/15 hover:border-rose-400/40 hover:text-rose-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Plus (+) Card to add tugas */}
              {!isLoading && (
                <button
                  type="button"
                  onClick={openAddModal}
                  aria-label={`Tambah tugas baru untuk ${title}`}
                  className={`pointer-events-auto text-left rounded-2xl p-7 border border-dashed border-emerald-400/35 bg-[#0d1424]/55 hover:bg-[#0d182b]/85 hover:border-emerald-400/70 transition-all flex flex-col items-center justify-center text-center gap-4 min-h-[240px] cursor-pointer group focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                    assignments.length === 0 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Tambah Tugas Baru</h3>
                    <p className="text-sm text-slate-100/65 max-w-xs mx-auto">
                      Upload file PDF, gambar, tautan, atau catatan untuk {title}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Document Viewer Section */}
      <section id="subject-viewer" className="min-h-screen py-24 md:py-32 flex items-center">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
            <div>
              <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
                Pratinjau Dokumen
              </p>

              {selectedFile ? (
                <>
                  <h2
                    className="text-2xl md:text-4xl font-extrabold leading-[1.15] tracking-tight mb-3 max-w-xl"
                    style={{ textWrap: 'balance' }}
                  >
                    {selectedFile.title}
                  </h2>
                  <p className="font-mono-tabular text-xs text-emerald-300/85 mb-4">
                    {selectedFile.meta}
                  </p>
                  <p className="text-base text-slate-100/70 max-w-xl leading-relaxed mb-7">
                    {selectedFile.summary}
                  </p>
                </>
              ) : (
                <>
                  <h2
                    className="text-2xl md:text-4xl font-extrabold leading-[1.15] tracking-tight mb-3 max-w-xl"
                    style={{ textWrap: 'balance' }}
                  >
                    Belum Ada Tugas {title}
                  </h2>
                  <p className="text-base text-slate-100/70 max-w-xl leading-relaxed mb-7">
                    Tambahkan file tugas pertamamu menggunakan tombol + agar bisa dilihat langsung di pratinjau dokumen.
                  </p>
                </>
              )}

              <div className="pointer-events-auto flex flex-col gap-2.5 mb-5">
                {assignments.map((file, idx) => {
                  const active = file.id === selectedFile?.id;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setSelectedId(file.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                          : 'bg-[#0d1424]/80 border-white/10 text-white/70 hover:text-white hover:border-white/25'
                      }`}
                    >
                      <span className="text-sm font-semibold truncate">
                        {idx + 1}. {file.title}
                      </span>
                      <span className="font-mono-tabular text-xs text-emerald-300 shrink-0">
                        {active ? 'Aktif' : 'Pilih'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="pointer-events-auto w-full px-4 py-3 rounded-xl border border-dashed border-emerald-400/35 bg-[#0d1424]/55 text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-400/65 transition-colors flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas</span>
              </button>
            </div>

            <div className="pointer-events-auto text-left w-full bg-[#0d1424]/85 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4 mb-3 px-1">
                <span className="font-mono-tabular text-xs font-medium text-white/75 truncate">
                  {selectedFile?.fileName || selectedFile?.title || `${title} · Pratinjau`}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  {selectedFile && activePreviewUrl && (
                    <a
                      href={activePreviewUrl}
                      download={selectedFile.fileName || `${selectedFile.title}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white/75 hover:text-emerald-300 transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  )}
                  <span className="font-mono-tabular text-xs font-semibold text-emerald-400 whitespace-nowrap">
                    {selectedFile ? getKindBadge(selectedFile.kind) : 'KOSONG'}
                  </span>
                </div>
              </div>

              {!selectedFile ? (
                <div className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300 mb-4">
                    <Plus className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Belum ada dokumen yang dipilih
                  </h3>
                  <p className="text-sm text-slate-100/60 max-w-sm mb-6">
                    Klik tombol di bawah untuk mengunggah tugas PDF, gambar, tautan, atau catatan untuk {title}.
                  </p>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm hover:brightness-105 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tugas</span>
                  </button>
                </div>
              ) : selectedFile.kind === 'pdf' && activePreviewUrl ? (
                <iframe
                  key={selectedFile.id}
                  src={`${activePreviewUrl}#view=FitH`}
                  title={selectedFile.title}
                  className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10"
                />
              ) : selectedFile.kind === 'image' && activePreviewUrl ? (
                <div className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={activePreviewUrl}
                    alt={selectedFile.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : selectedFile.kind === 'link' && selectedFile.externalUrl ? (
                <div className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300 mb-4">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 max-w-md">
                    {selectedFile.title}
                  </h3>
                  <p className="text-sm text-slate-100/70 max-w-md mb-4 leading-relaxed">
                    {selectedFile.summary}
                  </p>
                  <p className="font-mono-tabular text-xs text-emerald-300/80 break-all max-w-md mb-6">
                    {selectedFile.externalUrl}
                  </p>
                  <a
                    href={selectedFile.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm hover:brightness-105 transition-all"
                  >
                    <span>Buka Tautan</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : selectedFile.kind === 'file' && activePreviewUrl ? (
                <div className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300 mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedFile.fileName || selectedFile.title}
                  </h3>
                  <p className="text-sm text-slate-100/70 max-w-md mb-6 leading-relaxed">
                    {selectedFile.summary}
                  </p>
                  <a
                    href={activePreviewUrl}
                    download={selectedFile.fileName || selectedFile.title}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm hover:brightness-105 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File</span>
                  </a>
                </div>
              ) : (
                <div className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10 p-8 overflow-y-auto">
                  <p className="font-mono-tabular text-xs text-emerald-300 mb-2">
                    {selectedFile.meta}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {selectedFile.title}
                  </h3>
                  <p className="text-base text-slate-100/80 leading-relaxed whitespace-pre-wrap">
                    {selectedFile.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final Navigation Card */}
      <section className="min-h-[75vh] flex items-center py-24">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full flex justify-start">
          <div className="pointer-events-auto bg-[#0d1424]/85 border border-white/12 rounded-3xl p-10 md:p-14 max-w-[680px] w-full text-center shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)]">
            <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
              {title}
            </p>
            <h2
              className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5"
              style={{ textWrap: 'balance' }}
            >
              Arsip Tugas {title}
            </h2>
            <p className="text-base text-slate-100/70 leading-relaxed mb-9 max-w-lg mx-auto">
              Seluruh tugas {title} milik Riffat Zaki Arrabani (Kelas 9D) tersimpan langsung di halaman ini.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onBackToSolar}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_28px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Solar System</span>
              </button>

              <button
                type="button"
                onClick={onBackToLanding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/75 border border-white/15 text-white font-semibold text-sm hover:bg-slate-800/85 hover:border-white/30 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <span>Main Page</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/[0.06] bg-[#010206]/90 py-10">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="pointer-events-auto inline-flex items-center gap-2.5 text-slate-50 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 fill-emerald-400"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <polygon points="50,12 90,85 10,85" />
            </svg>
            <span>Ascend</span>
          </button>

          <div className="text-xs text-slate-500">
            © 2026 Ascend Technologies. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Tambah Tugas Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-tugas-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-[#0b1222] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 mb-1">
                  {title}
                </p>
                <h2
                  id="add-tugas-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-white tracking-tight"
                >
                  Tambah Tugas Baru
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                aria-label="Tutup"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-white/10 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setModalMode('file');
                  setFormError(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  modalMode === 'file'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Upload File (PDF / Gambar)
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalMode('link');
                  setFormError(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  modalMode === 'link'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Link / Catatan
              </button>
            </div>

            <form onSubmit={handleSaveTugas} className="flex flex-col gap-4">
              {modalMode === 'file' ? (
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    File Tugas (PDF, Gambar, Dokumen)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-2xl border border-dashed p-5 text-center cursor-pointer transition-colors ${
                      isDraggingFile
                        ? 'border-emerald-400 bg-emerald-500/15'
                        : 'border-white/20 bg-slate-950/60 hover:border-emerald-400/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*,.txt,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300 mx-auto mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    {draftFile ? (
                      <div>
                        <p className="text-sm font-semibold text-white truncate max-w-full px-2">
                          {draftFile.name}
                        </p>
                        <p className="font-mono-tabular text-xs text-emerald-300 mt-1">
                          {formatFileSize(draftFile.size)} · Klik untuk ganti file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Klik atau seret file ke sini
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Mendukung PDF, PNG, JPG, atau file tugas lainnya
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="draft-url"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Tautan / Link Dokumen (Opsional)
                  </label>
                  <input
                    id="draft-url"
                    type="text"
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="draft-title"
                  className="block text-xs font-semibold text-white/80 mb-1.5"
                >
                  Judul Tugas
                </label>
                <input
                  id="draft-title"
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={`Contoh: Tugas ${title} Bab 3`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="draft-meta"
                  className="block text-xs font-semibold text-white/80 mb-1.5"
                >
                  Keterangan / Tanggal
                </label>
                <input
                  id="draft-meta"
                  type="text"
                  value={draftMeta}
                  onChange={(e) => setDraftMeta(e.target.value)}
                  placeholder={`${formatTodayDate()} · Kelas 9D`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="draft-summary"
                  className="block text-xs font-semibold text-white/80 mb-1.5"
                >
                  Ringkasan / Catatan
                </label>
                <textarea
                  id="draft-summary"
                  rows={3}
                  value={draftSummary}
                  onChange={(e) => setDraftSummary(e.target.value)}
                  placeholder="Ringkasan singkat isi tugas..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/25 rounded-xl px-3.5 py-2.5">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.12] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 text-sm font-bold hover:brightness-105 disabled:opacity-60 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Tugas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
