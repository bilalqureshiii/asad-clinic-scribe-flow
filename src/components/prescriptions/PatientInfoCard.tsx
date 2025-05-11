
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Patient } from '@/types/patient';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientInfoCardProps {
  patient: Patient;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="text-sm md:text-base">{patient.firstName} {patient.lastName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">MR Number</div>
            <div className="text-sm md:text-base">{patient.mrNumber}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date of Birth</div>
            <div className="text-sm md:text-base">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
