import { LocalizedOutput } from '../../lib/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, ChevronLeft, ChevronRight, MessageCircle, Pause, Play, X } from 'lucide-react';
import { getSoundEnabled, playVoiceClip, speakAlvaDialog } from '../../lib/audio';
import { useLanguage } from '../../lib/i18n';
import { useDesignStore } from '../../store/useDesignStore';
import { ActionButton, Panel } from '../templates/ConsolePrimitives';

type LessonId = 'welcome' | 'mass' | 'science' | 'missions' | 'survival';

interface LessonPart {
  title: string;
  description: string;
  audio: string;
}

interface Lesson {
  title: string;
  parts: LessonPart[];
}

const LESSONS: Record<LessonId, Lesson> = {
  welcome: {
    title: 'Bienvenida a la agencia',
    parts: [
      {
        title: 'Tu misión',
        description:
          'AlvaBot te presenta como comandante, el presupuesto inicial y el objetivo de diseñar una misión espacial.',
        audio: '/audio/audios/Introduccion/Introduccion_1.m4a',
      },
      {
        title: 'La regla de oro',
        description:
          'La masa y el combustible están conectados: cada decisión afecta cuánto puede transportar y acelerar el cohete.',
        audio: '/audio/audios/Introduccion/Introduccion_2.m4a',
      },
    ],
  },
  mass: {
    title: 'Masa máxima y empuje',
    parts: [
      {
        title: 'La mochila de ladrillos',
        description: 'Más peso exige más empuje, igual que saltar llevando una mochila pesada.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_1.m4a',
      },
      {
        title: 'El límite físico',
        description: 'El lanzador tiene un límite de masa; superar ese margen compromete el ascenso.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_2.m4a',
      },
      {
        title: 'Saturn V y SLS',
        description: 'Las referencias históricas ayudan a poner en contexto la masa del vehículo.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_3.m4a',
      },
      {
        title: 'Relación empuje-peso',
        description: 'La relación entre empuje y peso determina si el cohete puede despegar.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_4.m4a',
      },
      {
        title: 'Zona crítica',
        description: 'Al acercarte al límite de masa, la nave tiene menos margen para responder a una anomalía.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_5.m4a',
      },
      {
        title: 'Busca margen',
        description: 'Un diseño equilibrado conserva capacidad de carga sin comprometer el despegue.',
        audio: '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_6.m4a',
      },
    ],
  },
  science: {
    title: 'Instrumentos y energía',
    parts: [
      {
        title: 'Ranuras y recursos',
        description: 'La bahía científica tiene tres ranuras y cada instrumento consume masa y energía.',
        audio: '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_1.m4a',
      },
      {
        title: 'El costo de los sensores',
        description: 'Compara el aporte científico de cada instrumento con su consumo eléctrico.',
        audio: '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_2.m4a',
      },
      {
        title: 'Una casa sin red',
        description: 'Demasiados aparatos pueden sobrecargar un sistema aislado, como una casa sin conexión eléctrica.',
        audio: '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_3.m4a',
      },
      {
        title: 'Balance solar',
        description: 'Mantén la generación por encima del consumo para evitar una caída de tensión.',
        audio: '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_4.m4a',
      },
    ],
  },
  missions: {
    title: 'Misiones inspiradas en NASA',
    parts: [
      {
        title: 'Ingeniería real',
        description: 'Los escenarios conectan los retos del juego con decisiones de misiones reales.',
        audio: '/audio/audios/Inspiraciones del mundo real/Inspiraciones_del_mundo_real_misiones_recreadas_1.m4a',
      },
      {
        title: 'PUNCH',
        description: 'PUNCH estudia el viento solar con una constelación de satélites pequeños.',
        audio: '/audio/audios/Inspiraciones del mundo real/Mision_PUNCH.m4a',
      },
      {
        title: 'Dawn',
        description: 'Dawn exploró Vesta y Ceres; su misión inspira los escenarios de espacio profundo.',
        audio: '/audio/audios/Inspiraciones del mundo real/Mision_DAWN.m4a',
      },
      {
        title: 'Recreaciones',
        description: 'Compara los diseños del simulador con misiones y objetivos científicos reales.',
        audio: '/audio/audios/Inspiraciones del mundo real/Inspiraciones_del_mundo_real_misiones_recreadas_2.m4a',
      },
    ],
  },
  survival: {
    title: 'Manual de supervivencia',
    parts: [
      {
        title: 'Protocolo general',
        description: 'Identifica el subsistema afectado y sigue el procedimiento de la consola asignada.',
        audio: '/audio/audios/Manual de supervivencia/Manual_De_Supervivencia.m4a',
      },
      {
        title: 'Estrés en Max-Q',
        description: 'El ascenso somete a la estructura a cargas elevadas; conserva margen de masa.',
        audio: '/audio/audios/Manual de supervivencia/Estres_en_MAX-Q.m4a',
      },
      {
        title: 'Apagado prematuro',
        description: 'Si el combustible se agota antes de tiempo, protege la nave y prioriza el retorno.',
        audio: '/audio/audios/Manual de supervivencia/Apagado_Prematuro_de_motores.m4a',
      },
      {
        title: 'Sobrecarga eléctrica',
        description: 'Reduce el consumo o desactiva instrumentos para estabilizar el bus eléctrico.',
        audio: '/audio/audios/Manual de supervivencia/Sobrecarga_Electrica.m4a',
      },
    ],
  },
};

const LESSON_OPTIONS: Array<{ id: LessonId; title: string }> = [
  { id: 'mass', title: 'Masa y empuje' },
  { id: 'science', title: 'Ciencia y energía' },
  { id: 'missions', title: 'Misiones NASA' },
  { id: 'survival', title: 'Manual de vuelo' },
];

const ENGLISH_DIALOGS: Record<string, string> = {
  '/audio/audios/Introduccion/Introduccion_1.m4a':
    'Welcome to mission control. You are the commander, and your starting budget is three point five billion dollars. Your goal is to design a spacecraft that can complete its science mission.',
  '/audio/audios/Introduccion/Introduccion_2.m4a':
    'Here is the golden rule: mass and fuel are connected. Every design choice affects how much the rocket can carry and how much it can accelerate.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_1.m4a':
    'Think of the rocket as carrying a heavy backpack. The more it weighs, the more thrust it needs to leave the ground.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_2.m4a':
    'Every launch vehicle has a maximum mass. Going beyond that limit can compromise the climb to orbit.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_3.m4a':
    'The Saturn Five and the Space Launch System show just how massive launch vehicles can be. Historical examples help put your design in perspective.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_4.m4a':
    'The thrust-to-weight ratio tells you whether the rocket can lift off. A value below one means it cannot overcome gravity.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_5.m4a':
    'As you approach the mass limit, the spacecraft has less margin to handle unexpected problems.',
  '/audio/audios/Masa maxima de despegue/Masa_Maxima_de_despegue_6.m4a':
    'A balanced design keeps enough payload capacity without putting launch at risk. Leave room for unexpected events.',
  '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_1.m4a':
    'The science bay has three slots. Every instrument uses both mass and electrical power.',
  '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_2.m4a':
    'Compare the science contribution of each instrument with the power it consumes.',
  '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_3.m4a':
    'Imagine a house that is disconnected from the power grid. Too many appliances can overload its independent power system.',
  '/audio/audios/Instrumentos Cientificos y energia/Instrumentos_Cientificos_y_energia_4.m4a':
    'Keep power generation above consumption to prevent a voltage drop and protect your instruments.',
  '/audio/audios/Inspiraciones del mundo real/Inspiraciones_del_mundo_real_misiones_recreadas_1.m4a':
    'The scenarios connect the challenges in this simulator with real decisions made by mission engineers.',
  '/audio/audios/Inspiraciones del mundo real/Mision_PUNCH.m4a':
    'The PUNCH mission studies the solar wind with a constellation of small satellites.',
  '/audio/audios/Inspiraciones del mundo real/Mision_DAWN.m4a':
    'The Dawn mission explored Vesta and Ceres. Its use of ion propulsion inspires our deep-space scenarios.',
  '/audio/audios/Inspiraciones del mundo real/Inspiraciones_del_mundo_real_misiones_recreadas_2.m4a':
    'Compare your designs with real missions and their science objectives.',
  '/audio/audios/Manual de supervivencia/Manual_De_Supervivencia.m4a':
    'Identify the affected subsystem and follow the procedure on your assigned console.',
  '/audio/audios/Manual de supervivencia/Estres_en_MAX-Q.m4a':
    'During ascent, the spacecraft experiences high structural loads. Keep enough mass margin to protect it.',
  '/audio/audios/Manual de supervivencia/Apagado_Prematuro_de_motores.m4a':
    'If fuel runs out early, protect the spacecraft and prioritize a safe return.',
  '/audio/audios/Manual de supervivencia/Sobrecarga_Electrica.m4a':
    'Reduce power consumption or switch off instruments to stabilize the electrical bus.',
};

function playLessonPart(
  part: LessonPart,
  language: 'es' | 'en',
  canFallback: () => boolean = () => true,
): Promise<boolean> {
  if (language === 'en') {
    return Promise.resolve(
      speakAlvaDialog(ENGLISH_DIALOGS[part.audio] ?? part.description, 'en-US'),
    );
  }
  return playVoiceClip(part.audio).then(
    (played) => played || (canFallback() && speakAlvaDialog(part.description, 'es-AR')),
  );
}

const INTRO_SEEN_KEY = 'orbitalab-alvabot-intro-seen';
const LESSON_SEEN_KEY = 'orbitalab-alvabot-lessons-seen';

function readSeenLessons(): Set<LessonId> {
  try {
    const stored = window.localStorage.getItem(LESSON_SEEN_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((value): value is LessonId =>
            LESSON_OPTIONS.some((lesson) => lesson.id === value),
          )
        : [],
    );
  } catch (error) {
    console.warn('No se pudieron leer los diálogos ya vistos de AlvaBot:', error);
    return new Set();
  }
}

function saveSeenLesson(id: LessonId): void {
  const seen = readSeenLessons();
  seen.add(id);
  try {
    window.localStorage.setItem(LESSON_SEEN_KEY, JSON.stringify([...seen]));
  } catch (error) {
    console.warn('No se pudo guardar el diálogo visto de AlvaBot:', error);
  }
}

export function AlvaBot() {
  const { language } = useLanguage();
  const advisorFeedback = useDesignStore((state) => state.advisorFeedback);
  const audit = useDesignStore((state) => state.audit);
  const crisisAlert = useDesignStore((state) => state.crisisAlert);
  const difficulty = useDesignStore((state) => state.difficulty);
  const hasRoom = useDesignStore((state) => state.hasRoom);
  const mission = useDesignStore((state) => state.mission);
  const phase = useDesignStore((state) => state.phase);
  const selectedModules = useDesignStore((state) => state.selectedModules);
  const showHome = useDesignStore((state) => state.showHome);
  const telemetry = useDesignStore((state) => state.telemetry);
  const notify = useDesignStore((state) => state.notify);
  const [open, setOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [introPart, setIntroPart] = useState(0);
  const [lessonId, setLessonId] = useState<LessonId>('welcome');
  const [partIndex, setPartIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lesson = LESSONS[lessonId];
  const part = lesson.parts[Math.min(partIndex, lesson.parts.length - 1)];
  const intro = LESSONS.welcome.parts[introPart];
  const triggeredLessons = useRef(new Set<LessonId>());

  const showLesson = useCallback((id: LessonId, index = 0) => {
    if (triggeredLessons.current.has(id) || readSeenLessons().has(id)) return false;
    triggeredLessons.current.add(id);
    saveSeenLesson(id);
    setLessonId(id);
    setPartIndex(index);
    setOpen(true);
    const selectedPart = LESSONS[id].parts[index];
    setPlaying(true);
    void playLessonPart(selectedPart, language).then(() => {
      setPlaying(false);
    });
    return true;
  }, [language]);

  useEffect(() => {
    if (showHome || hasRoom || phase !== 'LOBBY' || difficulty !== 'APPRENTICE') return;
    try {
      if (window.localStorage.getItem(INTRO_SEEN_KEY) === 'true') return;
      setIntroOpen(true);
    } catch (error) {
      console.warn('No se pudo consultar la bienvenida de AlvaBot:', error);
      setIntroOpen(true);
    }
  }, [difficulty, hasRoom, phase, showHome]);

  useEffect(() => {
    if (!introOpen) return;
    let active = true;
    const currentPart = LESSONS.welcome.parts[introPart];
    void playLessonPart(currentPart, language, () => active);
    return () => {
      active = false;
    };
  }, [introOpen, introPart, language]);

  useEffect(() => {
    if (showHome || phase !== 'DESIGN' || difficulty !== 'APPRENTICE') return;
    if (mission && showLesson(
      'missions',
      mission.realNasaReference.missionName.toUpperCase().includes('DAWN')
        ? 2
        : mission.realNasaReference.missionName.toUpperCase().includes('PUNCH')
          ? 1
          : 0,
    )) return;
    if (
      (selectedModules.some((module) => module.category === 'EST') ||
        (telemetry?.massPercentage ?? 0) >= 70) &&
      showLesson('mass')
    ) return;
    if (
      selectedModules.some((module) => module.category === 'SCI') &&
      showLesson('science')
    ) return;
    const warning = audit?.warnings.find(
      (item) => item.code === 'STRUCTURAL_STRESS' || item.code === 'POWER_DEFICIT',
    );
    if (warning) {
      showLesson('survival', warning.code === 'STRUCTURAL_STRESS' ? 1 : 3);
    }
  }, [audit, difficulty, mission, phase, selectedModules, showHome, showLesson, telemetry]);

  useEffect(() => {
    if (phase !== 'FLIGHT' || !crisisAlert) return;
    setLessonId('survival');
    setPartIndex(
      crisisAlert.eventId === 'structural-stress'
        ? 1
        : crisisAlert.eventId === 'power-drop'
          ? 3
          : 0,
    );
    setOpen(true);
  }, [crisisAlert, phase]);

  const listen = async () => {
    if (!getSoundEnabled()) {
      notify('Activa música y sonidos para escuchar los diálogos de AlvaBot.', 'warning');
      return;
    }
    setPlaying(true);
    const spoken = await playLessonPart(part, language);
    if (!spoken) {
      notify(
        language === 'en'
          ? 'This browser cannot play spoken English dialogs. Spanish subtitles are still available.'
          : 'No se pudo reproducir este diálogo de AlvaBot.',
        'error',
      );
    }
    setPlaying(false);
  };

  const finishIntro = () => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch (error) {
      console.warn('No se pudo guardar la bienvenida de AlvaBot:', error);
    }
    setIntroOpen(false);
  };

  return <LocalizedOutput>{(
    <>
      {introOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-gutter-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alvabot-intro-title"
        >
          <Panel className="w-full max-w-xl">
            <div className="flex items-center gap-gutter-sm">
              <Bot className="h-8 w-8 text-primary" aria-hidden="true" />
              <div>
                <p className="font-mono text-mono-xs uppercase tracking-wider text-primary">
                  Bienvenida a la agencia · {introPart + 1}/2
                </p>
                <h2 id="alvabot-intro-title" className="font-headline text-headline-md text-on-surface">
                  {intro.title}
                </h2>
              </div>
            </div>
            {language === 'en' && (
              <p className="mt-gutter-md font-label text-label-sm text-primary">
                Subtítulos en español
              </p>
            )}
            <p lang="es" className="mt-gutter-md font-body text-body-lg text-on-surface-variant">
              {intro.description}
            </p>
            <div className="mt-gutter-lg flex justify-end gap-gutter-sm">
              {introPart === 0 ? (
                <ActionButton
                  icon={ChevronRight}
                  onClick={() => setIntroPart(1)}
                >
                  Siguiente
                </ActionButton>
              ) : (
                <ActionButton icon={Play} onClick={finishIntro}>
                  Comenzar
                </ActionButton>
              )}
            </div>
          </Panel>
        </div>
      )}
      <div className="fixed bottom-20 left-4 z-[50]">
        {open && (
          <Panel
            as="aside"
            className="mb-2 flex max-h-[min(70vh,560px)] w-[min(340px,calc(100vw-2rem))] flex-col gap-gutter-sm overflow-y-auto shadow-console"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-headline text-title-md text-on-surface">AlvaBot</h2>
                  <p className="font-body text-[11px] text-on-surface-variant">
                    Tu ayudante de misión
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-on-surface-variant hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Cerrar AlvaBot"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {phase === 'FLIGHT' && crisisAlert && (
              <div className="rounded border border-error/40 bg-error/10 p-gutter-sm" aria-live="assertive">
                <p className="font-label text-label-sm text-error">
                  Incidente {crisisAlert.eventNumber}/{crisisAlert.totalEvents} · {crisisAlert.title}
                </p>
                <p className="mt-1 font-body text-[11px] text-on-surface-variant">
                  {crisisAlert.description}
                </p>
              </div>
            )}

            {advisorFeedback.length > 0 && (
              <div className="rounded border border-primary/30 bg-primary/5 p-gutter-sm" aria-live="polite">
                <p className="mb-1 font-label text-label-sm text-primary">Consejo de diseño</p>
                <ul className="flex flex-col gap-1">
                  {advisorFeedback.slice(-3).map((message, index) => (
                    <li key={`${index}-${message}`} className="font-body text-[11px] text-on-surface-variant">
                      {message.replace(/^Asesores? virtuales?:?\s*/i, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Diálogos de AlvaBot">
              {LESSON_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={lessonId === item.id}
                  onClick={() => {
                    setLessonId(item.id);
                    setPartIndex(0);
                    setPlaying(false);
                  }}
                  className={`rounded border px-2 py-1.5 text-left font-label text-label-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                    lessonId === item.id
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div>
              <p className="font-label text-label-lg text-on-surface">{part.title}</p>
              {language === 'en' && (
                <p className="mt-1 font-label text-label-sm text-primary">
                  Subtítulos en español
                </p>
              )}
              <p lang="es" className="mt-1 font-body text-body-md text-on-surface-variant">
                {part.description}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Diálogo anterior"
                disabled={partIndex === 0}
                onClick={() => setPartIndex((current) => Math.max(0, current - 1))}
                className="rounded border border-outline px-2 py-1 text-on-surface-variant disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="font-mono text-mono-xs text-on-surface-variant">
                {`Parte ${partIndex + 1} de ${lesson.parts.length}`}
              </span>
              <button
                type="button"
                aria-label="Diálogo siguiente"
                disabled={partIndex >= lesson.parts.length - 1}
                onClick={() =>
                  setPartIndex((current) => Math.min(lesson.parts.length - 1, current + 1))
                }
                className="rounded border border-outline px-2 py-1 text-on-surface-variant disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <ActionButton
              icon={playing ? Pause : Play}
              onClick={() => void listen()}
              fullWidth
            >
              Escuchar diálogo
            </ActionButton>
          </Panel>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Cerrar el ayudante AlvaBot' : 'Abrir el ayudante AlvaBot'}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/40 bg-surface-container-low px-4 font-label text-label-md text-primary shadow-console transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          AlvaBot
        </button>
      </div>
    </>
  )}</LocalizedOutput>;
}
