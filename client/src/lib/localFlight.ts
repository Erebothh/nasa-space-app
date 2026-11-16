import type {
  AsymmetricFlightPayload,
  AuditIssue,
  FlightAct,
  FlightActionType,
  FlightCrisisAlert,
  FlightEventDefinition,
  FlightIncident,
  FlightOutcome,
  MissionConfig,
  MissionReport,
  ModuleItem,
  RoleType,
  TelemetryMetrics,
} from '@shared/types';
import { FLIGHT_CONFIG, FLIGHT_EVENTS, getCatalogGroundStation } from '../data/catalogs';
import { estimateDataRecoveryRatio } from './localEngine';

/**
 * Simulación de vuelo de la sesión offline: espejo de `server/src/flight` (loop.ts y
 * report.ts) y del filtro por rol de `server/src/sockets/asymmetry.ts`.
 */

export interface LocalFlightState {
  startedAt: number;
  durationMs: number;
  progress: number;
  act: FlightAct;
  activeEvent: FlightEventDefinition;
  activeIncidentIndex: number;
  incidents: FlightIncident[];
  crisisTriggered: boolean;
  crisisResolved: boolean;
  activeSensorIds: string[];
  disabledExperimentIds: string[];
  decisions: string[];
  role: RoleType;
  mission: MissionConfig;
  modules: ModuleItem[];
  telemetry: TelemetryMetrics;
  /** Alertas de la auditoría previa al lanzamiento; el informe las cita como causa raíz. */
  auditWarnings: AuditIssue[];
}

export interface LocalFlightAdvance {
  state: LocalFlightState;
  crisisStarted: boolean;
  newIncidents: FlightIncident[];
  completed: boolean;
}

function selectEvent(
  telemetry: TelemetryMetrics,
  mission: MissionConfig,
  random: () => number = Math.random,
): FlightEventDefinition[] {
  const recoveryRatio = estimateDataRecoveryRatio(
    telemetry.totalDataGenerated,
    telemetry.totalDownlinkCapacity,
    mission,
  );
  const trigger: FlightEventDefinition['trigger'] =
    telemetry.powerConsumedKw > telemetry.powerGeneratedKw
      ? 'POWER_DEFICIT'
      : telemetry.massPercentage > 90
        ? 'STRUCTURAL_STRESS'
        : recoveryRatio < mission.requiredDownlinkRatio
          ? 'LOW_DOWNLINK'
          : 'NOMINAL';
  const firstEvent = FLIGHT_EVENTS.find((candidate) => candidate.trigger === trigger);
  if (!firstEvent) {
    throw new Error(`No hay un evento de vuelo configurado para "${trigger}".`);
  }
  const remainingEvents = FLIGHT_EVENTS.filter((event) => event.id !== firstEvent.id);
  const events = [firstEvent];
  while (events.length < FLIGHT_CONFIG.eventProgressPercentages.length) {
    const sample = random();
    const index = Number.isFinite(sample)
      ? Math.min(remainingEvents.length - 1, Math.max(0, Math.floor(sample * remainingEvents.length)))
      : 0;
    events.push(remainingEvents.splice(index, 1)[0]);
  }
  return events;
}

export function createLocalFlight(input: {
  mission: MissionConfig;
  modules: ModuleItem[];
  telemetry: TelemetryMetrics;
  auditWarnings: AuditIssue[];
  role: RoleType;
  startedAt?: number;
}): LocalFlightState {
  const events = selectEvent(input.telemetry, input.mission);
  return {
    startedAt: input.startedAt ?? Date.now(),
    durationMs: FLIGHT_CONFIG.durationSeconds * 1000,
    progress: 0,
    act: 'ASCENT_INSERTION',
    activeEvent: events[0],
    activeIncidentIndex: -1,
    incidents: events.map((event, index) => ({
      event,
      progressPercent: FLIGHT_CONFIG.eventProgressPercentages[index],
      triggered: false,
      resolved: false,
    })),
    crisisTriggered: false,
    crisisResolved: false,
    activeSensorIds: input.modules
      .filter((module) => module.category === 'SCI')
      .map((module) => module.id),
    disabledExperimentIds: [],
    decisions: [],
    role: input.role,
    mission: input.mission,
    modules: input.modules,
    telemetry: input.telemetry,
    auditWarnings: input.auditWarnings,
  };
}

export function advanceLocalFlight(
  current: LocalFlightState,
  now: number,
): LocalFlightAdvance {
  const elapsedMs = Math.max(0, now - current.startedAt);
  const progress = Math.min(100, (elapsedMs / current.durationMs) * 100);
  const act: FlightAct =
    progress < FLIGHT_CONFIG.crisisProgressPercent
      ? 'ASCENT_INSERTION'
      : progress < FLIGHT_CONFIG.crisisActEndPercent
        ? 'CRISIS'
        : 'OPERATIONS';
  const newIncidents = current.incidents
    .filter((incident) => !incident.triggered && progress >= incident.progressPercent)
    .map((incident) => ({ ...incident, triggered: true }));
  const incidents = current.incidents.map((incident) =>
    !incident.triggered && progress >= incident.progressPercent
      ? { ...incident, triggered: true }
      : incident,
  );
  const activeIncidentIndex =
    newIncidents.length > 0
      ? incidents.findIndex(
          (incident) =>
            incident.event.id === newIncidents[newIncidents.length - 1].event.id,
        )
      : current.activeIncidentIndex;
  const activeIncident =
    activeIncidentIndex >= 0 ? incidents[activeIncidentIndex] : null;
  const crisisStarted = newIncidents.length > 0;

  return {
    state: {
      ...current,
      progress,
      act,
      incidents,
      activeEvent: activeIncident?.event ?? current.activeEvent,
      activeIncidentIndex,
      crisisTriggered: activeIncidentIndex >= 0,
      crisisResolved: activeIncident?.resolved ?? current.crisisResolved,
    },
    crisisStarted,
    newIncidents,
    completed: progress >= 100,
  };
}

export function buildCrisisAlert(state: LocalFlightState): FlightCrisisAlert | null {
  if (!state.crisisTriggered) return null;
  return {
    eventId: state.activeEvent.id,
    title: state.activeEvent.title,
    severity: state.activeEvent.severity,
    description: state.activeEvent.description,
    eventNumber: state.activeIncidentIndex + 1,
    totalEvents: state.incidents.length,
  };
}

function resolveActiveIncident(current: LocalFlightState): LocalFlightState {
  if (current.activeIncidentIndex < 0) {
    throw new Error('No hay un incidente activo para resolver.');
  }
  return {
    ...current,
    crisisResolved: true,
    incidents: current.incidents.map((incident, index) =>
      index === current.activeIncidentIndex ? { ...incident, resolved: true } : incident,
    ),
  };
}

export function buildLocalPayload(state: LocalFlightState): AsymmetricFlightPayload {
  const base = { progress: state.progress, act: state.act };

  if (state.role === 'COMMS') {
    const station = getCatalogGroundStation(state.mission);
    const elapsedSeconds = ((state.progress / 100) * state.durationMs) / 1000;
    const phaseOfWindow = elapsedSeconds % station.windowPeriodSeconds;
    return {
      ...base,
      role: 'COMMS',
      trajectory: FLIGHT_CONFIG.trajectoryByOrbit[state.mission.orbitType],
      threats: state.crisisTriggered
        ? [
            {
              eventId: state.activeEvent.id,
              title: state.activeEvent.title,
              severity: state.activeEvent.severity,
              description: state.activeEvent.description,
              eventNumber: state.activeIncidentIndex + 1,
              totalEvents: state.incidents.length,
            },
          ]
        : [],
      downlinkWindowOpen: phaseOfWindow < station.windowDurationSeconds,
    };
  }

  if (state.role === 'PROPULSION') {
    const progressFactor = state.progress / 100;
    return {
      ...base,
      role: 'PROPULSION',
      internal: {
        fuelPercent: Math.max(
          0,
          FLIGHT_CONFIG.baseFuelPercent -
            progressFactor * FLIGHT_CONFIG.fuelConsumptionPercentPerProgress * 100,
        ),
        temperatureC:
          FLIGHT_CONFIG.baseTemperatureC +
          state.telemetry.massPercentage * FLIGHT_CONFIG.temperatureRiseCPerMassPercent +
          progressFactor * FLIGHT_CONFIG.temperatureRiseCAtFullProgress,
        integrityPercent: Math.max(
          0,
          100 - state.telemetry.structuralRisk * FLIGHT_CONFIG.integrityLossPerStructuralRisk,
        ),
        energyBalanceKw:
          state.telemetry.powerGeneratedKw - state.telemetry.powerConsumedKw,
      },
      repairPuzzle:
        state.crisisTriggered &&
        !state.crisisResolved &&
        state.activeEvent.puzzle?.role === 'PROPULSION'
          ? {
              id: state.activeEvent.puzzle.id,
              prompt: state.activeEvent.puzzle.prompt,
            }
          : null,
    };
  }

  if (state.role === 'SCIENCE') {
    return {
      ...base,
      role: 'SCIENCE',
      sensors: state.modules
        .filter((module) => module.category === 'SCI')
        .map((module) => ({
          moduleId: module.id,
          name: module.name,
          active: state.activeSensorIds.includes(module.id),
          dataGenMbps: module.dataGenMbps,
        })),
      calibrationPuzzle:
        state.crisisTriggered &&
        !state.crisisResolved &&
        state.activeEvent.puzzle?.role === 'SCIENCE'
          ? {
              id: state.activeEvent.puzzle.id,
              prompt: state.activeEvent.puzzle.prompt,
            }
          : null,
    };
  }

  const activeExperiments = state.modules.filter(
    (module) =>
      module.category === 'SCI' && !state.disabledExperimentIds.includes(module.id),
  );
  const projectedPoints = activeExperiments.reduce(
    (total, module) => total + module.sciencePoints,
    0,
  );
  return {
    ...base,
    role: 'DIRECTOR',
    science: {
      projectedPoints,
      targetPoints: state.mission.targetSciencePoints,
      progressPercent:
        state.mission.targetSciencePoints > 0
          ? Math.min(100, (projectedPoints / state.mission.targetSciencePoints) * 100)
          : 0,
    },
    crisisDecisionAvailable: state.crisisTriggered && !state.crisisResolved,
    activeExperimentIds: activeExperiments.map((module) => module.id),
  };
}

function readString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`La acción de vuelo requiere el campo "${key}".`);
  }
  return value.trim();
}

export function applyLocalAction(
  current: LocalFlightState,
  actionType: FlightActionType,
  payload: Record<string, unknown>,
): LocalFlightState {
  if (actionType === 'SOLVE_PUZZLE') {
    if (!current.crisisTriggered) {
      throw new Error('El acertijo estará disponible cuando se active un incidente.');
    }
    if (current.crisisResolved) {
      throw new Error('El incidente activo ya está resuelto.');
    }
    if (!current.activeEvent.puzzle) {
      throw new Error('No hay un acertijo de crisis activo.');
    }
    if (current.role !== current.activeEvent.puzzle.role) {
      throw new Error('El acertijo solo puede resolverlo el rol asignado.');
    }
    const puzzleId = readString(payload, 'puzzleId');
    const answer = readString(payload, 'answer').toUpperCase();
    if (
      puzzleId !== current.activeEvent.puzzle.id ||
      answer !== current.activeEvent.puzzle.answer
    ) {
      throw new Error('La respuesta del acertijo no es correcta.');
    }
    return resolveActiveIncident(current);
  }

  if (actionType === 'TOGGLE_SENSOR') {
    if (current.role !== 'SCIENCE') {
      throw new Error('Solo el rol de Ciencia puede cambiar el estado de los sensores.');
    }
    const moduleId = readString(payload, 'moduleId');
    const enabled = payload.enabled;
    if (typeof enabled !== 'boolean') {
      throw new Error('La acción del sensor requiere un valor enabled booleano.');
    }
    const sensor = current.modules.find(
      (module) => module.id === moduleId && module.category === 'SCI',
    );
    if (!sensor) {
      throw new Error('El sensor indicado no está instalado en esta nave.');
    }
    const activeSensorIds = enabled
      ? [...new Set([...current.activeSensorIds, moduleId])]
      : current.activeSensorIds.filter((id) => id !== moduleId);
    const disabledExperimentIds = enabled
      ? current.disabledExperimentIds.filter((id) => id !== moduleId)
      : [...new Set([...current.disabledExperimentIds, moduleId])];
    return { ...current, activeSensorIds, disabledExperimentIds };
  }

  if (current.role !== 'DIRECTOR') {
    throw new Error('Solo el Director de Misión puede tomar decisiones ejecutivas.');
  }
  if (!current.crisisTriggered) {
    throw new Error('La decisión ejecutiva estará disponible cuando se active un incidente.');
  }
  if (current.crisisResolved) {
    throw new Error('El incidente activo ya está resuelto.');
  }
  if (payload.decision !== 'SACRIFICE_EXPERIMENT') {
    throw new Error('La decisión ejecutiva solicitada no es válida.');
  }
  const moduleId = readString(payload, 'moduleId');
  const experiment = current.modules.find(
    (module) => module.id === moduleId && module.category === 'SCI',
  );
  if (!experiment || current.disabledExperimentIds.includes(moduleId)) {
    throw new Error('El experimento no está activo o ya fue sacrificado.');
  }
  return resolveActiveIncident({
    ...current,
    activeSensorIds: current.activeSensorIds.filter((id) => id !== moduleId),
    disabledExperimentIds: [...current.disabledExperimentIds, moduleId],
    decisions: [...current.decisions, `SACRIFICE_EXPERIMENT:${moduleId}`],
  });
}

export function buildLocalReport(
  state: LocalFlightState,
  roomId = 'LOCAL-ROOM',
): MissionReport {
  const activeModules = state.modules.filter(
    (module) => !state.disabledExperimentIds.includes(module.id),
  );
  const sciencePointsEarned = activeModules
    .filter((module) => module.category === 'SCI')
    .reduce((total, module) => total + module.sciencePoints, 0);
  const dataGeneratedMbps = activeModules.reduce(
    (total, module) => total + module.dataGenMbps,
    0,
  );
  const downlinkMbps = state.modules.reduce(
    (total, module) => total + module.dataDownlinkMbps,
    0,
  );
  const dataRecoveryRatio = estimateDataRecoveryRatio(
    dataGeneratedMbps,
    downlinkMbps,
    state.mission,
  );
  const scienceScore =
    state.mission.targetSciencePoints > 0
      ? FLIGHT_CONFIG.scoreWeights.science *
        Math.min(1, sciencePointsEarned / state.mission.targetSciencePoints)
      : 0;
  const dataScore =
    state.mission.requiredDownlinkRatio === 0
      ? FLIGHT_CONFIG.scoreWeights.data
      : FLIGHT_CONFIG.scoreWeights.data *
        Math.min(1, dataRecoveryRatio / state.mission.requiredDownlinkRatio);
  const resolvedIncidents = state.incidents.filter((incident) => incident.resolved).length;
  const crisisResolved =
    state.incidents.length > 0 && resolvedIncidents === state.incidents.length;
  const operationsScore =
    FLIGHT_CONFIG.scoreWeights.operations * (resolvedIncidents / state.incidents.length);
  const score = Math.round(scienceScore + dataScore + operationsScore);

  const rootCauses: MissionReport['rootCauses'] = [];
  const recommendations: string[] = [];

  if (sciencePointsEarned < state.mission.targetSciencePoints) {
    rootCauses.push({
      code: 'SCIENCE_TARGET_MISSED',
      title: 'Objetivo científico incompleto',
      explanation: `Se obtuvieron ${sciencePointsEarned} de ${state.mission.targetSciencePoints} puntos científicos proyectados.`,
    });
    recommendations.push(
      'Revisar la selección de instrumentos y sus dependencias antes del lanzamiento.',
    );
  }
  if (dataRecoveryRatio < state.mission.requiredDownlinkRatio) {
    rootCauses.push({
      code: 'DATA_RECOVERY_BELOW_TARGET',
      title: 'Datos recuperados por debajo del objetivo',
      explanation: `La tasa estimada de recuperación fue ${(dataRecoveryRatio * 100).toFixed(0)}%, frente al ${(state.mission.requiredDownlinkRatio * 100).toFixed(0)}% requerido.`,
    });
    recommendations.push(
      'Aumentar capacidad de enlace o reducir la generación de datos.',
    );
  }
  for (const incident of state.incidents) {
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
  for (const warning of state.auditWarnings) {
    if (
      (warning.code === 'STRUCTURAL_STRESS' || warning.code === 'POWER_DEFICIT') &&
      !state.incidents.some((incident) => incident.event.trigger === warning.code)
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
      explanation:
        'La misión cumplió los objetivos científicos y de recuperación de datos.',
    });
  }

  const outcome: FlightOutcome =
    score >= FLIGHT_CONFIG.outcomeThresholds.success && crisisResolved
      ? 'SUCCESS'
      : score >= FLIGHT_CONFIG.outcomeThresholds.partial
        ? 'PARTIAL'
        : 'FAILURE';

  return {
    roomId,
    outcome,
    score,
    sciencePointsEarned,
    dataRecoveryRatio,
    crisisResolved,
    incidents: state.incidents.map((incident) => ({
      eventId: incident.event.id,
      title: incident.event.title,
      severity: incident.event.severity,
      progressPercent: incident.progressPercent,
      resolved: incident.resolved,
    })),
    rootCauses,
    recommendations: [...new Set(recommendations)],
    missionReference: state.mission.realNasaReference,
    flightDurationSeconds: state.durationMs / 1000,
  };
}
