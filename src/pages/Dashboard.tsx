
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { patients, prescriptions, payments } = useClinic();
  const { user } = useAuth();

  const todayPrescriptions = prescriptions.filter(prescription => {
    const today = new Date().toISOString().split('T')[0];
    return prescription.date === today;
  });

  const doctorPrescriptions = prescriptions.filter(
    prescription => prescription.doctorId === user?.id
  );

  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-clinic-navy mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-clinic-teal">{patients.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-clinic-navy">{todayPrescriptions.length}</p>
          </CardContent>
        </Card>
        
        {user?.role === 'doctor' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-clinic-accent">{doctorPrescriptions.length}</p>
            </CardContent>
          </Card>
        )}
        
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">Rs. {totalRevenue}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.slice(0, 5).map(patient => (
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptions.slice(0, 5).map(prescription => {
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
