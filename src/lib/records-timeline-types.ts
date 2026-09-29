// Client-safe types for the certification timeline. The server implementation
// lives in records-timeline.server.ts and mirrors these shapes.
export interface TimelineStep {
  id: string;
  order: number;
  phase: string;
  process: string;
  status: string;
  actor: string;
  role: string;
  date: string | null;
  dateTime: number | null;
  recordNumber: string;
  recordCollection: string;
  recordId: string;
  detail: string;
  completed: boolean;
}

export interface CertificationTimeline {
  clientName: string;
  clientId: string | null;
  framework: string | null;
  standard: string | null;
  certificateNumber: string | null;
  certificateStatus: string | null;
  steps: TimelineStep[];
  milestones: TimelineStep[];
}
