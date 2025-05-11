
import React from 'react';
import { Patient } from '@/types/patient';
import { Prescription } from '@/types/prescription';

interface PrescriptionsListProps {
  prescriptions: Prescription[];
  patients: Patient[];
  limit?: number;
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ 
  prescriptions, 
  patients,
  limit = 5 
}) => {
  const displayPrescriptions = prescriptions.slice(0, limit);
  
  return (
    <div className="space-y-4">
      {displayPrescriptions.map(prescription => {
        const patient = patients.find(p => p.id === prescription.patientId);
        return (
          <div key={prescription.id} className="border-b pb-2">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{patient?.firstName} {patient?.lastName}</div>
                <div className="text-sm text-gray-500">
                  Status: <span className="capitalize">{prescription.status}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(prescription.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
      {prescriptions.length === 0 && (
        <div className="text-center text-gray-500">No prescriptions yet</div>
      )}
    </div>
  );
};

export default PrescriptionsList;
