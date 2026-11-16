import type { MissionReport, ModuleItem, RoomState } from '../../../shared/types.js';
import { estimateDataRecoveryRatio } from '../engine/calculator.js';
import { flightConfig } from '../catalog.js';
import type { FlightRuntimeState } from './loop.js';

export function calculateActiveTelemetry(
  modules: ModuleItem[],
  disabledExperimentIds: string[],
): { sciencePoints: number; dataGeneratedMbps: number } {
  const activeModules = modules.filter(
    (module) => !disabledExperimentIds.includes(module.id),
  );
  return {
    sciencePoints: activeModules
      .filter((module) => module.category === 'SCI')
      .reduce((total, module) => total + module.sciencePoints, 0),
    dataGeneratedMbps: activeModules.reduce(
      (total, module) => total + module.dataGenMbps,
      0,
    ),
  };
}

export function generateMissionReport(
  room: RoomState,
  flight: FlightRuntimeState,
): MissionReport {
  const activeTelemetry = calculateActiveTelemetry(
    room.selectedModules,
    flight.disabledExperimentIds,
  );
  const sciencePointsEarned = activeTelemetry.sciencePoints;
  const generatedMbps = activeTelemetry.dataGeneratedMbps;
  const downlinkMbps = room.selectedModules.reduce(
    (total, module) => total + module.dataDownlinkMbps,
    0,
  );
  const dataRecoveryRatio = estimateDataRecoveryRatio(
    generatedMbps,
    downlinkMbps,
    room.mission,
  );
  const scienceScore =
    room.mission.targetSciencePoints > 0
      ? flightConfig.scoreWeights.science *
        Math.min(1, sciencePointsEarned / room.mission.targetSciencePoints)
      : 0;
  const dataScore =
    room.mission.requiredDownlinkRatio === 0
      ? flightConfig.scoreWeights.data
      : flightConfig.scoreWeights.data *
        Math.min(1, dataRecoveryRatio / room.mission.requiredDownlinkRatio);
  const resolvedIncidents = flight.incidents.filter((incident) => incident.resolved).length;
  const crisisResolved =
    flight.incidents.length > 0 && resolvedIncidents === flight.incidents.length;
  const operationsScore =
    flightConfig.scoreWeights.operations * (resolvedIncidents / flight.incidents.length);
  const score = Math.round(scienceScore + dataScore + operationsScore);
  const rootCauses: MissionReport['rootCauses'] = [];
  const recommendations: string[] = [];

  if (sciencePointsEarned < room.mission.targetSciencePoints) {
    rootCauses.push({
      code: 'SCIENCE_TARGET_MISSED',
      title: 'Objetivo científico incompleto',
      explanation: `Se obtuvieron ${sciencePointsEarned} de ${room.mission.targetSciencePoints} puntos científicos proyectados.`,
    });
    recommendations.push('Revisar la selección de instrumentos y sus dependencias antes del lanzamiento.');
  }
  if (dataRecoveryRatio < room.mission.requiredDownlinkRatio) {
    rootCauses.push({
      code: 'DATA_RECOVERY_BELOW_TARGET',
      title: 'Datos recuperados por debajo del objetivo',
      explanation: `La tasa estimada de recuperación fue ${(dataRecoveryRatio * 100).toFixed(0)}%, frente al ${(room.mission.requiredDownlinkRatio * 100).toFixed(0)}% requerido.`,
    });
    recommendations.push('Aumentar capacidad de enlace o reducir la generación de datos.');
  }
  for (const incident of flight.incidents) {
    if (incident.event.trigger !== 'NOMINAL' || !incident.resolved) {
      rootCauses.push({
        code: incident.event.id,
        title: incident.event.title,
        explanation: incident.resolved
          ? `${incident.event.rootCause} El equipo resolvió el incidente durante el vuelo.`
          : `${incident.event.rootCause} El incidente quedó sin resolver.`,
      });
    }
    if (!incident.resolved) {
      recommendations.push(incident.event.recommendation);
    }
  }
  for (const warning of room.audit.warnings) {
    if (
      (warning.code === 'STRUCTURAL_STRESS' || warning.code === 'POWER_DEFICIT') &&
      !flight.incidents.some((incident) => incident.event.trigger === warning.code)
    ) {
      rootCauses.push({
        code: warning.code,
        title: warning.message,
        explanation: crisisResolved
          ? `${warning.message} La alerta fue gestionada durante el vuelo.`
          : `${warning.message} La debilidad de diseño seguía presente al terminar el vuelo.`,
      });
    }
  }
  if (rootCauses.length === 0) {
    rootCauses.push({
      code: 'MISSION_OBJECTIVES_MET',
      title: 'Objetivos principales alcanzados',
      explanation: 'La misión cumplió los objetivos científicos y de recuperación de datos.',
    });
  }

  const outcome: MissionReport['outcome'] =
    score >= flightConfig.outcomeThresholds.success && crisisResolved
      ? 'SUCCESS'
      : score >= flightConfig.outcomeThresholds.partial
        ? 'PARTIAL'
        : 'FAILURE';

  return {
    roomId: room.roomId,
    outcome,
    score,
    sciencePointsEarned,
    dataRecoveryRatio,
    crisisResolved,
    incidents: flight.incidents.map((incident) => ({
      eventId: incident.event.id,
      title: incident.event.title,
      severity: incident.event.severity,
      progressPercent: incident.progressPercent,
      resolved: incident.resolved,
    })),
    rootCauses,
    recommendations: [...new Set(recommendations)],
    missionReference: room.mission.realNasaReference,
    flightDurationSeconds: flight.durationMs / 1000,
  };
}