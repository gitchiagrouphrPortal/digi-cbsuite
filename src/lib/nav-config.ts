// DigiCB sidebar navigation configuration. Each module is permission-gated
// by the user's module list. Submodules map to real routes.
export interface SubItem {
  label: string;
  to: string;
}
export interface NavModule {
  key: string;
  label: string;
  icon: string;
  children: SubItem[];
}

const dash: SubItem[] = [
  { label: "Executive Dashboard", to: "/app/dashboard" },
  { label: "My Tasks", to: "/app/my-tasks" },
  { label: "Pending Approvals", to: "/app/approvals" },
  { label: "Compliance Calendar", to: "/app/calendar" },
  { label: "Notifications", to: "/app/notifications" },
  { label: "Reports Summary", to: "/app/reports" },
];
const crm: SubItem[] = [
  { label: "Leads & Inquiries", to: "/app/crm/leads" },
  { label: "Organizations", to: "/app/crm/clients" },
  { label: "Opportunities", to: "/app/crm/opportunities" },
  { label: "Quotations", to: "/app/crm/quotations" },
  { label: "Contracts", to: "/app/crm/contracts" },
  { label: "Communication History", to: "/app/crm/comms" },
  { label: "Client Feedback", to: "/app/crm/feedback" },
];
const apps: SubItem[] = [
  { label: "New Application", to: "/app/applications/new" },
  { label: "All Applications", to: "/app/applications" },
  { label: "Application Review", to: "/app/applications/review" },
  { label: "Audit-Duration Calculation", to: "/app/applications/duration" },
  { label: "Conflict & Impartiality Check", to: "/app/applications/conflict" },
  { label: "Approved Applications", to: "/app/applications/approved" },
];
const projects: SubItem[] = [
  { label: "All Projects", to: "/app/projects" },
  { label: "Certification Kanban", to: "/app/projects/kanban" },
  { label: "Surveillance", to: "/app/projects/surveillance" },
  { label: "Recertification", to: "/app/projects/recertification" },
  { label: "Suspension & Withdrawal", to: "/app/projects/suspension" },
  { label: "Transition Projects", to: "/app/projects/transition" },
];
const audits: SubItem[] = [
  { label: "Audit Programmes", to: "/app/audits/programmes" },
  { label: "Audit Calendar", to: "/app/audits/calendar" },
  { label: "Audit Scheduling", to: "/app/audits/scheduling" },
  { label: "Audit Teams", to: "/app/audits/teams" },
  { label: "Audit Reports", to: "/app/audits/reports" },
  { label: "Witness Audits", to: "/app/audits/witness" },
];
const ncr: SubItem[] = [
  { label: "All NCRs", to: "/app/ncr" },
  { label: "NCR Kanban", to: "/app/ncr/kanban" },
  { label: "Major NCRs", to: "/app/ncr/major" },
  { label: "Minor NCRs", to: "/app/ncr/minor" },
  { label: "Corrective Actions", to: "/app/ncr/corrective" },
  { label: "Overdue NCRs", to: "/app/ncr/overdue" },
  { label: "NCR Analytics", to: "/app/ncr/analytics" },
];
const decisions: SubItem[] = [
  { label: "Pending Technical Reviews", to: "/app/decisions/reviews" },
  { label: "Pending Certification Decisions", to: "/app/decisions/pending" },
  { label: "Approved Decisions", to: "/app/decisions/approved" },
  { label: "Certification Committee", to: "/app/decisions/committee" },
];
const certs: SubItem[] = [
  { label: "Certificate Register", to: "/app/certificates" },
  { label: "Issued Certificates", to: "/app/certificates/issued" },
  { label: "Expiring Certificates", to: "/app/certificates/expiring" },
  { label: "Suspended Certificates", to: "/app/certificates/suspended" },
  { label: "Public Verification", to: "/verify" },
  { label: "Certificate Templates", to: "/app/certificates/templates" },
  { label: "Lifecycle Timeline", to: "/app/certificates/timeline" },
];
const docs: SubItem[] = [
  { label: "Master Document List", to: "/app/documents" },
  { label: "Documents Under Review", to: "/app/documents/review" },
  { label: "Documents Awaiting Approval", to: "/app/documents/approvals" },
  { label: "Published Documents", to: "/app/documents/published" },
  { label: "Superseded Documents", to: "/app/documents/superseded" },
  { label: "Document Comparison", to: "/app/documents/compare" },
  { label: "Standards Library", to: "/app/documents/standards" },
];
const conformity: SubItem[] = [
  { label: "Conformity Dashboard", to: "/app/conformity" },
  { label: "Framework Register", to: "/app/conformity/frameworks" },
  { label: "Standards Register", to: "/app/conformity/standards" },
  { label: "Clause Library", to: "/app/conformity/clauses" },
  { label: "Clause Applicability", to: "/app/conformity/applicability" },
  { label: "Module-Clause Matrix", to: "/app/conformity/matrix" },
  { label: "Conformity Reference Matrix", to: "/app/conformity/reference" },
  { label: "Evidence Register", to: "/app/conformity/evidence" },
  { label: "Clause Assessments", to: "/app/conformity/assessments" },
  { label: "Compliance Status", to: "/app/conformity/status" },
  { label: "Compliance Gap Analysis", to: "/app/conformity/gap" },
  { label: "Accreditation Readiness", to: "/app/conformity/readiness" },
  { label: "Cross-Framework Mapping", to: "/app/conformity/cross-framework" },
  { label: "Mandatory Documents", to: "/app/conformity/mandatory-docs" },
  { label: "Transition Management", to: "/app/conformity/transition" },
  { label: "Reassessment Reminders", to: "/app/conformity/reminders" },
  { label: "Assessment History", to: "/app/conformity/history" },
  { label: "Conformity Reports", to: "/app/conformity/reports" },
];
const frameworks: SubItem[] = [
  { label: "Framework Dashboard", to: "/app/frameworks" },
  { label: "ISO/IEC 17021-1", to: "/app/frameworks/17021" },
  { label: "PS 4992", to: "/app/frameworks/ps4992" },
  { label: "ISO/IEC 17024", to: "/app/frameworks/17024" },
  { label: "ISO/IEC 17065", to: "/app/frameworks/17065" },
  { label: "IAF / Global ACI Documents", to: "/app/frameworks/library" },
  { label: "Accreditation Findings", to: "/app/frameworks/findings" },
  { label: "Transition Plans", to: "/app/frameworks/transition" },
];
const personnel: SubItem[] = [
  { label: "Personnel Register", to: "/app/personnel" },
  { label: "Auditor Register", to: "/app/personnel/auditors" },
  { label: "Technical Experts", to: "/app/personnel/experts" },
  { label: "Decision-Makers", to: "/app/personnel/deciders" },
  { label: "Competence Matrix", to: "/app/personnel/competence" },
  { label: "Authorization Matrix", to: "/app/personnel/authorization" },
  { label: "Expiring Authorizations", to: "/app/personnel/expiring" },
  { label: "Competence Gaps", to: "/app/personnel/gaps" },
];
const risks: SubItem[] = [
  { label: "Enterprise Risk Dashboard", to: "/app/risks" },
  { label: "Framework Risks", to: "/app/risks/framework" },
  { label: "Impartiality Risks", to: "/app/risks/impartiality" },
  { label: "Certification Process Risks", to: "/app/risks/certification" },
  { label: "Operational Risks", to: "/app/risks/operational" },
  { label: "Branch Risks", to: "/app/risks/branch" },
  { label: "Information Security Risks", to: "/app/risks/security" },
  { label: "Overdue Actions", to: "/app/risks/overdue" },
  { label: "Risk Reports", to: "/app/risks/reports" },
];
const internal: SubItem[] = [
  { label: "Internal Audit Programme", to: "/app/internal/audits" },
  { label: "Internal Audit Reports", to: "/app/internal/reports" },
  { label: "Management Review", to: "/app/internal/management-review" },
  { label: "Risks & Opportunities", to: "/app/internal/risks" },
  { label: "Impartiality Risks", to: "/app/internal/impartiality" },
  { label: "Corrective Actions", to: "/app/internal/corrective" },
  { label: "Annual Compliance Plan", to: "/app/internal/compliance-plan" },
];
const complaints: SubItem[] = [
  { label: "New Complaint", to: "/app/complaints/new" },
  { label: "Complaint Register", to: "/app/complaints" },
  { label: "Complaint Investigation", to: "/app/complaints/investigation" },
  { label: "New Appeal", to: "/app/complaints/new-appeal" },
  { label: "Appeal Register", to: "/app/complaints/appeals" },
  { label: "Analytics", to: "/app/complaints/analytics" },
];
const branches: SubItem[] = [
  { label: "Branch Register", to: "/app/branches" },
  { label: "Branch Personnel", to: "/app/branches/personnel" },
  { label: "Branch KPIs", to: "/app/branches/kpis" },
  { label: "IAF MD 23 Evaluation", to: "/app/branches/md23" },
  { label: "Head-Office Oversight", to: "/app/branches/oversight" },
];
const kpis: SubItem[] = [
  { label: "KPI Dashboard", to: "/app/kpis" },
  { label: "Employee KPIs", to: "/app/kpis/employees" },
  { label: "Auditor KPIs", to: "/app/kpis/auditors" },
  { label: "Branch KPIs", to: "/app/kpis/branches" },
  { label: "KPI Reviews", to: "/app/kpis/reviews" },
];
const resource: SubItem[] = [
  { label: "New Scheme Assessment", to: "/app/resource/new" },
  { label: "Resource Gap Register", to: "/app/resource" },
  { label: "Competence Gaps", to: "/app/resource/competence" },
  { label: "Accreditation Readiness", to: "/app/resource/readiness" },
  { label: "Action Plans", to: "/app/resource/actions" },
];
const training: SubItem[] = [
  { label: "Course Catalogue", to: "/app/training/courses" },
  { label: "Training Calendar", to: "/app/training/calendar" },
  { label: "Batches", to: "/app/training/batches" },
  { label: "Learners", to: "/app/training/learners" },
  { label: "Assessments", to: "/app/training/assessments" },
  { label: "Question Bank", to: "/app/training/questions" },
  { label: "Training Certificates", to: "/app/training/certificates" },
];
const reports: SubItem[] = [
  { label: "Certification Reports", to: "/app/reports/certification" },
  { label: "Audit Reports", to: "/app/reports/audits" },
  { label: "NCR Reports", to: "/app/reports/ncr" },
  { label: "Personnel Reports", to: "/app/reports/personnel" },
  { label: "Branch Reports", to: "/app/reports/branches" },
  { label: "Custom Report Builder", to: "/app/reports/custom" },
  { label: "Scheduled Reports", to: "/app/reports/scheduled" },
];
const admin: SubItem[] = [
  { label: "Organization Profile", to: "/app/admin/organization" },
  { label: "Branch Settings", to: "/app/admin/branches" },
  { label: "User Management", to: "/app/admin/users" },
  { label: "Roles & Permissions", to: "/app/admin/roles" },
  { label: "Permission Matrix", to: "/app/admin/permissions" },
  { label: "Theme & Branding", to: "/app/admin/branding" },
  { label: "Email Configuration", to: "/app/admin/email" },
  { label: "Notification Templates", to: "/app/admin/templates" },
  { label: "Workflow Configuration", to: "/app/admin/workflows" },
  { label: "Form Builder", to: "/app/admin/form-builder" },
  { label: "Custom Fields", to: "/app/admin/custom-fields" },
  { label: "Security Settings", to: "/app/admin/security" },
  { label: "Two-Factor Authentication", to: "/app/admin/2fa" },
  { label: "API & Webhooks", to: "/app/admin/api" },
  { label: "Audit Logs", to: "/app/admin/audit" },
  { label: "System Status", to: "/app/admin/status" },
];

export const NAV_MODULES: NavModule[] = [
  { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", children: dash },
  { key: "frameworks", label: "Accreditation Frameworks", icon: "Network", children: frameworks },
  {
    key: "conformity",
    label: "Conformity & Clause Mapping",
    icon: "ClipboardCheck",
    children: conformity,
  },
  { key: "crm", label: "CRM & Clients", icon: "Users", children: crm },
  { key: "applications", label: "Applications", icon: "FileText", children: apps },
  { key: "projects", label: "Certification Projects", icon: "KanbanSquare", children: projects },
  { key: "audits", label: "Audit Management", icon: "ClipboardCheck", children: audits },
  { key: "ncr", label: "NCR & Corrective Actions", icon: "AlertTriangle", children: ncr },
  { key: "decisions", label: "Technical Review & Decisions", icon: "Gavel", children: decisions },
  { key: "certificates", label: "Certificates", icon: "Award", children: certs },
  { key: "documents", label: "Documents", icon: "FolderOpen", children: docs },
  { key: "personnel", label: "Personnel & Competence", icon: "IdCard", children: personnel },
  { key: "internal", label: "Internal Management System", icon: "ShieldCheck", children: internal },
  { key: "risks", label: "Risk Management", icon: "ShieldAlert", children: risks },
  {
    key: "complaints",
    label: "Complaints & Appeals",
    icon: "MessageSquareWarning",
    children: complaints,
  },
  { key: "branches", label: "Branch Offices", icon: "Building2", children: branches },
  { key: "kpis", label: "KPI Management", icon: "BarChart3", children: kpis },
  { key: "resource", label: "Resource Gap", icon: "Gauge", children: resource },
  { key: "training", label: "Training Academy", icon: "GraduationCap", children: training },
  { key: "reports", label: "Reports", icon: "FileBarChart", children: reports },
  { key: "admin", label: "Administration & Settings", icon: "Settings", children: admin },
];
