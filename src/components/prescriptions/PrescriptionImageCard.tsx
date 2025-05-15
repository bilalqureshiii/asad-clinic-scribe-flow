
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface PrescriptionImageCardProps {
  prescription: {
    imageUrl?: string;
    notes?: string;
  };
  headerSettings: any | null;
  footerSettings: any | null;
}

const PrescriptionImageCard: React.FC<PrescriptionImageCardProps> = ({
  prescription,
  headerSettings,
  footerSettings,
}) => {
  return (
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
        
        {prescription.imageUrl ? (
          <img 
            src={prescription.imageUrl} 
            alt="Prescription" 
            className="max-w-full border rounded-md" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-gray-50">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-2" />
            <p className="text-gray-500">No prescription image available</p>
          </div>
        )}
        
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
  );
};

export default PrescriptionImageCard;
