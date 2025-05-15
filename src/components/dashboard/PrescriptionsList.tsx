
import React, { useState } from 'react';
import { Patient, Prescription } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/components/ui/use-toast';
import { prescriptionService } from '@/services/prescriptionService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PrescriptionImageCard from '@/components/prescriptions/PrescriptionImageCard';
import { usePrescriptionTemplate } from '@/hooks/usePrescriptionTemplate';

interface PrescriptionsListProps {
  prescriptions: Prescription[];
  patients: Patient[];
  limit?: number;
  showDelete?: boolean;
  onPrescriptionDeleted?: () => void;
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ 
  prescriptions, 
  patients,
  limit = 5,
  showDelete = false,
  onPrescriptionDeleted
}) => {
  const { refreshData } = useClinic();
  const { toast } = useToast();
  const { headerSettings, footerSettings } = usePrescriptionTemplate();
  const displayPrescriptions = prescriptions.slice(0, limit);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Function to handle prescription deletion
  const handleDelete = async (prescriptionId: string) => {
    try {
      console.log("Delete button clicked for prescription:", prescriptionId);
      
      // Call the deletePrescription method from the prescriptionService
      await prescriptionService.deletePrescription(prescriptionId);
      
      // Show success toast
      toast({
        title: "Prescription deleted",
        description: "The prescription has been successfully deleted."
      });
      
      // Refresh data to update the UI
      await refreshData();
      
      // If a callback was provided, call it
      if (onPrescriptionDeleted) {
        onPrescriptionDeleted();
      }
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast({
        title: "Error",
        description: "Failed to delete the prescription. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      {displayPrescriptions.map(prescription => {
        const patient = patients.find(p => p.id === prescription.patientId);
        return (
          <div key={prescription.id} className="border-b pb-2">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{patient?.firstName} {patient?.lastName}</div>
                
                {/* Status removed from here as requested */}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  {new Date(prescription.date).toLocaleDateString()}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewPrescription(prescription);
                  }}
                >
                  <Eye size={16} />
                </Button>
                
                {showDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation if this is in a link
                      e.stopPropagation(); // Stop event propagation
                      handleDelete(prescription.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {prescriptions.length === 0 && (
        <div className="text-center text-gray-500">No prescriptions yet</div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prescription</DialogTitle>
          </DialogHeader>
          
          {selectedPrescription && (
            <PrescriptionImageCard
              prescription={selectedPrescription}
              headerSettings={headerSettings}
              footerSettings={footerSettings}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionsList;
