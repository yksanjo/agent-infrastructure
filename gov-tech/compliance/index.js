/**
 * GovTech Compliance Module
 * Security, audit logging, and compliance features for government applications
 */

import { EventEmitter } from 'events';

// =============== AUDIT LOGGING ===============

export interface AuditEvent {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'partial';
}

export class AuditLogger extends EventEmitter {
  private events: AuditEvent[] = [];
  private maxEvents: number = 10000;

  constructor(private options: {
    retentionDays?: number;
    sensitiveFields?: string[];
  } = {}) {
    super();
  }

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.events.push(auditEvent);
    
    // Trim old events if over limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.emit('audit', auditEvent);
  }

  query(filter: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: number;
    endDate?: number;
    outcome?: string;
  }): AuditEvent[] {
    return this.events.filter(event => {
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.action && !event.action.includes(filter.action)) return false;
      if (filter.resource && event.resource !== filter.resource) return false;
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      if (filter.outcome && event.outcome !== filter.outcome) return false;
      return true;
    });
  }

  export(startDate?: number, endDate?: number): string {
    const events = this.query({ startDate, endDate });
    return JSON.stringify(events, null, 2);
  }
}

// =============== ACCESS CONTROL ===============

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  roles: string[];
  attributes?: Record<string, unknown>;
}

export class AccessControl {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    // Admin role - full access
    this.roles.set('admin', {
      id: 'admin',
      name: 'Administrator',
      permissions: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete'] }
      ]
    });

    // Citizen - limited access
    this.roles.set('citizen', {
      id: 'citizen',
      name: 'Citizen',
      permissions: [
        { resource: 'profile', actions: ['read', 'update'] },
        { resource: 'services', actions: ['read', 'create'] }
      ]
    });

    // Government employee
    this.roles.set('employee', {
      id: 'employee',
      name: 'Government Employee',
      permissions: [
        { resource: 'cases', actions: ['create', 'read', 'update'] },
        { resource: 'reports', actions: ['create', 'read'] }
      ]
    });
  }

  addRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  assignRole(userId: string, roleId: string): void {
    const roles = this.userRoles.get(userId) || [];
    if (!roles.includes(roleId)) {
      roles.push(roleId);
      this.userRoles.set(userId, roles);
    }
  }

  hasPermission(userId: string, resource: string, action: string): boolean {
    const roles = this.userRoles.get(userId) || [];
    
    for (const roleId of roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      for (const perm of role.permissions) {
        if (perm.resource === '*' || perm.resource === resource) {
          if (perm.actions.includes(action as any)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

// =============== DATA CLASSIFICATION ===============

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface DataField {
  name: string;
  classification: DataClassification;
  pii?: boolean;
  phi?: boolean; // Protected Health Information
}

export class DataClassifier {
  private fieldRules: Map<string, DataClassification> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // PII fields
    this.fieldRules.set('ssn', 'restricted');
    this.fieldRules.set('password', 'restricted');
    this.fieldRules.set('credit_card', 'restricted');
    this.fieldRules.set('date_of_birth', 'confidential');
    this.fieldRules.set('address', 'confidential');
    this.fieldRules.set('phone', 'confidential');
    this.fieldRules.set('email', 'internal');
    
    // Government specific
    this.fieldRules.set('case_number', 'confidential');
    this.fieldRules.set('tax_id', 'restricted');
    this.fieldRules.set('license_number', 'internal');
  }

  classify(fieldName: string): DataClassification {
    const lowerName = fieldName.toLowerCase();
    return this.fieldRules.get(lowerName) || 'public';
  }

  isPII(fieldName: string): boolean {
    const classification = this.classify(fieldName);
    return classification === 'confidential' || classification === 'restricted';
  }
}

// =============== COMPLIANCE REPORTER ===============

export interface ComplianceReport {
  generatedAt: number;
  period: { start: number; end: number };
  summary: {
    totalEvents: number;
    failedAuth: number;
    dataAccess: number;
    policyViolations: number;
  };
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affectedRecords?: number;
  recommendation: string;
}

export class ComplianceReporter {
  constructor(
    private auditLogger: AuditLogger,
    private accessControl: AccessControl
  ) {}

  generateReport(startDate: number, endDate: number): ComplianceReport {
    const events = this.auditLogger.query({ startDate, endDate });
    
    const failedAuth = events.filter(e => 
      e.action === 'auth' && e.outcome === 'failure'
    ).length;
    
    const dataAccess = events.filter(e => 
      e.action === 'read' && e.resource.includes('data')
    ).length;

    const findings: ComplianceFinding[] = [];

    // Check for suspicious patterns
    if (failedAuth > 10) {
      findings.push({
        severity: 'high',
        category: 'Authentication',
        description: 'Multiple failed authentication attempts detected',
        recommendation: 'Review and potentially lock affected accounts'
      });
    }

    return {
      generatedAt: Date.now(),
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: events.length,
        failedAuth,
        dataAccess,
        policyViolations: findings.length
      },
      findings
    };
  }
}

export default { AuditLogger, AccessControl, DataClassifier, ComplianceReporter };
