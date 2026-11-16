import { LocalizedOutput } from '../../lib/i18n';
import { useMemo, useState } from 'react';
import type { MissionConfig, MissionReport } from '@shared/types';
import { useDesignStore } from '../../store/useDesignStore';
import { ActionButton, Panel } from '../templates/ConsolePrimitives';
import { MissionOutcomeTemplate, type OutcomeStat } from '../templates/OutcomeTemplate';

function buildStats(report: MissionReport, mission: MissionConfig | null): OutcomeStat[] {
  const target = mission?.targetSciencePoints ?? 0;
  const downlinkTarget = mission?.requiredDownlinkRatio;
  const sciencePercent =
    target > 0 ? Math.round((report.sciencePointsEarned / target) * 100) : 0;
  const meetsDownlinkTarget =
    downlinkTarget !== undefined && report.dataRecoveryRatio >= downlinkTarget;

  return [
    {
      label: 'Ciencia obtenida',
      value: `${report.sciencePointsEarned} pts`,
      note:
        target > 0
          ? `${sciencePercent}% del objetivo (${target} pts)`
          : 'Sin objetivo científico definido',
      tone: sciencePercent >= 100 ? 'success' : sciencePercent >= 60 ? 'primary' : 'warning',
    },
    {
      label: 'Datos recuperados',
      value: `${Math.round(report.dataRecoveryRatio * 100)}%`,
      note: downlinkTarget === undefined
        ? 'Umbral de misión no disponible'
        : meetsDownlinkTarget
          ? `Cumple el mínimo requerido (${Math.round(downlinkTarget * 100)}%)`
          : `Por debajo del mínimo requerido (${Math.round(downlinkTarget * 100)}%)`,
      tone: downlinkTarget === undefined ? 'primary' : meetsDownlinkTarget ? 'success' : 'warning',
    },
    {
      label: 'Incidentes resueltos',
      value: `${report.incidents.filter((incident) => incident.resolved).length} / ${report.incidents.length}`,
      note: report.crisisResolved
        ? 'Todos los incidentes fueron controlados'
        : 'Los incidentes sin resolver reducen el resultado',
      tone: report.crisisResolved ? 'success' : 'error',
    },
    {
      label: 'Duración simulada',
      value: `${Math.round(report.flightDurationSeconds)} s`,
      note: mission?.title ?? 'Misión OrbitaLab',
      tone: 'primary',
    },
  ];
}

export function ReportScreen() {
  const report = useDesignStore((s) => s.report);
  const mission = useDesignStore((s) => s.mission);
  const difficulty = useDesignStore((s) => s.difficulty);
  const repeatMission = useDesignStore((s) => s.repeatMission);
  const resetMissionInRoom = useDesignStore((s) => s.resetMissionInRoom);
  const leaveRoom = useDesignStore((s) => s.leaveRoom);
  const openHome = useDesignStore((s) => s.openHome);
  const missions = useDesignStore((s) => s.missions);
  const gameMode = useDesignStore((s) => s.gameMode);
  const localMode = useDesignStore((s) => s.localMode);
  const roomState = useDesignStore((s) => s.roomState);
  const socket = useDesignStore((s) => s.socket);
  const notify = useDesignStore((s) => s.notify);
  const [missionPickerOpen, setMissionPickerOpen] = useState(false);
  const [nextMissionId, setNextMissionId] = useState(mission?.id ?? '');

  const stats = useMemo(
    () => (report ? buildStats(report, mission) : []),
    [report, mission],
  );
  const isRoomHost = roomState?.hostId === socket?.id;

  const startNewMission = () => {
    if (gameMode !== 'TEAM' || localMode) {
      leaveRoom();
      return;
    }
    if (!isRoomHost) {
      notify('El anfitrión debe elegir la próxima misión para esta sala.', 'warning');
      return;
    }
    setNextMissionId(mission?.id ?? missions[0]?.id ?? '');
    setMissionPickerOpen(true);
  };

  const confirmNewMission = () => {
    if (!missions.some((item) => item.id === nextMissionId)) {
      notify('Selecciona una misión disponible.', 'error');
      return;
    }
    resetMissionInRoom(nextMissionId);
    setMissionPickerOpen(false);
  };

  if (!report) {
    return <LocalizedOutput>{(
      <div className="flex min-h-screen items-center justify-center bg-surface p-gutter-lg text-on-surface">
        <div className="flex max-w-md flex-col items-center gap-gutter-sm text-center">
          <p className="font-headline text-headline-md">Informe no disponible</p>
          <p className="font-body text-body-md text-on-surface-variant">
            La simulación no generó un informe. Vuelve al inicio y repite la misión.
          </p>
          <button
            type="button"
            onClick={openHome}
            className="rounded border border-outline bg-surface-container px-gutter-lg py-gutter-sm font-label text-label-lg text-on-surface hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )}</LocalizedOutput>;
  }

  return <LocalizedOutput>{(
    <>
    <MissionOutcomeTemplate
      difficulty={difficulty}
      mission={mission}
      report={report}
      stats={stats}
      onReplay={repeatMission}
      onNewMission={startNewMission}
      onHome={openHome}
    />
    {missionPickerOpen && (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-gutter-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-mission-title"
      >
        <Panel className="w-full max-w-lg">
          <h2 id="next-mission-title" className="font-headline text-headline-md text-on-surface">
            Elegir la próxima misión
          </h2>
          <p className="mt-1 font-body text-body-md text-on-surface-variant">
            La sala y su código se conservarán. La tripulación volverá junta al lobby.
          </p>
          <label htmlFor="next-mission" className="mt-gutter-md block font-label text-label-sm text-on-surface">
            Escenario
          </label>
          <select
            id="next-mission"
            value={nextMissionId}
            onChange={(event) => setNextMissionId(event.target.value)}
            className="mt-1 w-full rounded border border-outline bg-surface-container px-gutter-sm py-gutter-xs font-body text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {missions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="mt-gutter-md flex justify-end gap-gutter-sm">
            <ActionButton variant="secondary" onClick={() => setMissionPickerOpen(false)}>
              Cancelar
            </ActionButton>
            <ActionButton onClick={confirmNewMission} disabled={missions.length === 0}>
              Volver al lobby
            </ActionButton>
          </div>
        </Panel>
      </div>
    )}
    </>
  )}</LocalizedOutput>;
}
