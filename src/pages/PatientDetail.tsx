import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient, Prescription, Payment } from '@/types/patient';
import PrescriptionsList from '@/components/dashboard/PrescriptionsList';

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatientById, getPrescriptionsByPatientId, getPaymentsByPatientId } = useClinic();
  const [activeTab, setActiveTab] = useState('details');
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (patientId) {
          const patientData = await getPatientById(patientId);
          setPatient(patientData);
          
          if (patientData) {
            const [prescriptionsData, paymentsData] = await Promise.all([
              getPrescriptionsByPatientId(patientId),
              getPaymentsByPatientId(patientId)
            ]);
            
            setPrescriptions(prescriptionsData);
            setPayments(paymentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, getPatientById, getPrescriptionsByPatientId, getPaymentsByPatientId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // If switching to prescriptions tab, refresh prescription data
    if (tab === 'prescriptions' && patientId) {
      getPrescriptionsByPatientId(patientId).then(data => {
        setPrescriptions(data);
      });
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
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">Patient not found</h2>
        <Link to="/patients">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/patients" className="text-clinic-teal hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-clinic-navy">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-gray-500">MR#: {patient.mrNumber}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to={`/prescriptions/new/${patientId}`}>
            <Button className="bg-clinic-teal hover:opacity-90">
              <FileText className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="details">Patient Details</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p>{patient.firstName} {patient.lastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="capitalize">{patient.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  <p>{patient.contactNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{patient.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p>{patient.address || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  <p>{new Date(patient.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="space-y-6">
                  {patient.medicalHistory.map((history) => (
                    <div key={history.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{history.diagnosis}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(history.date).toLocaleDateString()}
                          </p>
                        </div>
                        {history.prescriptionId && (
                          <Link to={`/prescriptions/${history.prescriptionId}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-3 w-3" />
                              View Prescription
                            </Button>
                          </Link>
                        )}
                      </div>
                      <p className="mt-2">{history.notes}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No medical history recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <PrescriptionsList 
                  prescriptions={prescriptions} 
                  patients={[patient]} 
                  showDelete={true}
                />
              ) : (
                <p className="text-center py-10 text-gray-500">No prescriptions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-primary">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Discount</th>
                        <th>Method</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{new Date(payment.date).toLocaleDateString()}</td>
                          <td>Rs. {payment.amount}</td>
                          <td>{payment.discount ? `Rs. ${payment.discount}` : '-'}</td>
                          <td className="capitalize">{payment.method}</td>
                          <td>{payment.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">No payment records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetail;
