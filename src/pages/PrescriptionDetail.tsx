
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Printer, File } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Storage keys for header and footer settings
const HEADER_STORAGE_KEY = 'al_asad_prescription_header';
const FOOTER_STORAGE_KEY = 'al_asad_prescription_footer';

const PrescriptionDetail: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { prescriptions, patients, payments, addPayment } = useClinic();
  
  const prescription = prescriptions.find(p => p.id === prescriptionId);
  const patient = prescription ? patients.find(p => p.id === prescription.patientId) : null;
  const prescriptionPayments = prescription ? payments.filter(p => p.prescriptionId === prescription.id) : [];
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [amount, setAmount] = useState(prescription?.fee || 0);
  const [discount, setDiscount] = useState(prescription?.discount || 0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Get header and footer settings
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(null);
  
  // Load header and footer settings
  useEffect(() => {
    const savedHeader = localStorage.getItem(HEADER_STORAGE_KEY);
    const savedFooter = localStorage.getItem(FOOTER_STORAGE_KEY);
    
    if (savedHeader) {
      setHeaderSettings(JSON.parse(savedHeader));
    }
    
    if (savedFooter) {
      setFooterSettings(JSON.parse(savedFooter));
    }
  }, []);

  if (!prescription || !patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-2">Prescription not found</h2>
        <Button 
          onClick={() => navigate('/prescriptions')} 
          variant="outline"
        >
          Back to Prescriptions
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    // Create a printable version of the prescription in a new window
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    // Prepare header styling based on saved settings
    const headerStyles = headerSettings ? `
      font-weight: ${headerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'};
      font-style: ${headerSettings.fontStyle?.includes('italic') ? 'italic' : 'normal'};
      font-size: ${headerSettings.fontSize === 'small' ? '14px' : headerSettings.fontSize === 'medium' ? '18px' : '22px'};
      text-align: ${headerSettings.alignment || 'center'};
    ` : '';
    
    // Prepare footer styling based on saved settings
    const footerStyles = footerSettings ? `
      font-weight: ${footerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'};
      font-style: ${footerSettings.fontStyle?.includes('italic') ? 'italic' : 'normal'};
      font-size: ${footerSettings.fontSize === 'small' ? '12px' : footerSettings.fontSize === 'medium' ? '14px' : '16px'};
      text-align: ${footerSettings.alignment || 'center'};
    ` : '';

    // Generate header HTML
    const headerHTML = headerSettings ? `
      <div class="header-content" style="${headerStyles}">
        <div class="header-main" style="display: flex; align-items: center; gap: 15px; justify-content: ${headerSettings.alignment === 'center' ? 'center' : 'flex-start'}">
          ${headerSettings.logo ? `<img src="${headerSettings.logo}" style="max-height: 50px;" />` : ''}
          <div>
            <div style="font-weight: bold;">${headerSettings.text || ''}</div>
            <div style="font-size: 0.9em;">${headerSettings.address || ''}</div>
            <div style="font-size: 0.9em;">${headerSettings.contact || ''}</div>
          </div>
        </div>
      </div>
    ` : `
      <div class="clinic-name">Al-Asad Clinic</div>
    `;
    
    // Generate footer HTML
    const footerHTML = footerSettings ? `
      <div class="footer-content" style="${footerStyles}">
        <div>${footerSettings.text || ''}</div>
        <div style="margin-top: 5px;">${footerSettings.additionalInfo || ''}</div>
      </div>
    ` : `
      <div>Doctor's Signature</div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient.mrNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { margin-bottom: 20px; }
            .patient-info { margin-bottom: 20px; }
            .label { font-weight: bold; }
            .prescription-image { max-width: 100%; border: 1px solid #ddd; margin: 20px 0; }
            .footer { margin-top: 30px; }
            .header-content { padding-bottom: 15px; border-bottom: 1px solid #ddd; }
            .footer-content { padding-top: 15px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            ${headerHTML}
          </div>
          
          <div class="patient-info">
            <div><span class="label">Patient Name:</span> ${patient.firstName} ${patient.lastName}</div>
            <div><span class="label">MR#:</span> ${patient.mrNumber}</div>
            <div><span class="label">Gender:</span> ${patient.gender}</div>
            <div><span class="label">DOB:</span> ${new Date(patient.dateOfBirth).toLocaleDateString()}</div>
            <div><span class="label">Date:</span> ${new Date(prescription.date).toLocaleDateString()}</div>
          </div>
          
          <img src="${prescription.imageUrl}" class="prescription-image" />
          
          ${prescription.notes ? `<div><span class="label">Notes:</span> ${prescription.notes}</div>` : ''}
          
          <div class="footer">
            ${footerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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

  const downloadPrescription = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = prescription.imageUrl;
    link.download = `prescription-${patient.mrNumber}-${new Date(prescription.date).toLocaleDateString().replace(/\//g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/prescriptions" className="text-clinic-teal hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prescriptions
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-clinic-navy">
            Prescription Details
          </h1>
          <p className="text-gray-500">MR#: {patient.mrNumber} | Date: {new Date(prescription.date).toLocaleDateString()}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={downloadPrescription}
          >
            <File className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Preview with custom header */}
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
              
              <img 
                src={prescription.imageUrl} 
                alt="Prescription" 
                className="max-w-full border rounded-md" 
              />
              
              {/* Preview with custom footer */}
              {footerSettings && (
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
              
              {prescription.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Notes:</h4>
                  <p>{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div>
                    {patient.firstName} {patient.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Contact</div>
                  <div>{patient.contactNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                  <div>{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Gender</div>
                  <div className="capitalize">{patient.gender}</div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full mt-4 text-clinic-teal hover:bg-clinic-light hover:text-clinic-teal"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                View Full Patient Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescription.fee !== undefined && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Consultation Fee</div>
                    <div>Rs. {prescription.fee}</div>
                  </div>
                )}
                
                {prescription.discount !== undefined && prescription.discount > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Discount</div>
                    <div>Rs. {prescription.discount}</div>
                  </div>
                )}
                
                {prescription.fee !== undefined && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Amount</div>
                    <div className="font-semibold">Rs. {prescription.fee - (prescription.discount || 0)}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Payment Status</div>
                  <div className="capitalize">{prescription.paymentStatus || 'Not set'}</div>
                </div>
                
                {prescriptionPayments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Payment History</div>
                    <div className="space-y-2">
                      {prescriptionPayments.map((payment) => (
                        <div key={payment.id} className="text-sm border-b pb-2">
                          <div className="flex justify-between">
                            <span>{new Date(payment.date).toLocaleDateString()}</span>
                            <span>Rs. {payment.amount}</span>
                          </div>
                          <div className="text-gray-500 capitalize">{payment.method}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {(user?.role === 'admin' || user?.role === 'staff') && prescription.paymentStatus !== 'paid' && (
                <Button 
                  className="w-full bg-clinic-teal hover:opacity-90"
                  onClick={() => setIsPaymentDialogOpen(true)}
                >
                  Record Payment
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details for this prescription.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (Rs.)
              </label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="discount" className="text-sm font-medium">
                Discount (Rs.)
              </label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="method" className="text-sm font-medium">
                Payment Method
              </label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline" 
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-clinic-teal hover:opacity-90"
              >
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionDetail;
