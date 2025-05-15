
import { toast } from '@/components/ui/use-toast';

// Function to create a combined image with header, prescription image, and footer
export const createCombinedPrescriptionImage = async (
  prescription: { imageUrl: string },
  headerSettings: any | null,
  footerSettings: any | null
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!prescription) {
      reject('Prescription not found');
      return;
    }

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject('Failed to get canvas context');
      return;
    }

    // Load the prescription image first to determine dimensions
    const prescriptionImg = new Image();
    prescriptionImg.crossOrigin = 'anonymous';
    prescriptionImg.onload = () => {
      // Set canvas size based on prescription image
      const width = prescriptionImg.width;
      // Add extra space for header and footer
      const headerHeight = headerSettings ? 120 : 60;
      const footerHeight = footerSettings ? 80 : 40;
      const totalHeight = prescriptionImg.height + headerHeight + footerHeight;
      
      canvas.width = width;
      canvas.height = totalHeight;
      
      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, totalHeight);
      
      // Add header
      ctx.save();
      if (headerSettings) {
        // Set font styles based on header settings
        ctx.font = `${headerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'} ${headerSettings.fontSize === 'small' ? '14px' : headerSettings.fontSize === 'medium' ? '16px' : '18px'} Arial, sans-serif`;
        ctx.textAlign = (headerSettings.alignment || 'center') as CanvasTextAlign;
        
        // Draw header text
        const yPos = 30;
        
        if (headerSettings.text) {
          ctx.fillStyle = '#000000';
          ctx.fillText(headerSettings.text, headerSettings.alignment === 'center' ? width / 2 : headerSettings.alignment === 'right' ? width - 20 : 20, yPos);
        }
        
        if (headerSettings.address) {
          ctx.font = `12px Arial, sans-serif`;
          ctx.fillText(headerSettings.address, headerSettings.alignment === 'center' ? width / 2 : headerSettings.alignment === 'right' ? width - 20 : 20, yPos + 20);
        }
        
        if (headerSettings.contact) {
          ctx.font = `12px Arial, sans-serif`;
          ctx.fillText(headerSettings.contact, headerSettings.alignment === 'center' ? width / 2 : headerSettings.alignment === 'right' ? width - 20 : 20, yPos + 40);
        }
        
        // If logo exists, draw it
        if (headerSettings.logo) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            const logoHeight = 40;
            const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
            let logoX = 20;
            
            if (headerSettings.alignment === 'center') {
              logoX = (width / 2) - 100;
            } else if (headerSettings.alignment === 'right') {
              logoX = width - 140;
            }
            
            ctx.drawImage(logoImg, logoX, 15, logoWidth, logoHeight);
            
            // Draw horizontal line to separate header
            ctx.beginPath();
            ctx.moveTo(20, headerHeight - 10);
            ctx.lineTo(width - 20, headerHeight - 10);
            ctx.strokeStyle = '#CCCCCC';
            ctx.stroke();
            
            // Continue with the rest of the document
            drawPrescriptionAndFooter();
          };
          logoImg.onerror = () => {
            console.error('Failed to load logo');
            // Draw horizontal line anyway
            ctx.beginPath();
            ctx.moveTo(20, headerHeight - 10);
            ctx.lineTo(width - 20, headerHeight - 10);
            ctx.strokeStyle = '#CCCCCC';
            ctx.stroke();
            
            drawPrescriptionAndFooter();
          };
          logoImg.src = headerSettings.logo;
        } else {
          // Draw horizontal line to separate header
          ctx.beginPath();
          ctx.moveTo(20, headerHeight - 10);
          ctx.lineTo(width - 20, headerHeight - 10);
          ctx.strokeStyle = '#CCCCCC';
          ctx.stroke();
          
          drawPrescriptionAndFooter();
        }
      } else {
        // Simple default header
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText('Al-Asad Clinic', width / 2, 35);
        
        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(20, headerHeight - 10);
        ctx.lineTo(width - 20, headerHeight - 10);
        ctx.strokeStyle = '#CCCCCC';
        ctx.stroke();
        
        drawPrescriptionAndFooter();
      }
      
      function drawPrescriptionAndFooter() {
        // Draw prescription image
        ctx.drawImage(prescriptionImg, 0, headerHeight, width, prescriptionImg.height);
        
        // Add footer
        const footerY = headerHeight + prescriptionImg.height + 10;
        
        ctx.save();
        if (footerSettings) {
          // Set font styles based on footer settings
          ctx.font = `${footerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'} ${footerSettings.fontSize === 'small' ? '12px' : footerSettings.fontSize === 'medium' ? '14px' : '16px'} Arial, sans-serif`;
          ctx.textAlign = (footerSettings.alignment || 'center') as CanvasTextAlign;
          ctx.fillStyle = '#000000';
          
          // Draw horizontal line to separate footer
          ctx.beginPath();
          ctx.moveTo(20, footerY);
          ctx.lineTo(width - 20, footerY);
          ctx.strokeStyle = '#CCCCCC';
          ctx.stroke();
          
          // Draw footer text
          if (footerSettings.text) {
            ctx.fillText(footerSettings.text, footerSettings.alignment === 'center' ? width / 2 : footerSettings.alignment === 'right' ? width - 20 : 20, footerY + 25);
          }
          
          if (footerSettings.additionalInfo) {
            ctx.font = `10px Arial, sans-serif`;
            ctx.fillText(footerSettings.additionalInfo, footerSettings.alignment === 'center' ? width / 2 : footerSettings.alignment === 'right' ? width - 20 : 20, footerY + 45);
          }
        } else {
          // Simple default footer
          ctx.beginPath();
          ctx.moveTo(20, footerY);
          ctx.lineTo(width - 20, footerY);
          ctx.strokeStyle = '#CCCCCC';
          ctx.stroke();
          
          ctx.font = 'normal 14px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000000';
          ctx.fillText("Doctor's Signature", width / 2, footerY + 25);
        }
        ctx.restore();
        
        // Convert canvas to data URL and resolve
        const combinedImageUrl = canvas.toDataURL('image/png');
        resolve(combinedImageUrl);
      }
    };
    
    prescriptionImg.onerror = () => {
      reject('Failed to load prescription image');
    };
    
    prescriptionImg.src = prescription.imageUrl;
  });
};

// Function to download the combined prescription image
export const downloadPrescription = async (
  prescription: { imageUrl: string },
  patient: { mrNumber: string },
  prescriptionDate: string,
  headerSettings: any | null,
  footerSettings: any | null
) => {
  try {
    toast({
      title: 'Preparing download',
      description: 'Creating prescription document...',
    });
    
    const combinedImageUrl = await createCombinedPrescriptionImage(prescription, headerSettings, footerSettings);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = combinedImageUrl;
    link.download = `prescription-${patient?.mrNumber}-${new Date(prescriptionDate).toLocaleDateString().replace(/\//g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Download complete',
      description: 'Prescription has been downloaded successfully.',
    });
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: 'Download failed',
      description: 'Failed to prepare prescription for download.',
      variant: 'destructive',
    });
  }
};

// Function to generate a printable version of the prescription
export const printPrescription = (
  patient: any,
  prescription: any,
  headerSettings: any,
  footerSettings: any
) => {
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
