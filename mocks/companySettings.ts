import { CompanySettings } from '@/types';

export const mockCompanySettings: CompanySettings[] = [
  {
    id: 'settings-1',
    companyId: 'company-1',
    payoutMethod: 'platform_to_guard',
    autoAssignGuards: true,
    requireClientApprovalForReassignment: true,
  },
];
