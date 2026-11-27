import { useEffect } from 'react';
import type { CelestialBodyId } from './SolarSystemView';
import { IndonesiaSubjectView } from './IndonesiaSubjectView';
import { SubjectTugasView } from './SubjectTugasView';

interface BlankPageProps {
  bodyId: CelestialBodyId;
  onBackToSolar: () => void;
  onBackToLanding: () => void;
}

export const BODY_SUBJECT_TITLES: Record<CelestialBodyId, string> = {
  sun: 'PAI',
  mercury: 'PKN',
  venus: 'B. Indonesia',
  earth: 'B. Inggris',
  mars: 'Matematika',
  ceres: 'IPS',
  jupiter: 'IPA',
  saturn: 'PJOK',
  uranus: 'Seni Budaya',
  neptune: 'B. Sunda',
  pluto: 'Informatika',
  haumea: 'Leadership',
  makemake: 'GE',
  eris: 'BK',
};

export function BlankPage({ bodyId, onBackToSolar, onBackToLanding }: BlankPageProps) {
  const title = BODY_SUBJECT_TITLES[bodyId];

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = `${title} — Me and My Milestone | Riffat Zaki Arrabani`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (bodyId === 'venus' && e.key === 'Escape') {
        onBackToSolar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.title = prevTitle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bodyId, title, onBackToSolar]);

  if (bodyId === 'venus') {
    return (
      <IndonesiaSubjectView
        onBackToSolar={onBackToSolar}
        onBackToLanding={onBackToLanding}
      />
    );
  }

  return (
    <SubjectTugasView
      bodyId={bodyId}
      title={title}
      onBackToSolar={onBackToSolar}
      onBackToLanding={onBackToLanding}
    />
  );
}
