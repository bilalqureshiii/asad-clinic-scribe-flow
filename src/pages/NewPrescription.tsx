
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { Patient } from '@/types/patient';
import { usePrescriptionTemplate } from '@/hooks/usePrescriptionTemplate';
import PatientInfoCard from '@/components/prescriptions/PatientInfoCard';
import PrescriptionCanvas from '@/components/prescriptions/PrescriptionCanvas';
import PrescriptionDetailsForm, { PrescriptionFormValues } from '@/components/prescriptions/PrescriptionDetailsForm';

const NewPrescription: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatientById, addPrescription, addMedicalHistory, addPayment } = useClinic();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const { headerSettings, footerSettings } = usePrescriptionTemplate();

  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        try {
          const patientData = await getPatientById(patientId);
          setPatient(patientData);
        } catch (error) {
          console.error('Error loading patient:', error);
          toast({
            title: 'Error',
            description: 'Failed to load patient information',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPatient();
  }, [patientId, getPatientById, toast]);

  const handleSubmit = async (data: PrescriptionFormValues) => {
    if (!prescriptionImage) {
      toast({
        title: 'Prescription Required',
        description: 'Please write and save the prescription',
        variant: 'destructive',
      });
      return;
    }

    if (!patient || !user) {
      toast({
        title: 'Error',
        description: 'Patient or user information is missing',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create prescription
      const newPrescription = await addPrescription({
        patientId: patient.id,
        doctorId: user.id,
        date: new Date().toISOString().split('T')[0],
        imageUrl: prescriptionImage,
        notes: data.notes || '',
        status: 'pending',
        fee: data.fee,
        discount: data.discount,
        paymentStatus: 'pending',
      });

      // Add medical history
      if (diagnosis) {
        await addMedicalHistory(patient.id, {
          date: new Date().toISOString().split('T')[0],
          diagnosis: diagnosis,
          notes: data.notes || '',
          prescriptionId: newPrescription.id,
        });
      }

      // Record payment if fee is provided
      if (data.fee && data.fee > 0) {
        const paymentAmount = data.fee - (data.discount || 0);
        
        if (paymentAmount > 0) {
          await addPayment({
            prescriptionId: newPrescription.id,
            patientId: patient.id,
            amount: paymentAmount,
            discount: data.discount || 0,
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
            notes: 'Payment for prescription',
          });
        }
      }

      toast({
        title: 'Prescription created',
        description: 'Prescription has been saved successfully',
      });
      
      navigate(`/prescriptions/${newPrescription.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prescription',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-clinic-teal" />
        <p className="mt-4 text-gray-600">Loading patient data...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-2">Patient not found</h2>
        <Button 
          onClick={() => navigate('/patients')} 
          variant="outline"
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-clinic-navy mb-6">New Prescription</h1>
      
      <div className="mb-6">
        <PatientInfoCard patient={patient} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Write Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionCanvas 
                prescriptionImage={prescriptionImage}
                setPrescriptionImage={setPrescriptionImage}
                headerSettings={headerSettings}
                footerSettings={footerSettings}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <PrescriptionDetailsForm
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            onSubmit={handleSubmit}
            prescriptionImage={prescriptionImage}
          />
        </div>
      </div>
    </div>
  );
};

export default NewPrescription;
