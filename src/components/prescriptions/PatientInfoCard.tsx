
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Patient } from '@/types/patient';

interface PatientInfoCardProps {
  patient: Patient;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div>{patient.firstName} {patient.lastName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">MR Number</div>
            <div>{patient.mrNumber}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date of Birth</div>
            <div>{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
