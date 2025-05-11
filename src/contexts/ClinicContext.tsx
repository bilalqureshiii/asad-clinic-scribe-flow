import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, Prescription, Payment, MedicalHistory } from '@/types/patient';

interface ClinicContextType {
  patients: Patient[];
  prescriptions: Prescription[];
  payments: Payment[];
  addPatient: (patient: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate'>) => Patient;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByMrNumber: (mrNumber: string) => Patient | undefined;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Prescription;
  getPrescriptionsByPatientId: (patientId: string) => Prescription[];
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  getPaymentsByPatientId: (patientId: string) => Payment[];
  addMedicalHistory: (patientId: string, history: Omit<MedicalHistory, 'id'>) => MedicalHistory;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Mock data for patients
const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    mrNumber: 'MR00001',
    firstName: 'Fatima',
    lastName: 'Aziz',
    dateOfBirth: '1985-05-15',
    gender: 'female',
    contactNumber: '0300-1234567',
    email: 'fatima@example.com',
    address: 'House 123, Street 4, Islamabad',
    registrationDate: '2023-01-10',
    medicalHistory: [
      {
        id: 'history-1',
        date: '2023-01-15',
        diagnosis: 'Hypertension',
        notes: 'Patient presented with high blood pressure. Advised lifestyle changes.',
        prescriptionId: 'prescription-1'
      }
    ]
  },
  {
    id: 'patient-2',
    mrNumber: 'MR00002',
    firstName: 'Ali',
    lastName: 'Hassan',
    dateOfBirth: '1990-10-20',
    gender: 'male',
    contactNumber: '0321-7654321',
    email: 'ali@example.com',
    address: 'Flat 4B, Plaza Heights, Lahore',
    registrationDate: '2023-02-05',
    medicalHistory: []
  }
];

// Mock data for prescriptions
const mockPrescriptions: Prescription[] = [
  {
    id: 'prescription-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    date: '2023-01-15',
    imageUrl: '/placeholder.svg',
    notes: 'Take medicine after meals',
    status: 'completed',
    fee: 1500,
    discount: 0,
    paymentStatus: 'paid'
  }
];

// Mock data for payments
const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    prescriptionId: 'prescription-1',
    patientId: 'patient-1',
    amount: 1500,
    date: '2023-01-15',
    method: 'cash',
    notes: 'Full payment received'
  }
];

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const generateMrNumber = () => {
    const lastMrNumber = patients.length > 0 
      ? parseInt(patients[patients.length - 1].mrNumber.replace('MR', ''))
      : 0;
    return `MR${String(lastMrNumber + 1).padStart(5, '0')}`;
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      mrNumber: generateMrNumber(),
      registrationDate: new Date().toISOString().split('T')[0],
      medicalHistory: []
    };
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const getPatientById = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  const getPatientByMrNumber = (mrNumber: string) => {
    return patients.find(patient => patient.mrNumber === mrNumber);
  };

  const addPrescription = (prescriptionData: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: `prescription-${Date.now()}`
    };
    setPrescriptions([...prescriptions, newPrescription]);
    return newPrescription;
  };

  const getPrescriptionsByPatientId = (patientId: string) => {
    return prescriptions.filter(prescription => prescription.patientId === patientId);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `payment-${Date.now()}`
    };
    setPayments([...payments, newPayment]);

    // Update prescription payment status if applicable
    setPrescriptions(prescriptions.map(prescription => {
      if (prescription.id === paymentData.prescriptionId) {
        return { ...prescription, paymentStatus: 'paid' };
      }
      return prescription;
    }));

    return newPayment;
  };

  const getPaymentsByPatientId = (patientId: string) => {
    return payments.filter(payment => payment.patientId === patientId);
  };

  const addMedicalHistory = (patientId: string, historyData: Omit<MedicalHistory, 'id'>) => {
    const newHistory: MedicalHistory = {
      ...historyData,
      id: `history-${Date.now()}`
    };

    setPatients(patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          medicalHistory: [...(patient.medicalHistory || []), newHistory]
        };
      }
      return patient;
    }));

    return newHistory;
  };

  return (
    <ClinicContext.Provider value={{
      patients,
      prescriptions,
      payments,
      addPatient,
      getPatientById,
      getPatientByMrNumber,
      addPrescription,
      getPrescriptionsByPatientId,
      addPayment,
      getPaymentsByPatientId,
      addMedicalHistory
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
