
export interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  email?: string;
  address?: string;
  registrationDate: string;
  medicalHistory?: MedicalHistory[];
  age?: number;
  weight?: number;
}

export interface MedicalHistory {
  id: string;
  date: string;
  diagnosis: string;
  notes: string;
  prescriptionId?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  imageUrl?: string;
  notes?: string;
  status: 'pending' | 'processed' | 'completed';
  fee?: number;
  discount?: number;
  paymentStatus?: 'pending' | 'paid' | 'waived';
}

export interface Payment {
  id: string;
  prescriptionId: string;
  patientId: string;
  amount: number;
  discount?: number;
  date: string;
  method: 'cash' | 'card' | 'other';
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'doctor' | 'staff' | 'admin';
}
