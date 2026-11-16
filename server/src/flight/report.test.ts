import { describe, expect, it } from 'vitest';
import { getMissionById } from '../catalog.js';
import { RoomService } from '../sockets/room-service.js';
import { createFlightRuntime } from './loop.js';
import { generateMissionReport } from './report.js';

describe('generateMissionReport', () => {
  it('explains missed objectives and scores the data actually downlinked', () => {
    const rooms = new RoomService();
    const lobby = rooms.createRoom('solo', {
      roomId: 'REPORT1',
      playerName: 'Scientist',
      difficulty: 'APPRENTICE',
    });
    rooms.selectRole('REPORT1', 'solo', 'SCIENCE');
    rooms.startDesign('REPORT1', 'solo');
    rooms.proposeModule('REPORT1', 'solo', 'SCI-01', 'ADD');
    rooms.selectRole('REPORT1', 'solo', 'COMMS');
    rooms.proposeModule('REPORT1', 'solo', 'COM-02', 'ADD');
    const { state } = rooms.startFlight('REPORT1', 'solo');
    const runtime = createFlightRuntime(
      state.roomId,
      0,
      getMissionById('leo-earth-observation'),
      state.selectedModules,
      state.telemetry,
    );
    const flight = {
      ...runtime,
      progress: 100,
      incidents: runtime.incidents.map((incident) => ({
        ...incident,
        triggered: true,
        resolved: true,
      })),
      activeIncidentIndex: 2,
      crisisTriggered: true,
      crisisResolved: true,
    };

    const report = generateMissionReport(state, flight);

    expect(report.outcome).toBe('PARTIAL');
    expect(report.sciencePointsEarned).toBe(18);
    expect(report.dataRecoveryRatio).toBeGreaterThanOrEqual(0.75);
    expect(report.incidents).toHaveLength(3);
    expect(report.incidents.every((incident) => incident.resolved)).toBe(true);
    expect(report.rootCauses.map((cause) => cause.code)).toContain('SCIENCE_TARGET_MISSED');
    expect(report.missionReference.missionName).toBe('PUNCH');
  });
});
