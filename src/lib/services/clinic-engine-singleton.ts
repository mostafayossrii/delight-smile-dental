import { ClinicEngine } from './clinic-engine.mjs';

// Global singleton to preserve state in server runtime during session
const globalForClinic = globalThis as unknown as {
  clinicEngineInstance?: ClinicEngine;
};

export const sharedEngine = globalForClinic.clinicEngineInstance ?? new ClinicEngine();

if (process.env.NODE_ENV !== 'production') {
  globalForClinic.clinicEngineInstance = sharedEngine;
}
