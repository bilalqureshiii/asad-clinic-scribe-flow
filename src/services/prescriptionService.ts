import { supabase } from '@/integrations/supabase/client';
import type { Prescription, Payment } from '@/types/patient';

export const prescriptionService = {
  async getAllPrescriptions(): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(prescription => ({
      id: prescription.id,
      patientId: prescription.patient_id,
      doctorId: prescription.doctor_id,
      date: prescription.date,
      imageUrl: prescription.image_url || undefined,
      notes: prescription.notes || undefined,
      status: prescription.status as 'pending' | 'processed' | 'completed',
      fee: prescription.fee,
      discount: prescription.discount,
      paymentStatus: prescription.payment_status as 'pending' | 'paid' | 'waived' | undefined
    }));
  },
  
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching prescription:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      imageUrl: data.image_url || undefined,
      notes: data.notes || undefined,
      status: data.status as 'pending' | 'processed' | 'completed',
      fee: data.fee,
      discount: data.discount,
      paymentStatus: data.payment_status as 'pending' | 'paid' | 'waived' | undefined
    };
  },
  
  async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(prescription => ({
      id: prescription.id,
      patientId: prescription.patient_id,
      doctorId: prescription.doctor_id,
      date: prescription.date,
      imageUrl: prescription.image_url || undefined,
      notes: prescription.notes || undefined,
      status: prescription.status as 'pending' | 'processed' | 'completed',
      fee: prescription.fee,
      discount: prescription.discount,
      paymentStatus: prescription.payment_status as 'pending' | 'paid' | 'waived' | undefined
    }));
  },
  
  async createPrescription(prescription: Omit<Prescription, 'id'>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: prescription.patientId,
        doctor_id: prescription.doctorId,
        date: prescription.date,
        image_url: prescription.imageUrl,
        notes: prescription.notes,
        status: prescription.status,
        fee: prescription.fee,
        discount: prescription.discount,
        payment_status: prescription.paymentStatus
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating prescription:', error);
      throw new Error(error.message);
    }
    
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      imageUrl: data.image_url || undefined,
      notes: data.notes || undefined,
      status: data.status as 'pending' | 'processed' | 'completed',
      fee: data.fee,
      discount: data.discount,
      paymentStatus: data.payment_status as 'pending' | 'paid' | 'waived' | undefined
    };
  },
  
  async deletePrescription(id: string): Promise<void> {
    console.log("Attempting to delete prescription with ID:", id);
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting prescription:', error);
      throw new Error(error.message);
    }
    
    console.log("Successfully deleted prescription with ID:", id);
  },
  
  async addPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User must be logged in to add payments");

    const { data, error } = await supabase
      .from('payments')
      .insert({
        prescription_id: payment.prescriptionId,
        patient_id: payment.patientId,
        amount: payment.amount,
        discount: payment.discount,
        date: payment.date,
        method: payment.method,
        notes: payment.notes,
        created_by: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding payment:', error);
      throw new Error(error.message);
    }
    
    // Update prescription payment status
    await supabase
      .from('prescriptions')
      .update({ payment_status: 'paid' })
      .eq('id', payment.prescriptionId);
    
    return {
      id: data.id,
      prescriptionId: data.prescription_id,
      patientId: data.patient_id,
      amount: data.amount,
      discount: data.discount || undefined,
      date: data.date,
      method: data.method as 'cash' | 'card' | 'other',
      notes: data.notes || undefined
    };
  },
  
  async getPaymentsByPatientId(patientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching payments:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map(payment => ({
      id: payment.id,
      prescriptionId: payment.prescription_id,
      patientId: payment.patient_id,
      amount: payment.amount,
      discount: payment.discount || undefined,
      date: payment.date,
      method: payment.method as 'cash' | 'card' | 'other',
      notes: payment.notes || undefined
    }));
  }
};
