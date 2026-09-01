import React from 'react';
import { PhcEmergencyControlRoom } from '../phc/PhcEmergencyControlRoom';
import { HospitalResource, PhcStaffMember, PhcMedicine, DiagnosticService } from '../../types';

interface HospitalEmergencyControlRoomProps {
  facilityId: number;
  facilityName: string;
  resources: HospitalResource;
  staff: PhcStaffMember[];
  medicines: PhcMedicine[];
  diagnostics: DiagnosticService[];
  onBack: () => void;
  onRefreshData?: () => void;
}

export const HospitalEmergencyControlRoom: React.FC<HospitalEmergencyControlRoomProps> = (props) => {
  return <PhcEmergencyControlRoom {...props} />;
};
