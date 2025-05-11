
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Users } from 'lucide-react';

type TimeFilter = 'day' | 'week' | 'month' | 'year';

const Dashboard: React.FC = () => {
  const { patients, prescriptions, payments } = useClinic();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  // Filter patients based on the selected time filter
  const filteredPatients = React.useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return patients.filter(patient => 
      new Date(patient.registrationDate) >= filterDate
    );
  }, [patients, timeFilter]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Patient Count Box */}
        <Card className="bg-white">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4">
              <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Filtered Patients Box */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtered Patients</CardTitle>
              <Select
                value={timeFilter}
                onValueChange={(value) => setTimeFilter(value as TimeFilter)}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-clinic-teal">{filteredPatients.length}</p>
              <CalendarDays className="ml-2 h-4 w-4 text-muted-foreground" />
              <span className="ml-1 text-xs text-muted-foreground">
                {timeFilter === 'day' ? 'Last 24hrs' :
                 timeFilter === 'week' ? 'Last 7 days' :
                 timeFilter === 'month' ? 'Last 30 days' : 'Last 365 days'}
              </span>
            </div>
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
