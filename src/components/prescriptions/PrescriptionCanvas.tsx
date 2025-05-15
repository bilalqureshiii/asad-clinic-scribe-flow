
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DrawingCanvas from '@/components/prescriptions/DrawingCanvas';

interface PrescriptionCanvasProps {
  prescriptionImage: string | null;
  setPrescriptionImage: (image: string | null) => void;
  headerSettings: any | null;
  footerSettings: any | null;
}

const PrescriptionCanvas: React.FC<PrescriptionCanvasProps> = ({ 
  prescriptionImage, 
  setPrescriptionImage,
  headerSettings,
  footerSettings
}) => {
  return (
    <div>
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
          <div className="border p-2 rounded-md" style={{ maxHeight: '480px', overflow: 'auto' }}>
            <img 
              src={prescriptionImage} 
              alt="Prescription" 
              className="max-w-full" 
              style={{ maxHeight: '100%', objectFit: 'contain' }}
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
    </div>
  );
};

export default PrescriptionCanvas;
