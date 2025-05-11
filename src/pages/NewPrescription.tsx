import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import DrawingCanvas from '@/components/prescriptions/DrawingCanvas';
import { Patient } from '@/types/patient';
import { Loader2 } from 'lucide-react';

// Storage keys for header and footer settings
const HEADER_STORAGE_KEY = 'al_asad_prescription_header';
const FOOTER_STORAGE_KEY = 'al_asad_prescription_footer';

const formSchema = z.object({
  notes: z.string().optional(),
  fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(null);

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
    
    // Load header and footer settings
    const savedHeader = localStorage.getItem(HEADER_STORAGE_KEY);
    const savedFooter = localStorage.getItem(FOOTER_STORAGE_KEY);
    
    if (savedHeader) {
      setHeaderSettings(JSON.parse(savedHeader));
    }
    
    if (savedFooter) {
      setFooterSettings(JSON.parse(savedFooter));
    }
  }, [patientId, getPatientById, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      fee: 0,
      discount: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
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
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Name</div>
                <div>{patient.firstName} {patient.lastName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">MR Number</div>
                <div>{patient.mrNumber}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                <div>{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Write Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show header preview */}
              {headerSettings && (
                <div 
                  className="mb-4 pb-2 border-b"
                  style={{
                    fontWeight: headerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal',
                    fontStyle: headerSettings.fontStyle?.includes('italic') ? 'italic' : 'normal',
                    fontSize: headerSettings.fontSize === 'small' ? '14px' : headerSettings.fontSize === 'medium' ? '16px' : '18px',
                    textAlign: headerSettings.alignment || 'center',
                  }}
                >
                  <div className="flex items-center gap-3" style={{
                    justifyContent: headerSettings.alignment === 'center' ? 'center' : 
                                   headerSettings.alignment === 'right' ? 'flex-end' : 'flex-start'
                  }}>
                    {headerSettings.logo && (
                      <img 
                        src={headerSettings.logo} 
                        alt="Header Logo" 
                        className="max-h-10 object-contain" 
                      />
                    )}
                    <div>
                      <div className="font-medium">{headerSettings.text}</div>
                      <div className="text-xs">{headerSettings.address}</div>
                      <div className="text-xs">{headerSettings.contact}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {!prescriptionImage ? (
                <DrawingCanvas onSave={setPrescriptionImage} />
              ) : (
                <div className="space-y-4">
                  <div className="border p-2 rounded-md">
                    <img 
                      src={prescriptionImage} 
                      alt="Prescription" 
                      className="max-w-full" 
                    />
                  </div>
                  <Button 
                    onClick={() => setPrescriptionImage(null)} 
                    variant="outline"
                  >
                    Redraw Prescription
                  </Button>
                </div>
              )}
              
              {/* Show footer preview */}
              {footerSettings && prescriptionImage && (
                <div 
                  className="mt-4 pt-2 border-t"
                  style={{
                    fontWeight: footerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal',
                    fontStyle: footerSettings.fontStyle?.includes('italic') ? 'italic' : 'normal',
                    fontSize: footerSettings.fontSize === 'small' ? '12px' : footerSettings.fontSize === 'medium' ? '14px' : '16px',
                    textAlign: footerSettings.alignment || 'center',
                  }}
                >
                  <div>{footerSettings.text}</div>
                  <div className="text-xs mt-1">{footerSettings.additionalInfo}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Prescription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="diagnosis" className="text-sm font-medium">
                      Diagnosis
                    </label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee (Rs.)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (Rs.)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-clinic-teal hover:opacity-90"
                    disabled={!prescriptionImage}
                  >
                    Save Prescription
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewPrescription;
