
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/auth';
import StatCard from '@/components/dashboard/StatCard';
import FilteredPatientsCard from '@/components/dashboard/FilteredPatientsCard';
import RecentListCard from '@/components/dashboard/RecentListCard';
import PatientsList from '@/components/dashboard/PatientsList';
import PrescriptionsList from '@/components/dashboard/PrescriptionsList';

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

  // Fix the date comparison logic to correctly identify today's prescriptions
  const todayPrescriptions = React.useMemo(() => {
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return prescriptions.filter(prescription => {
      // Convert prescription date to Date object and reset time for fair comparison
      const prescriptionDate = new Date(prescription.date);
      prescriptionDate.setHours(0, 0, 0, 0);
      
      // Compare dates without time
      return prescriptionDate.getTime() === today.getTime();
    });
  }, [prescriptions]);

  const doctorPrescriptions = prescriptions.filter(
    prescription => prescription.doctorId === user?.id
  );

  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-clinic-navy mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Patient Count Box */}
        <StatCard 
          title="Total Patients" 
          value={patients.length}
          icon={Users}
          iconColor="text-purple-600"
        />
        
        {/* Filtered Patients Box */}
        <FilteredPatientsCard
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          filteredCount={filteredPatients.length}
        />
        
        {/* Today's Prescriptions Box */}
        <StatCard 
          title="Today's Prescriptions" 
          value={todayPrescriptions.length}
          iconColor="text-clinic-navy"
        />
        
        {/* Conditional Cards based on user role */}
        {user?.role === 'doctor' && (
          <StatCard 
            title="My Prescriptions" 
            value={doctorPrescriptions.length}
            iconColor="text-clinic-accent"
          />
        )}
        
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <StatCard 
            title="Total Revenue" 
            value={`Rs. ${totalRevenue}`}
            iconColor="text-green-600"
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients List */}
        <RecentListCard title="Recent Patients">
          <PatientsList patients={patients} />
        </RecentListCard>
        
        {/* Recent Prescriptions List */}
        <RecentListCard title="Recent Prescriptions">
          <PrescriptionsList 
            prescriptions={prescriptions}
            patients={patients}
          />
        </RecentListCard>
      </div>
    </div>
  );
};

export default Dashboard;
