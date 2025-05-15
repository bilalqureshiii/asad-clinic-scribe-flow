
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { usePrescriptionTemplate } from '@/hooks/usePrescriptionTemplate';
import { Preloader } from '@/components/ui/preloader';

// Importing refactored components
import PrescriptionHeader from '@/components/prescriptions/PrescriptionHeader';
import PrescriptionPatientCard from '@/components/prescriptions/PrescriptionPatientCard';
import PrescriptionImageCard from '@/components/prescriptions/PrescriptionImageCard';
import PaymentCard from '@/components/prescriptions/PaymentCard';
import PaymentDialog from '@/components/prescriptions/PaymentDialog';

// Importing utility functions
import { downloadPrescription, printPrescription } from '@/utils/prescriptionUtils';

const PrescriptionDetail: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { prescriptions, patients, payments, addPayment } = useClinic();
  const { headerSettings, footerSettings } = usePrescriptionTemplate();
  
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [prescriptionPayments, setPrescriptionPayments] = useState([]);
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    // Find prescription and related data
    if (prescriptionId && prescriptions.length > 0) {
      const foundPrescription = prescriptions.find(p => p.id === prescriptionId);
      setPrescription(foundPrescription);
      
      if (foundPrescription) {
        const foundPatient = patients.find(p => p.id === foundPrescription.patientId);
        setPatient(foundPatient);
        
        const relatedPayments = payments.filter(p => p.prescriptionId === foundPrescription.id);
        setPrescriptionPayments(relatedPayments);
        
        setAmount(foundPrescription.fee || 0);
        setDiscount(foundPrescription.discount || 0);
      }
      
      setLoading(false);
    }
  }, [prescriptionId, prescriptions, patients, payments]);

  if (loading) {
    return <Preloader text="Loading prescription..." />;
  }

  if (!prescription || !patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-2">Prescription not found</h2>
        <button 
          onClick={() => navigate('/prescriptions')} 
          className="bg-clinic-teal hover:bg-clinic-teal/90 text-white px-4 py-2 rounded"
        >
          Back to Prescriptions
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    printPrescription(patient, prescription, headerSettings, footerSettings);
  };

  const handleDownload = () => {
    downloadPrescription(
      prescription,
      patient,
      prescription.date,
      headerSettings,
      footerSettings
    );
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const actualAmount = amount - discount;
      
      addPayment({
        prescriptionId: prescription.id,
        patientId: patient.id,
        amount: actualAmount,
        discount,
        date: new Date().toISOString().split('T')[0],
        method: paymentMethod as 'cash' | 'card' | 'other',
        notes: 'Payment for prescription',
      });
      
      toast({
        title: 'Payment recorded',
        description: `Rs. ${actualAmount} payment processed successfully`,
      });
      
      setIsPaymentDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  return (
    <div>
      <PrescriptionHeader
        mrNumber={patient.mrNumber}
        date={prescription.date}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PrescriptionImageCard
            prescription={prescription}
            headerSettings={headerSettings}
            footerSettings={footerSettings}
          />
        </div>
        
        <div>
          <PrescriptionPatientCard patient={patient} />
          
          <PaymentCard
            prescription={prescription}
            payments={prescriptionPayments}
            currentUserRole={user?.role}
            onRecordPayment={() => setIsPaymentDialogOpen(true)}
          />
        </div>
      </div>
      
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        amount={amount}
        setAmount={setAmount}
        discount={discount}
        setDiscount={setDiscount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default PrescriptionDetail;
