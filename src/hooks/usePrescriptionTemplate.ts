
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { useAuth } from '@/contexts/AuthContext';

// Storage keys for header and footer settings
const HEADER_STORAGE_KEY = 'al_asad_prescription_header';
const FOOTER_STORAGE_KEY = 'al_asad_prescription_footer';

export const usePrescriptionTemplate = () => {
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth(); // Track login state to reload settings
  
  // Load template settings from localStorage
  const loadTemplateSettings = () => {
    // Load header and footer settings
    const savedHeader = localStorage.getItem(HEADER_STORAGE_KEY);
    const savedFooter = localStorage.getItem(FOOTER_STORAGE_KEY);
    
    if (savedHeader) {
      const headerData = JSON.parse(savedHeader);
      // Adjust font sizes for mobile if needed
      if (isMobile && headerData.fontSize) {
        headerData.fontSize = Math.min(headerData.fontSize, 14); // Limit font size on mobile
      }
      setHeaderSettings(headerData);
    }
    
    if (savedFooter) {
      const footerData = JSON.parse(savedFooter);
      // Adjust font sizes for mobile if needed
      if (isMobile && footerData.fontSize) {
        footerData.fontSize = Math.min(footerData.fontSize, 12); // Limit font size on mobile
      }
      setFooterSettings(footerData);
    }
  };

  // Effect to reload settings when component mounts or user logs in
  useEffect(() => {
    loadTemplateSettings();
  }, [isMobile, user?.id]); // Reload when mobile state or user changes

  return {
    headerSettings,
    footerSettings,
    loadTemplateSettings
  };
};
