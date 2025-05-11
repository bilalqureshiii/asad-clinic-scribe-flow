
import { supabase } from '@/integrations/supabase/client';
import type { Patient, MedicalHistory } from '@/types/patient';

export const patientService = {
  async getAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(patient => ({
      id: patient.id,
      mrNumber: patient.mr_number,
      firstName: patient.first_name,
      lastName: patient.last_name,
      dateOfBirth: patient.date_of_birth,
      gender: patient.gender as 'male' | 'female' | 'other',
      contactNumber: patient.contact_number,
      email: patient.email || undefined,
      address: patient.address || undefined,
      registrationDate: patient.registration_date,
      medicalHistory: [] // Will be loaded separately if needed
    }));
  },
  
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching patient:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    // Fetch medical history for this patient
    const { data: medicalHistoryData, error: medicalHistoryError } = await supabase
      .from('medical_histories')
      .select('*, prescriptions(id)')
      .eq('patient_id', id)
      .order('date', { ascending: false });
    
    if (medicalHistoryError) {
      console.error('Error fetching medical history:', medicalHistoryError);
    }
    
    const medicalHistory: MedicalHistory[] = (medicalHistoryData || []).map(history => ({
      id: history.id,
      date: history.date,
      diagnosis: history.diagnosis,
      notes: history.notes || '',
      prescriptionId: history.prescriptions?.id
    }));
    
    return {
      id: data.id,
      mrNumber: data.mr_number,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender as 'male' | 'female' | 'other',
      contactNumber: data.contact_number,
      email: data.email || undefined,
      address: data.address || undefined,
      registrationDate: data.registration_date,
      medicalHistory
    };
  },
  
  async createPatient(patient: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate' | 'medicalHistory'>): Promise<Patient> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User must be logged in to create patients");

    // Convert to snake_case for the database
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patient.firstName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        contact_number: patient.contactNumber,
        email: patient.email,
        address: patient.address,
        created_by: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating patient:', error);
      throw new Error(error.message);
    }
    
    return {
      id: data.id,
      mrNumber: data.mr_number,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender as 'male' | 'female' | 'other',
      contactNumber: data.contact_number,
      email: data.email || undefined,
      address: data.address || undefined,
      registrationDate: data.registration_date,
      medicalHistory: []
    };
  },
  
  async addMedicalHistory(
    patientId: string,
    history: Omit<MedicalHistory, 'id'>
  ): Promise<MedicalHistory> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User must be logged in to add medical history");

    const { data, error } = await supabase
      .from('medical_histories')
      .insert({
        patient_id: patientId,
        date: history.date,
        diagnosis: history.diagnosis,
        notes: history.notes,
        prescription_id: history.prescriptionId,
        created_by: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding medical history:', error);
      throw new Error(error.message);
    }
    
    return {
      id: data.id,
      date: data.date,
      diagnosis: data.diagnosis,
      notes: data.notes || '',
      prescriptionId: data.prescription_id
    };
  }
};
