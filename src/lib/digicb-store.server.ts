// DigiCB store: persistence + seeding. Server-only.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  DB,
  User,
  Branch,
  AuditLog,
  Notification,
  Task,
  Approval,
  CalendarEvent,
  Organization,
} from "./digicb-types";

const DATA_FILE = "/tmp/digicb-db.json";
const SESSION_SALT = "digicb-demo-salt-v1";
export const DEMO_MODE = process.env.DIGICB_DEMO_MODE !== "false";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8h
const LOCK_THRESHOLD = 5;
const LOCK_MINUTES = 15;

export { SESSION_SALT, SESSION_MAX_AGE, LOCK_THRESHOLD, LOCK_MINUTES };

export function hashPassword(pw: string): string {
  return createHash("sha256")
    .update(SESSION_SALT + pw)
    .digest("hex");
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function now(): number {
  return Date.now();
}

export function logEntry(actor: string, action: string, detail: string, ip?: string): AuditLog {
  return { id: uid("log"), ts: now(), actor, action, detail, ip };
}

let cache: DB | null = null;

export function loadDB(): DB {
  if (cache) return cache;
  if (existsSync(DATA_FILE)) {
    try {
      cache = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as DB;
      return cache;
    } catch {
      // fall through to seed
    }
  }
  cache = seed();
  saveDB();
  return cache;
}

export function saveDB(): void {
  try {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error("DigiCB store save failed", e);
  }
}

function mkUser(
  id: string,
  name: string,
  email: string,
  passwordHash: string,
  role: string,
  branchId: string,
  title: string,
  mfaEnabled: boolean,
  mfaCode?: string,
  demo = true,
): User {
  return {
    id,
    name,
    email,
    passwordHash,
    role,
    branchId,
    status: "active",
    title,
    mfaEnabled,
    mfaCode,
    failedAttempts: 0,
    lockedUntil: null,
    lastLogin: null,
    createdAt: now(),
    demo,
  };
}

function mkNotif(
  userId: string,
  title: string,
  body: string,
  category: string,
  link?: string,
): Notification {
  return { id: uid("ntf"), userId, title, body, category, read: false, ts: now(), link };
}

function mkTask(
  title: string,
  type: string,
  priority: Task["priority"],
  due: string,
  status: Task["status"],
  assigneeId: string,
  related?: string,
): Task {
  return { id: uid("tsk"), title, type, priority, due, status, assigneeId, related };
}

function mkApp(
  title: string,
  docNumber: string,
  type: string,
  submittedBy: string,
  submittedAt: string,
  stage: Approval["stage"],
  framework: string,
): Approval {
  return { id: uid("app"), title, docNumber, type, submittedBy, submittedAt, stage, framework };
}

function mkCal(
  title: string,
  category: string,
  date: string,
  owner: string,
  recurrence: string,
  status: CalendarEvent["status"],
): CalendarEvent {
  return { id: uid("cal"), title, category, date, owner, recurrence, status };
}

function seed(): DB {
  const adminPw = hashPassword("DigiCB@Test2026!");
  const demoPw = hashPassword("DigiCB@Demo2026!");

  const branches: Branch[] = [
    {
      id: "br_ho",
      name: "Head Office — DigiCB",
      type: "head_office",
      country: "AE",
      city: "Dubai",
      manager: "admin@digicb.test",
      status: "active",
    },
    {
      id: "br_ruh",
      name: "Riyadh Branch",
      type: "national",
      country: "SA",
      city: "Riyadh",
      manager: "branch@digicb.test",
      status: "active",
    },
    {
      id: "br_khi",
      name: "Karachi Branch",
      type: "international",
      country: "PK",
      city: "Karachi",
      manager: "khi@digicb.test",
      status: "active",
    },
  ];

  const users: User[] = [
    mkUser(
      "u_admin",
      "DigiCB Test Administrator",
      "admin@digicb.test",
      adminPw,
      "Super administrator",
      "br_ho",
      "Chief Executive",
      true,
      "123456",
      true,
    ),
    mkUser(
      "u_cm",
      "Amira Haddad",
      "cert.mgr@digicb.test",
      demoPw,
      "Certification manager",
      "br_ho",
      "Certification Manager",
      false,
    ),
    mkUser(
      "u_qm",
      "Bilal Rahman",
      "quality@digicb.test",
      demoPw,
      "Quality manager",
      "br_ho",
      "Quality Manager",
      false,
    ),
    mkUser(
      "u_apm",
      "Sara Khan",
      "audit.prog@digicb.test",
      demoPw,
      "Audit-program manager",
      "br_ho",
      "Audit Programme Manager",
      false,
    ),
    mkUser(
      "u_atl",
      "Omar Saleh",
      "auditor1@digicb.test",
      demoPw,
      "Audit team leader",
      "br_ruh",
      "Lead Auditor",
      false,
    ),
    mkUser(
      "u_aud2",
      "Layla Mansour",
      "auditor2@digicb.test",
      demoPw,
      "Auditor",
      "br_ruh",
      "Auditor",
      false,
    ),
    mkUser(
      "u_aud3",
      "Yusuf Ali",
      "auditor3@digicb.test",
      demoPw,
      "Auditor",
      "br_khi",
      "Auditor",
      false,
    ),
    mkUser(
      "u_aud4",
      "Noor Ismail",
      "auditor4@digicb.test",
      demoPw,
      "Auditor",
      "br_ho",
      "Auditor",
      false,
    ),
    mkUser(
      "u_aud5",
      "Hassan Tariq",
      "auditor5@digicb.test",
      demoPw,
      "Auditor",
      "br_khi",
      "Auditor",
      false,
    ),
    mkUser(
      "u_exp1",
      "Dr. Khaled N.",
      "expert1@digicb.test",
      demoPw,
      "Technical expert",
      "br_ho",
      "Food Safety Expert",
      false,
    ),
    mkUser(
      "u_exp2",
      "Dr. Mona S.",
      "expert2@digicb.test",
      demoPw,
      "Technical expert",
      "br_khi",
      "AI Systems Expert",
      false,
    ),
    mkUser(
      "u_rev1",
      "Imran Sheikh",
      "reviewer1@digicb.test",
      demoPw,
      "Technical reviewer",
      "br_ho",
      "Technical Reviewer",
      false,
    ),
    mkUser(
      "u_rev2",
      "Fatima Zahra",
      "reviewer2@digicb.test",
      demoPw,
      "Technical reviewer",
      "br_ruh",
      "Technical Reviewer",
      false,
    ),
    mkUser(
      "u_dec1",
      "Tariq Mahmood",
      "decider1@digicb.test",
      demoPw,
      "Independent certification decision-maker",
      "br_ho",
      "Decision Maker",
      false,
    ),
    mkUser(
      "u_dec2",
      "Reem Al-Farsi",
      "decider2@digicb.test",
      demoPw,
      "Independent certification decision-maker",
      "br_ruh",
      "Decision Maker",
      false,
    ),
    mkUser(
      "u_dc",
      "Samiullah",
      "doc.control@digicb.test",
      demoPw,
      "Document controller",
      "br_ho",
      "Document Controller",
      false,
    ),
    mkUser(
      "u_tr1",
      "Aisha Noor",
      "trainer1@digicb.test",
      demoPw,
      "Trainer",
      "br_ho",
      "Lead Auditor Trainer",
      false,
    ),
    mkUser(
      "u_fin",
      "Kamran Iqbal",
      "finance@digicb.test",
      demoPw,
      "Finance officer",
      "br_ho",
      "Finance Officer",
      false,
    ),
    mkUser(
      "u_bm",
      "Zainab Ali",
      "branch@digicb.test",
      demoPw,
      "Branch manager",
      "br_ruh",
      "Branch Manager",
      false,
    ),
    mkUser(
      "u_khi",
      "Usman Ghani",
      "khi@digicb.test",
      demoPw,
      "Branch manager",
      "br_khi",
      "Branch Manager",
      false,
    ),
  ];

  const auditLogs: AuditLog[] = [
    logEntry("system", "system.seed", "DEMO data seeded for DigiCB Sprint 1"),
  ];

  const notifications: Notification[] = [
    mkNotif(
      "u_admin",
      "Application awaiting review",
      "Gulf Foods LLC submitted an ISO 9001 application",
      "applications",
      "applications",
    ),
    mkNotif("u_admin", "NCR overdue", "NCR-0028 correction is 3 days overdue", "ncr", "ncr"),
    mkNotif(
      "u_admin",
      "Certificate expiring",
      "CERT-1009 expires in 30 days",
      "certificates",
      "certificates",
    ),
    mkNotif(
      "u_admin",
      "Document pending approval",
      "QMS-AUD-PRO-014 awaits your approval",
      "documents",
      "documents",
    ),
    mkNotif(
      "u_admin",
      "Audit scheduled",
      "Stage 2 audit for Horizon Tech on 2026-10-02",
      "audits",
      "audits",
    ),
    mkNotif(
      "u_admin",
      "Accreditation transition",
      "Global ACI MD 1 effective 2026-03-01 — review transition plan",
      "frameworks",
      "frameworks",
    ),
  ];

  const tasks: Task[] = [
    mkTask(
      "Review Gulf Foods application",
      "Application review",
      "high",
      "2026-09-25",
      "open",
      "u_admin",
      "APP-0042",
    ),
    mkTask(
      "Approve QMS-AUD-PRO-014",
      "Approval",
      "urgent",
      "2026-09-22",
      "overdue",
      "u_admin",
      "DOC-014",
    ),
    mkTask(
      "Verify NCR-0028 evidence",
      "NCR verification",
      "high",
      "2026-09-28",
      "open",
      "u_admin",
      "NCR-0028",
    ),
    mkTask(
      "Confirm audit team for Horizon Tech",
      "Audit planning",
      "medium",
      "2026-09-30",
      "open",
      "u_admin",
      "PROJ-0017",
    ),
    mkTask(
      "Sign technical review TR-0091",
      "Technical review",
      "high",
      "2026-10-01",
      "open",
      "u_admin",
      "TR-0091",
    ),
    mkTask(
      "Renew auditor authorization — O. Saleh",
      "Competence",
      "medium",
      "2026-10-05",
      "open",
      "u_admin",
      "AUTH-0034",
    ),
    mkTask(
      "Prepare management review minutes",
      "Internal MS",
      "medium",
      "2026-10-10",
      "open",
      "u_admin",
      "MR-2026-Q3",
    ),
    mkTask(
      "Respond to complaint CMP-0012",
      "Complaint",
      "high",
      "2026-09-26",
      "in_progress",
      "u_admin",
      "CMP-0012",
    ),
  ];

  const approvals: Approval[] = [
    mkApp(
      "QMS-AUD-PRO-014 · Stage 2 Audit Procedure",
      "QMS-AUD-PRO-014",
      "Procedure",
      "u_dc",
      "2026-09-18",
      "review",
      "17021",
    ),
    mkApp(
      "HAL-FRM-001 · Halal Application Form",
      "HAL-FRM-001",
      "Form",
      "u_dc",
      "2026-09-16",
      "changes",
      "ps4992",
    ),
    mkApp(
      "PER-CL-007 · Competence Matrix Policy",
      "PER-CL-007",
      "Policy",
      "u_qm",
      "2026-09-20",
      "review",
      "global",
    ),
    mkApp(
      "NCR-0028 · Verification Record",
      "NCR-0028",
      "NCR record",
      "u_atl",
      "2026-09-19",
      "review",
      "17021",
    ),
    mkApp(
      "TR-0091 · Technical Review Checklist",
      "TR-0091",
      "Technical review",
      "u_rev1",
      "2026-09-21",
      "review",
      "17021",
    ),
  ];

  const calendar: CalendarEvent[] = [
    mkCal(
      "Internal audit — Sales process",
      "Internal audit",
      "2026-09-28",
      "u_qm",
      "Quarterly",
      "scheduled",
    ),
    mkCal(
      "Management review Q3",
      "Management review",
      "2026-10-10",
      "u_admin",
      "Quarterly",
      "scheduled",
    ),
    mkCal(
      "Impartiality committee meeting",
      "Impartiality",
      "2026-10-15",
      "u_admin",
      "Quarterly",
      "scheduled",
    ),
    mkCal("Document review cycle", "Document review", "2026-09-30", "u_dc", "Monthly", "scheduled"),
    mkCal(
      "Auditor performance monitoring",
      "Competence",
      "2026-10-20",
      "u_apm",
      "Quarterly",
      "scheduled",
    ),
    mkCal("Backup restoration test", "Security", "2026-10-01", "u_admin", "Monthly", "scheduled"),
    mkCal(
      "Accreditation surveillance — Global ACI",
      "Accreditation",
      "2026-11-05",
      "u_admin",
      "Annual",
      "scheduled",
    ),
  ];

  const organization: Organization = {
    name: "DigiCB Certification Body",
    legalName: "DigiCB Conformity Assessment Body Inc.",
    taxId: "AE-CAB-0000-DIGICB",
    website: "https://digicb.example",
    email: "info@digicb.example",
    phone: "+971 4 000 0000",
    address: "Dubai International Financial Centre, Dubai, UAE",
    logoText: "DigiCB",
    primaryColor: "navy",
  };

  return {
    organization,
    branches,
    users,
    auditLogs,
    notifications,
    tasks,
    approvals,
    calendar,
    sessions: {},
    challenges: {},
  };
}
