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
  createdAt: string;
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
