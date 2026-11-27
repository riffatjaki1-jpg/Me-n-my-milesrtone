import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  FileText,
  Headphones,
  Mic,
  Terminal,
} from 'lucide-react';

interface IndonesiaSubjectViewProps {
  onBackToSolar: () => void;
  onBackToLanding: () => void;
}

interface AssignmentFile {
  id: string;
  title: string;
  meta: string;
  summary: string;
  url: string;
  downloadName: string;
  icon: typeof FileText;
}

const INDONESIA_ASSIGNMENTS: AssignmentFile[] = [
  {
    id: 'literasi-podcast',
    title: 'Lembar Kerja Literasi: Watch, Listen, and Write!',
    meta: '13/11/2026 · Literasi Podcast · Kelas 9D',
    summary:
      'Ringkasan dan refleksi video podcast "APA ITU TAUHID?" bersama Pandji Pragiwaksono dan Ustaz Felix tentang makna tauhid, ikhtiar maksimal, dan sikap tawakal.',
    url: '/assets/aistudio/18_Riffat_Zaki_Arrabani_9D_261122_203442_ca51c80e.pdf',
    downloadName: '18_Riffat Zaki Arrabani_9D 261122_203442.pdf',
    icon: Headphones,
  },
  {
    id: 'lks-perpustakaan',
    title: 'LKS Kunjungan Perpustakaan',
    meta: '07/08/2026 · Literasi Buku · Kelas 9D',
    summary:
      'Eksplorasi isi buku "Louis Pasteur — Why? People" karya Seolgi Nam mengenai kisah perjalanan hidup Louis Pasteur dari masa kecil hingga tua serta nilai sejarahnya.',
    url: '/assets/aistudio/18_Riffat_Zaki_Arrabani_literasi_2_367477a6.pdf',
    downloadName: '18_Riffat Zaki Arrabani_literasi 2.pdf',
    icon: BookOpen,
  },
  {
    id: 'naskah-assemblr',
    title: 'Naskah Voice Over Video Assemblr',
    meta: 'THE BIG BOYS (Irsyad, Zaki, Azzam) · Budaya Indonesia · Kelas 9D',
    summary:
      'Naskah narasi "Menjelajah Budaya Indonesia" mengenai Komodo dari Nusa Tenggara Timur mencakup bagian pembukaan, deskripsi fisik, rekon sejarah, refleksi pelestarian, dan penutup.',
    url: '/assets/aistudio/BIG_BOYS_NASKAH_VOICE_OVER_VIDEO_ASSEMBLR_Budaya_Indonesia._5efb07c7.pdf',
    downloadName: 'BIG BOYS_NASKAH VOICE OVER VIDEO ASSEMBLR_Budaya Indonesia..pdf',
    icon: Mic,
  },
  {
    id: 'teks-prosedur',
    title: 'Menulis Teks Prosedur: Cara Setup Claude Code',
    meta: 'Teks Prosedur · Kelas 9D',
    summary:
      'Panduan langkah demi langkah instalasi serta konfigurasi Claude Code melalui Node.js dan NPM lengkap dengan penandaan kalimat imperatif, kata kerja aksi, dan konjungsi kronologis.',
    url: '/assets/aistudio/18_Riffat_Zaki_A_1b6441b9.pdf',
    downloadName: '18_Riffat Zaki A.pdf',
    icon: Terminal,
  },
];

export function IndonesiaSubjectView({
  onBackToSolar,
  onBackToLanding,
}: IndonesiaSubjectViewProps) {
  const [selectedId, setSelectedId] = useState<string>(INDONESIA_ASSIGNMENTS[0].id);

  const selectedFile =
    INDONESIA_ASSIGNMENTS.find((item) => item.id === selectedId) ?? INDONESIA_ASSIGNMENTS[0];

  const handleSelectAndScroll = (id: string) => {
    setSelectedId(id);
    const viewerEl = document.getElementById('subject-viewer');
    if (viewerEl) {
      viewerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      data-blank-page="venus"
      className="relative z-10 w-full pointer-events-none"
      role="region"
      aria-label="B. Indonesia"
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
              Pratinjau PDF
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
              B. Indonesia
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
          </div>
        </div>

        <div className="h-[36vh] w-full" aria-hidden="true" />
      </section>

      {/* Spacer Strip */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <p className="font-mono-tabular text-xs tracking-[0.18em] uppercase text-white/45 mb-8">
            B. Indonesia · 4 File Tugas PDF
          </p>
        </div>
      </section>

      {/* Assignment Files Grid (replaces Biodata Grid) */}
      <section id="subject-assignments" className="min-h-screen py-24 md:py-32">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
            <div>
              <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
                B. Indonesia
              </p>
              <h2
                className="text-3xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-5 max-w-xl"
                style={{ textWrap: 'balance' }}
              >
                Daftar File Tugas
              </h2>
              <p className="text-base md:text-lg text-slate-100/70 max-w-xl leading-relaxed">
                Kumpulan tugas Bahasa Indonesia kelas 9D dalam format PDF. Pilih salah satu file untuk membukanya langsung pada pratinjau dokumen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {INDONESIA_ASSIGNMENTS.map((file, index) => {
                const Icon = file.icon;
                const isSelected = file.id === selectedFile.id;
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
                          0{index + 1} · PDF
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

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => handleSelectAndScroll(file.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-400 text-emerald-950 font-bold text-xs hover:bg-emerald-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Sedang Dibuka' : 'Buka File'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded PDF Viewer Section (replaces Stats & Pipeline Chart) */}
      <section id="subject-viewer" className="min-h-screen py-24 md:py-32 flex items-center">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
            <div>
              <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
                Pratinjau Dokumen
              </p>
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

              <div className="pointer-events-auto flex flex-col gap-2.5 mb-8">
                {INDONESIA_ASSIGNMENTS.map((file, idx) => {
                  const active = file.id === selectedFile.id;
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
            </div>

            <div className="pointer-events-auto text-left w-full bg-[#0d1424]/85 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4 mb-3 px-1">
                <span className="font-mono-tabular text-xs font-medium text-white/75 truncate">
                  {selectedFile.downloadName}
                </span>
                <span className="font-mono-tabular text-xs font-semibold text-emerald-400 whitespace-nowrap shrink-0">
                  PDF
                </span>
              </div>

              <iframe
                key={selectedFile.id}
                src={`${selectedFile.url}#view=FitH`}
                title={selectedFile.title}
                className="w-full h-[540px] rounded-xl bg-slate-950 border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final Navigation Card */}
      <section className="min-h-[75vh] flex items-center py-24">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full flex justify-start">
          <div className="pointer-events-auto bg-[#0d1424]/85 border border-white/12 rounded-3xl p-10 md:p-14 max-w-[680px] w-full text-center shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)]">
            <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
              B. Indonesia
            </p>
            <h2
              className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5"
              style={{ textWrap: 'balance' }}
            >
              Arsip Tugas Bahasa Indonesia
            </h2>
            <p className="text-base text-slate-100/70 leading-relaxed mb-9 max-w-lg mx-auto">
              Seluruh 4 file tugas Riffat Zaki Arrabani (Kelas 9D) tersimpan dan siap dibaca langsung di halaman ini.
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
    </div>
  );
}
