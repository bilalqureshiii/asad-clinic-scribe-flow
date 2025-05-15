
import React, { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Search, Plus, Trash2, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const Patients: React.FC = () => {
  const { patients, deletePatients } = useClinic();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.mrNumber.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.contactNumber.includes(searchQuery)
    );
  });

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  const handleDeleteClick = () => {
    if (selectedPatients.length === 0) {
      toast({
        title: "No patients selected",
        description: "Please select at least one patient to delete.",
        variant: "destructive",
      });
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePatients(selectedPatients);
      toast({
        title: "Success",
        description: `${selectedPatients.length} patient(s) deleted successfully.`,
      });
      setSelectedPatients([]);
      setIsSelectionMode(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting patients:", error);
      toast({
        title: "Error",
        description: "Failed to delete patients. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedPatients([]);
    }
    setIsSelectionMode(!isSelectionMode);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-clinic-navy mb-3 md:mb-0">Patients</h1>
        <div className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleSelectionMode}
                variant={isSelectionMode ? "outline" : "ghost"}
                className={isSelectionMode ? "border-red-500 text-red-500" : "text-gray-500"}
              >
                {isSelectionMode ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </>
                )}
              </Button>

              {isSelectionMode && (
                <Button 
                  onClick={handleDeleteClick} 
                  variant="destructive"
                  disabled={selectedPatients.length === 0}
                >
                  Delete ({selectedPatients.length})
                </Button>
              )}

              {!isSelectionMode && (
                <Link to="/registration">
                  <Button className="bg-clinic-teal hover:opacity-90 w-full sm:w-auto">
                    {isMobile ? <><Plus className="h-4 w-4 mr-1" /> New</> : "Register New"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="relative">
            {isSelectionMode ? (
              <div 
                className="cursor-pointer h-full" 
                onClick={() => handleSelectPatient(patient.id)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedPatients.includes(patient.id)} 
                    onCheckedChange={() => handleSelectPatient(patient.id)}
                  />
                </div>
                <Card className={`h-full ${selectedPatients.includes(patient.id) ? 'border-2 border-clinic-teal bg-blue-50' : ''}`}>
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-start">
                      <div className="bg-clinic-light p-2 md:p-3 rounded-full mr-3 md:mr-4">
                        <User className="h-5 w-5 md:h-6 md:w-6 text-clinic-navy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base md:text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="text-xs md:text-sm text-gray-500 mt-1">MR#: {patient.mrNumber}</div>
                        <div className="text-xs md:text-sm text-gray-500">{patient.contactNumber}</div>
                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                          {new Date(patient.registrationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Link to={`/patients/${patient.id}`}>
                <Card className="hover:border-clinic-teal transition-colors h-full">
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-start">
                      <div className="bg-clinic-light p-2 md:p-3 rounded-full mr-3 md:mr-4">
                        <User className="h-5 w-5 md:h-6 md:w-6 text-clinic-navy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base md:text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="text-xs md:text-sm text-gray-500 mt-1">MR#: {patient.mrNumber}</div>
                        <div className="text-xs md:text-sm text-gray-500">{patient.contactNumber}</div>
                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                          {new Date(patient.registrationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-8 md:py-10 text-gray-500">
            {searchQuery ? 'No patients match your search' : 'No patients registered yet'}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPatients.length} patient(s)? 
              This action cannot be undone and will also delete all related medical records and prescriptions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
