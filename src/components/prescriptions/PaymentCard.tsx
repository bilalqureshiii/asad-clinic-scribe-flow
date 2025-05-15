
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Prescription, Payment } from '@/types/patient';

interface PaymentCardProps {
  prescription: Prescription;
  payments: Payment[];
  currentUserRole?: string;
  onRecordPayment: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  prescription,
  payments,
  currentUserRole,
  onRecordPayment,
}) => {
  return (
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
          
          {payments.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Payment History</div>
              <div className="space-y-2">
                {payments.map((payment) => (
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
        {(currentUserRole === 'admin' || currentUserRole === 'staff') && prescription.paymentStatus !== 'paid' && (
          <Button 
            className="w-full bg-clinic-teal hover:opacity-90"
            onClick={onRecordPayment}
          >
            Record Payment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
