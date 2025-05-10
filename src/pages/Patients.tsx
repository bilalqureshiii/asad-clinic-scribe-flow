
import React, { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Search } from 'lucide-react';

const Patients: React.FC = () => {
  const { patients } = useClinic();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.mrNumber.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.contactNumber.includes(searchQuery)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-clinic-navy mb-4 md:mb-0">Patients</h1>
        <div className="w-full md:w-auto">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, MR#, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link to="/registration">
              <Button className="bg-clinic-teal hover:opacity-90">Register New</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Link to={`/patients/${patient.id}`} key={patient.id}>
            <Card className="hover:border-clinic-teal transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-clinic-light p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-clinic-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">MR#: {patient.mrNumber}</div>
                    <div className="text-sm text-gray-500">{patient.contactNumber}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Registered: {new Date(patient.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            {searchQuery ? 'No patients match your search' : 'No patients registered yet'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
