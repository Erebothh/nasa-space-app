import { LocalizedOutput } from '../../lib/i18n';
import { useEffect, useState } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import {
  getSoundEnabled,
  getSoundVolume,
  playUiClick,
  setSoundEnabled,
  setSoundVolume,
  unlockAudio,
} from '../../lib/audio';
import { Panel } from '../templates/ConsolePrimitives';

export function AudioControls() {
  const [enabled, setEnabled] = useState(getSoundEnabled);
  const [volume, setVolume] = useState(getSoundVolume);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleGesture = () => unlockAudio();
    const handleClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('button:not(:disabled), a, [role="button"]')) {
        playUiClick();
      }
    };
    document.addEventListener('pointerdown', handleGesture);
    document.addEventListener('keydown', handleGesture);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('pointerdown', handleGesture);
      document.removeEventListener('keydown', handleGesture);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const toggleSound = () => {
    const nextEnabled = !enabled;
    setSoundEnabled(nextEnabled);
    setEnabled(nextEnabled);
  };
  const Icon = !enabled || volume === 0 ? VolumeX : volume < 0.6 ? Volume1 : Volume2;

  return <LocalizedOutput>{(
    <div className="fixed right-3 top-3 z-[80]">
      {settingsOpen && (
        <Panel
          as="section"
          className="absolute right-0 top-12 flex w-64 flex-col gap-gutter-sm shadow-console"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-lg text-on-surface">Audio</span>
            <button
              type="button"
              aria-pressed={enabled}
              onClick={toggleSound}
              className="rounded border border-outline px-2 py-1 font-label text-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {enabled ? 'Silenciar' : 'Activar'}
            </button>
          </div>
          <label htmlFor="audio-volume" className="flex items-center justify-between gap-2">
            <span className="font-body text-body-md text-on-surface-variant">Volumen general</span>
            <output htmlFor="audio-volume" className="font-mono text-mono-xs text-primary">
              {Math.round(volume * 100)}%
            </output>
          </label>
          <input
            id="audio-volume"
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(volume * 100)}
            onChange={(event) => {
              const nextVolume = Number(event.target.value) / 100;
              setVolume(nextVolume);
              setSoundVolume(nextVolume);
            }}
            className="w-full accent-primary"
            aria-label="Volumen general de música y sonidos"
          />
        </Panel>
      )}
      <button
        type="button"
        aria-expanded={settingsOpen}
        aria-label={settingsOpen ? 'Cerrar configuración de audio' : 'Abrir configuración de audio'}
        title="Configuración de audio"
        onClick={() => setSettingsOpen((open) => !open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface-container-low/95 text-primary shadow-console backdrop-blur transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )}</LocalizedOutput>;
}
