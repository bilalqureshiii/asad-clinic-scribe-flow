
import React from 'react';
import { Patient } from '@/types/patient';

interface PatientsListProps {
  patients: Patient[];
  limit?: number;
}

const PatientsList: React.FC<PatientsListProps> = ({ patients, limit = 5 }) => {
  const displayPatients = patients.slice(0, limit);
  
  return (
    <div className="space-y-4">
      {displayPatients.map(patient => (
        <div key={patient.id} className="border-b pb-2">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{patient.firstName} {patient.lastName}</div>
              <div className="text-sm text-gray-500">MR#: {patient.mrNumber}</div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(patient.registrationDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
      {patients.length === 0 && (
        <div className="text-center text-gray-500">No patients yet</div>
      )}
    </div>
  );
};

export default PatientsList;
