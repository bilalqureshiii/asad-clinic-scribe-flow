import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Patient, Prescription, Payment, MedicalHistory } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { prescriptionService } from '@/services/prescriptionService';
import { useToast } from '@/components/ui/use-toast';

interface ClinicContextType {
  patients: Patient[];
  prescriptions: Prescription[];
  payments: Payment[];
  isLoading: boolean;
  addPatient: (patient: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate' | 'medicalHistory'>) => Promise<Patient>;
  getPatientById: (id: string) => Promise<Patient | null>;
  getPatientByMrNumber: (mrNumber: string) => Promise<Patient | null>;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>;
  getPrescriptionsByPatientId: (patientId: string) => Promise<Prescription[]>;
  deletePrescription: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment>;
  getPaymentsByPatientId: (patientId: string) => Promise<Payment[]>;
  addMedicalHistory: (patientId: string, history: Omit<MedicalHistory, 'id'>) => Promise<MedicalHistory>;
  refreshData: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const loadData = async () => {
    if (!isAuthenticated) {
      setPatients([]);
      setPrescriptions([]);
      setPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load data in parallel
      const [patientsData, prescriptionsData] = await Promise.all([
        patientService.getAllPatients(),
        prescriptionService.getAllPrescriptions()
      ]);
      
      // We don't load all payments at once as it might be a large dataset
      // Instead, we'll load them on demand per patient

      setPatients(patientsData);
      setPrescriptions(prescriptionsData);
      
      // For demo purposes, let's load payments for the first few patients
      if (patientsData.length > 0) {
        const patientIds = patientsData.slice(0, 5).map(p => p.id);
        const paymentsPromises = patientIds.map(id => prescriptionService.getPaymentsByPatientId(id));
        const paymentsArrays = await Promise.all(paymentsPromises);
        const allPayments = paymentsArrays.flat();
        setPayments(allPayments);
      }
    } catch (error) {
      console.error("Error loading clinic data:", error);
      toast({
        title: "Error",
        description: "Failed to load clinic data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when authentication state changes
  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const refreshData = async () => {
    console.log("Refreshing clinic data");
    await loadData();
  };

  const getPatientById = async (id: string): Promise<Patient | null> => {
    try {
      const patient = await patientService.getPatientById(id);
      return patient;
    } catch (error) {
      console.error("Error getting patient by ID:", error);
      return null;
    }
  };

  const getPatientByMrNumber = async (mrNumber: string): Promise<Patient | null> => {
    try {
      // Find in the loaded data first
      const cachedPatient = patients.find(p => p.mrNumber === mrNumber);
      if (cachedPatient) return cachedPatient;

      // Otherwise load all patients and search
      const allPatients = await patientService.getAllPatients();
      const patient = allPatients.find(p => p.mrNumber === mrNumber);
      return patient || null;
    } catch (error) {
      console.error("Error getting patient by MR number:", error);
      return null;
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate' | 'medicalHistory'>): Promise<Patient> => {
    try {
      const newPatient = await patientService.createPatient(patientData);
      
      // Update local state
      setPatients(prevPatients => [newPatient, ...prevPatients]);
      
      return newPatient;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id'>): Promise<Prescription> => {
    try {
      const newPrescription = await prescriptionService.createPrescription(prescriptionData);
      
      // Update local state
      setPrescriptions(prevPrescriptions => [newPrescription, ...prevPrescriptions]);
      
      return newPrescription;
    } catch (error) {
      console.error("Error adding prescription:", error);
      throw error;
    }
  };

  const getPrescriptionsByPatientId = async (patientId: string): Promise<Prescription[]> => {
    try {
      // Try from cache first
      const cachedPrescriptions = prescriptions.filter(p => p.patientId === patientId);
      if (cachedPrescriptions.length > 0) return cachedPrescriptions;
      
      // Otherwise load from the database
      return await prescriptionService.getPrescriptionsByPatientId(patientId);
    } catch (error) {
      console.error("Error getting prescriptions by patient ID:", error);
      return [];
    }
  };

  const deletePrescription = async (id: string): Promise<void> => {
    try {
      console.log("ClinicContext: Deleting prescription with ID:", id);
      await prescriptionService.deletePrescription(id);
      
      // Update local state by removing the deleted prescription
      setPrescriptions(prevPrescriptions => 
        prevPrescriptions.filter(prescription => prescription.id !== id)
      );
      
      console.log("ClinicContext: Successfully deleted prescription, state updated");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      throw error;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      const newPayment = await prescriptionService.addPayment(paymentData);
      
      // Update local state
      setPayments(prevPayments => [newPayment, ...prevPayments]);
      
      // Update prescription payment status in local state
      setPrescriptions(prevPrescriptions => 
        prevPrescriptions.map(prescription => {
          if (prescription.id === paymentData.prescriptionId) {
            return { ...prescription, paymentStatus: 'paid' };
          }
          return prescription;
        })
      );
      
      return newPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const getPaymentsByPatientId = async (patientId: string): Promise<Payment[]> => {
    try {
      // Try from cache first
      const cachedPayments = payments.filter(p => p.patientId === patientId);
      if (cachedPayments.length > 0) return cachedPayments;
      
      // Otherwise load from the database
      return await prescriptionService.getPaymentsByPatientId(patientId);
    } catch (error) {
      console.error("Error getting payments by patient ID:", error);
      return [];
    }
  };

  const addMedicalHistory = async (patientId: string, historyData: Omit<MedicalHistory, 'id'>): Promise<MedicalHistory> => {
    try {
      const newHistory = await patientService.addMedicalHistory(patientId, historyData);
      
      // Update local state (find and update patient)
      setPatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient.id === patientId) {
            const updatedMedicalHistory = [
              ...(patient.medicalHistory || []),
              newHistory
            ];
            return {
              ...patient,
              medicalHistory: updatedMedicalHistory
            };
          }
          return patient;
        })
      );
      
      return newHistory;
    } catch (error) {
      console.error("Error adding medical history:", error);
      throw error;
    }
  };

  return (
    <ClinicContext.Provider value={{
      patients,
      prescriptions,
      payments,
      isLoading,
      addPatient,
      getPatientById,
      getPatientByMrNumber,
      addPrescription,
      getPrescriptionsByPatientId,
      deletePrescription,
      addPayment,
      getPaymentsByPatientId,
      addMedicalHistory,
      refreshData
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
