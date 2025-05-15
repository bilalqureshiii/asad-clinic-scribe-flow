import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

// Function to create a combined image with header, prescription image, and footer
export const createCombinedPrescriptionImage = async (
  prescription: { imageUrl?: string },
  headerSettings: any | null,
  footerSettings: any | null
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!prescription) {
      reject('Prescription not found');
      return;
    }
    
    if (!prescription.imageUrl) {
      reject('No prescription image available');
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

// Function to generate a PDF with prescription details
export const generatePrescriptionPDF = async (
  prescription: { imageUrl?: string; notes?: string; date?: string },
  patient: { 
    mrNumber: string; 
    firstName?: string; 
    lastName?: string; 
    gender?: string; 
    dateOfBirth?: string 
  },
  prescriptionDate: string,
  headerSettings: any | null,
  footerSettings: any | null
): Promise<jsPDF> => {
  return new Promise(async (resolve, reject) => {
    if (!prescription || !prescription.imageUrl) {
      reject('No prescription image available');
      return;
    }

    try {
      // Create PDF document - A4 format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 15; // margin in mm
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin; // Start from top margin

      // Add header
      if (headerSettings) {
        // Add header logo if available
        if (headerSettings.logo) {
          try {
            // Add logo
            const logoHeight = 12; // mm
            pdf.addImage(
              headerSettings.logo, 
              'JPEG', 
              headerSettings.alignment === 'center' ? margin + (contentWidth / 2) - 15 : 
              headerSettings.alignment === 'right' ? pageWidth - margin - 30 : margin,
              yPosition, 
              30, // width in mm
              logoHeight
            );
            yPosition += logoHeight;
          } catch (err) {
            console.error('Failed to add logo to PDF:', err);
            // Continue without logo
          }
        }
        
        // Set font style based on header settings
        pdf.setFont(
          'helvetica', 
          headerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'
        );
        
        // Set font size based on header settings
        pdf.setFontSize(
          headerSettings.fontSize === 'small' ? 12 : 
          headerSettings.fontSize === 'medium' ? 16 : 18
        );
        
        // Add header text
        if (headerSettings.text) {
          yPosition += 7;
          const textX = headerSettings.alignment === 'center' ? pageWidth / 2 : 
                      headerSettings.alignment === 'right' ? pageWidth - margin : margin;
          
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            headerSettings.text, 
            textX, 
            yPosition, 
            { 
              align: headerSettings.alignment || 'center' 
            }
          );
        }
        
        // Add address with smaller font
        if (headerSettings.address) {
          yPosition += 6;
          pdf.setFontSize(10);
          pdf.text(
            headerSettings.address, 
            headerSettings.alignment === 'center' ? pageWidth / 2 : 
            headerSettings.alignment === 'right' ? pageWidth - margin : margin,
            yPosition,
            { align: headerSettings.alignment || 'center' }
          );
        }
        
        // Add contact info
        if (headerSettings.contact) {
          yPosition += 5;
          pdf.setFontSize(10);
          pdf.text(
            headerSettings.contact, 
            headerSettings.alignment === 'center' ? pageWidth / 2 : 
            headerSettings.alignment === 'right' ? pageWidth - margin : margin,
            yPosition,
            { align: headerSettings.alignment || 'center' }
          );
        }
        
        // Add a line separator
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      } else {
        // Simple default header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Al-Asad Clinic', pageWidth / 2, yPosition + 6, { align: 'center' });
        
        yPosition += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
      
      // Add patient information
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Patient: ${patient.firstName || ''} ${patient.lastName || ''}`, margin, yPosition + 5);
      pdf.text(`MR#: ${patient.mrNumber}`, margin, yPosition + 10);
      pdf.text(`Date: ${new Date(prescriptionDate).toLocaleDateString()}`, pageWidth - margin, yPosition + 5, { align: 'right' });
      
      if (patient.gender || patient.dateOfBirth) {
        let infoText = '';
        if (patient.gender) infoText += `Gender: ${patient.gender}`;
        if (patient.dateOfBirth) {
          if (infoText) infoText += ' | ';
          infoText += `DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`;
        }
        pdf.text(infoText, pageWidth - margin, yPosition + 10, { align: 'right' });
      }
      
      yPosition += 15;
      
      // Add prescription image - need to calculate dimensions to fit the page
      try {
        return new Promise<void>((loadResolve, loadReject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          
          img.onload = () => {
            try {
              // Calculate aspect ratio to fit within content width
              const imgAspectRatio = img.width / img.height;
              const imgWidth = contentWidth;
              const imgHeight = imgWidth / imgAspectRatio;
              
              // Add image to PDF
              pdf.addImage(
                img, 
                'JPEG', 
                margin, 
                yPosition, 
                imgWidth, 
                imgHeight
              );
              
              yPosition += imgHeight + 10; // Move position after image
              
              // Add notes if available
              if (prescription.notes) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Notes:', margin, yPosition);
                pdf.setFont('helvetica', 'normal');
                
                const splitNotes = pdf.splitTextToSize(prescription.notes, contentWidth);
                pdf.text(splitNotes, margin, yPosition + 5);
                
                yPosition += splitNotes.length * 5 + 10;
              }
              
              // Check if we need to add a page for the footer
              if (yPosition > pdf.internal.pageSize.height - 30) {
                pdf.addPage();
                yPosition = margin;
              }
              
              // Add footer
              const footerY = pdf.internal.pageSize.height - 25;
              
              if (footerSettings) {
                // Add a line separator
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                
                // Set font style based on footer settings
                pdf.setFont(
                  'helvetica', 
                  footerSettings.fontStyle?.includes('bold') ? 'bold' : 'normal'
                );
                
                // Set font size based on footer settings
                pdf.setFontSize(
                  footerSettings.fontSize === 'small' ? 10 : 
                  footerSettings.fontSize === 'medium' ? 12 : 14
                );
                
                // Add footer text
                if (footerSettings.text) {
                  pdf.text(
                    footerSettings.text, 
                    footerSettings.alignment === 'center' ? pageWidth / 2 : 
                    footerSettings.alignment === 'right' ? pageWidth - margin : margin,
                    footerY,
                    { align: footerSettings.alignment || 'center' }
                  );
                }
                
                // Add additional info with smaller font
                if (footerSettings.additionalInfo) {
                  pdf.setFontSize(8);
                  pdf.text(
                    footerSettings.additionalInfo, 
                    footerSettings.alignment === 'center' ? pageWidth / 2 : 
                    footerSettings.alignment === 'right' ? pageWidth - margin : margin,
                    footerY + 5,
                    { align: footerSettings.alignment || 'center' }
                  );
                }
              } else {
                // Simple default footer
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text("Doctor's Signature", pageWidth / 2, footerY, { align: 'center' });
              }
              
              loadResolve();
              resolve(pdf);
            } catch (error) {
              console.error('Error processing image for PDF:', error);
              loadReject(error);
              reject('Failed to process prescription image for PDF');
            }
          };
          
          img.onerror = (err) => {
            console.error('Failed to load image for PDF:', err);
            loadReject(err);
            reject('Failed to load prescription image for PDF');
          };
          
          img.src = prescription.imageUrl as string;
        });
      } catch (error) {
        console.error('Error in PDF image loading:', error);
        reject('Failed to generate PDF with prescription image');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      reject('Failed to generate prescription PDF');
    }
  });
};

// Function to download the combined prescription image
export const downloadPrescription = async (
  prescription: { imageUrl?: string; notes?: string; date?: string },
  patient: { mrNumber: string; firstName?: string; lastName?: string; gender?: string; dateOfBirth?: string },
  prescriptionDate: string,
  headerSettings: any | null,
  footerSettings: any | null
) => {
  try {
    if (!prescription.imageUrl) {
      toast({
        title: 'Download failed',
        description: 'No prescription image available to download.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Preparing download',
      description: 'Creating prescription document...',
    });
    
    // Generate PDF
    const pdf = await generatePrescriptionPDF(
      prescription,
      patient,
      prescriptionDate,
      headerSettings,
      footerSettings
    );
    
    // Save PDF file
    const fileName = `prescription-${patient?.mrNumber}-${new Date(prescriptionDate).toLocaleDateString().replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
    toast({
      title: 'Download complete',
      description: 'Prescription PDF has been downloaded successfully.',
    });
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: 'Download failed',
      description: typeof error === 'string' ? error : 'Failed to prepare prescription for download.',
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
  // Check if prescription has an image
  if (!prescription.imageUrl) {
    toast({
      title: 'Print failed',
      description: 'No prescription image available to print.',
      variant: 'destructive',
    });
    return;
  }

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
