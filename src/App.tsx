/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  GitBranch,
  Globe,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import { EarthCanvas } from './components/EarthCanvas';
import { SolarSystemView, type CelestialBodyId } from './components/SolarSystemView';
import { BlankPage } from './components/BlankPage';

const VALID_BODY_IDS = new Set<CelestialBodyId>([
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'ceres',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'haumea',
  'makemake',
  'eris',
]);

type RouteState =
  | { view: 'landing' }
  | { view: 'solar' }
  | { view: 'blank'; bodyId: CelestialBodyId };

function getRouteFromHash(): RouteState {
  const hash = window.location.hash;
  if (hash.startsWith('#blank/')) {
    const rawId = hash.slice('#blank/'.length) as CelestialBodyId;
    if (VALID_BODY_IDS.has(rawId)) {
      return { view: 'blank', bodyId: rawId };
    }
  }
  if (hash === '#solar') {
    return { view: 'solar' };
  }
  return { view: 'landing' };
}

const TRUSTED_TEAMS: string[] = [];

const FEATURE_CARDS = [
  {
    icon: GitBranch,
    title: 'Kelas: 9D',
    description:
      '',
  },
  {
    icon: BarChart3,
    title: 'Wali kelas: Saudia Nurbaity Suhendi S.Pd',
    description:
      '',
  },
  {
    icon: Users,
    title: 'Nama: Riffat Zaki Arrabani',
    description:
      '',
  },
  {
    icon: Zap,
    title: 'Tanggal lahir: 5 Juli 2011',
    description:
      '',
  },
  {
    icon: ShieldCheck,
    title: 'Alamat: jl. Sigma No 10 Cigadung, Bandung',
    description:
      '',
  },
  {
    icon: Globe,
    title: 'Hobby: Basket, Robotik',
    description:
    '',
  },
];

const SOCIAL_LOGOS = [
  {
    name: 'TikTok',
    src: '/assets/aistudio/1000009010_c0cb072a.jpg',
    fitClass: 'object-cover',
  },
  {
    name: 'Instagram',
    src: '/assets/aistudio/1000009011_bc83dd7f.jpg',
    fitClass: 'object-cover',
  },
  {
    name: 'YouTube',
    src: '/assets/aistudio/1000009008_52bfe0be.webp',
    fitClass: 'object-contain p-2',
  },
];

export default function App() {
  const [route, setRoute] = useState<RouteState>(getRouteFromHash);

  const openSolarSystem = useCallback(() => {
    setRoute({ view: 'solar' });
    if (window.location.hash !== '#solar') {
      window.history.pushState({ view: 'solar' }, '', '#solar');
    }
  }, []);

  const openBlankPageForBody = useCallback((bodyId: CelestialBodyId) => {
    setRoute({ view: 'blank', bodyId });
    const targetHash = `#blank/${bodyId}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ view: 'blank', bodyId }, '', targetHash);
    }
  }, []);

  const backToLanding = useCallback(() => {
    setRoute({ view: 'landing' });
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const backFromBlank = useCallback(() => {
    setRoute({ view: 'solar' });
    if (window.location.hash !== '#solar') {
      window.history.pushState({ view: 'solar' }, '', '#solar');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-50 selection:bg-emerald-400/30 selection:text-emerald-100">
      <EarthCanvas
        paused={route.view === 'solar'}
        bodyId={route.view === 'blank' ? route.bodyId : 'earth'}
      />

      {route.view === 'solar' && (
        <SolarSystemView
          paused={false}
          onBack={backToLanding}
          onInteractBody={openBlankPageForBody}
        />
      )}

      {route.view === 'blank' ? (
        <BlankPage
          key={route.bodyId}
          bodyId={route.bodyId}
          onBackToSolar={backFromBlank}
          onBackToLanding={backToLanding}
        />
      ) : (
        <div className="relative z-10 w-full pointer-events-none">
        {/* Top Bar (3-zone contract) */}
        <header className="fixed top-0 left-0 w-full z-50 bg-[#03050c]/85 border-b border-white/[0.06] pointer-events-auto">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 h-[72px] flex items-center justify-between gap-8">
            <a
              href="#hero"
              className="inline-flex items-center gap-2.5 text-slate-50 font-bold text-lg tracking-tight whitespace-nowrap shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 fill-emerald-400"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <polygon points="50,12 90,85 10,85" />
              </svg>
              <span>Ascend</span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
              <a
                href="#features"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Biodata
              </a>
              <a
                href="#solutions"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Profil
              </a>
              <button
                type="button"
                onClick={openSolarSystem}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Learning
              </button>
              <a
                href="#cta"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Arsip
              </a>
            </nav>

            <button
              type="button"
              onClick={openSolarSystem}
              className="px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.15] hover:border-white/30 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              Solar System
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
              Me N My Milestone,
              <br />
              <span className="bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Riffat Zaki Arrabani
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-100/75 max-w-[600px] mx-auto mb-10 leading-relaxed">
             
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                type="button"
                onClick={openSolarSystem}
                className="pointer-events-auto w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_28px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <span>Mulai Belajar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-[36vh] w-full" aria-hidden="true" />
        </section>

        {/* Trusted Teams Strip */}
        <section className="py-16 md:py-20 text-center">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8">
            <p className="font-mono-tabular text-xs tracking-[0.18em] uppercase text-white/45 mb-8">
            
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
              {TRUSTED_TEAMS.map((team) => (
                <span
                  key={team}
                  className="text-xl font-bold text-white/35 hover:text-white/85 transition-colors"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Platform & Feature Grid */}
        <section id="features" className="min-h-screen py-24 md:py-32">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
              <div>
                <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
             Kelas
                </p>
                <h2
                  className="text-3xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-5 max-w-xl"
                  style={{ textWrap: 'balance' }}
                >
                  Identitas Kelas & Biodata
                </h2>
                <p className="text-base md:text-lg text-slate-100/70 max-w-xl leading-relaxed">
                  Biodata
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FEATURE_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={openSolarSystem}
                      className="pointer-events-auto text-left bg-[#0d1424]/80 border border-white/10 rounded-2xl p-7 hover:border-emerald-400/45 hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-400/25 flex items-center justify-center text-emerald-300 mb-5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-100/65 leading-relaxed">
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Momentum & Funnel Section */}
        <section id="solutions" className="min-h-screen py-24 md:py-32 flex items-center">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
              <div className="pointer-events-auto bg-[#0d1424]/85 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)]">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
                  <img
                    src="/assets/aistudio/1795819091127_abb4ab29.jpg"
                    alt="Riffat Zaki Arrabani"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[16/10] object-cover object-[50%_25%] block"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 px-1">
                  <div>
                    <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-1">
                      Me N My Milestone
                    </p>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Riffat Zaki Arrabani
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5">
                      Kelas 9D · Bandung
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openSolarSystem}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_28px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
                  >
                    <span>Buka Solar System</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Social Media Logos Card */}
              <div className="pointer-events-auto text-left w-full bg-[#0d1424]/85 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)]">
                <div className="mb-6">
                  <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-1">
                    Social Media
                  </p>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    TikTok, Instagram &amp; YouTube
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-6 py-2">
                  {SOCIAL_LOGOS.map((logo) => (
                    <div
                      key={logo.name}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                        <img
                          src={logo.src}
                          alt={logo.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full ${logo.fitClass}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-white mt-3">
                        {logo.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs text-white/60">
                  <span>Riffat Zaki Arrabani</span>
                  <span className="font-mono-tabular text-emerald-300">Kelas 9D</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Card */}
        <section id="cta" className="min-h-[85vh] flex items-center py-24">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 w-full flex justify-start">
            <div className="pointer-events-auto bg-[#0d1424]/85 border border-white/12 rounded-3xl p-10 md:p-14 max-w-[680px] w-full text-center shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)]">
              <p className="font-mono-tabular text-xs font-semibold tracking-[0.12em] uppercase text-emerald-300 mb-3">
                Me N My Milestone
              </p>
              <h2
                className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5"
                style={{ textWrap: 'balance' }}
              >
                Jelajahi Semua Mata Pelajaran
              </h2>
              <p className="text-base text-slate-100/70 leading-relaxed mb-9 max-w-lg mx-auto">
                Pilih planet atau matahari di Solar System untuk melihat, membaca, dan menambahkan tugas Kelas 9D.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={openSolarSystem}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 font-bold text-sm shadow-[0_0_28px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <span>Buka Solar System</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-20 border-t border-white/[0.06] bg-[#010206]/90 py-10">
          <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="#hero"
              className="pointer-events-auto inline-flex items-center gap-2.5 text-slate-50 font-bold text-lg tracking-tight whitespace-nowrap shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 fill-emerald-400"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <polygon points="50,12 90,85 10,85" />
              </svg>
              <span>Ascend</span>
            </a>

            <div className="text-xs text-slate-500">
              © 2026 Ascend Technologies. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
      )}
    </div>
  );
}
