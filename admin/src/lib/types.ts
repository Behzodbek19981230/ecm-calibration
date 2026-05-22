export interface District {
  id: number;
  name: string;
  regionId: number;
}

export interface Region {
  id: number;
  name: string;
  districts: District[];
}

export type UserRole = 'admin' | 'manager' | 'buyro' | 'chief_laboratory';

export interface UserRoleRecord {
  id: number;
  userId: number;
  role: UserRole;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: UserRoleRecord[];
  createdAt: string;
}

export interface Application {
  id: number;
  userType: 'individual' | 'legal';
  fullName?: string;
  orgName?: string;
  phone: string;
  email: string;
  branchRequest: boolean;
  notifyMethod: 'email' | 'telegram';
  telegramChatId?: string;
  devices: unknown[];
  filePath?: string;
  status: string;
  assignedToId?: number;
  assignedTo?: User;
  certificate?: Certificate;
  createdAt: string;
}

export interface Certificate {
  id: number;
  certNumber: string;
  applicationId: number;
  application: Application;
  issuedById: number;
  issuedBy: User;
  issuedAt: string;
  expiresAt: string;
  filePath?: string;
  notes?: string;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface DashboardStats {
  applications: {
    total: number;
    new: number;
    contract: number;
    acceptance: number;
    laboratory: number;
    completed: number;
    perMonth: Array<{ month: string; count: number }>;
  };
  users: { total: number };
  certificates: { total: number; active: number; revoked: number };
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  excerptUz: string;
  excerptRu: string;
  excerptEn: string;
  contentUz: string;
  contentRu: string;
  contentEn: string;
  category: 'calibration' | 'metrology' | 'standards' | 'news';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
