
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PrescriptionPatientCardProps {
  patient: Patient;
}

const PrescriptionPatientCard: React.FC<PrescriptionPatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div>
              {patient.firstName} {patient.lastName}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Contact</div>
            <div>{patient.contactNumber}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date of Birth</div>
            <div>{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Gender</div>
            <div className="capitalize">{patient.gender}</div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-4 text-clinic-teal hover:bg-clinic-light hover:text-clinic-teal"
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          View Full Patient Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrescriptionPatientCard;
