
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Prescriptions: React.FC = () => {
  const { prescriptions, patients, refreshData } = useClinic();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter prescriptions based on user role, search query, and status
  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      // Filter by doctor if user is a doctor
      if (user?.role === 'doctor') {
        return prescription.doctorId === user.id;
      }
      return true;
    })
    .filter(prescription => {
      // Filter by status
      if (statusFilter !== 'all') {
        return prescription.status === statusFilter;
      }
      return true;
    })
    .filter(prescription => {
      // Filter by search query
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      const patient = patients.find(p => p.id === prescription.patientId);
      
      return (
        patient?.firstName.toLowerCase().includes(searchLower) ||
        patient?.lastName.toLowerCase().includes(searchLower) ||
        patient?.mrNumber.toLowerCase().includes(searchLower) ||
        prescription.date.includes(searchQuery)
      );
    });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-clinic-navy mb-4 md:mb-0">Prescriptions</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrescriptions.map((prescription) => {
          const patient = patients.find(p => p.id === prescription.patientId);
          
          return (
            <Link to={`/prescriptions/${prescription.id}`} key={prescription.id}>
              <Card className="hover:border-clinic-teal transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-clinic-teal mr-2" />
                        <h3 className="font-semibold text-lg">
                          {patient?.firstName} {patient?.lastName}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">MR#: {patient?.mrNumber}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Date: {new Date(prescription.date).toLocaleDateString()}
                      </div>
                      {prescription.fee !== undefined && (
                        <div className="text-sm mt-2">
                          Fee: Rs. {prescription.fee}
                          {prescription.discount && prescription.discount > 0 && (
                            <span className="text-green-600 ml-1">
                              (Discount: Rs. {prescription.discount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      {/* Removed status display for "pending" as requested */}
                      {prescription.status !== 'pending' && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {prescription.status}
                        </span>
                      )}
                      {prescription.paymentStatus && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full mt-2",
                          prescription.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          prescription.paymentStatus === 'waived' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {prescription.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        
        {filteredPrescriptions.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No prescriptions match your filters'
              : 'No prescriptions available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
