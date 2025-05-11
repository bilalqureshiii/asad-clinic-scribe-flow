
import { useState, useEffect } from 'react';

// Storage keys for header and footer settings
const HEADER_STORAGE_KEY = 'al_asad_prescription_header';
const FOOTER_STORAGE_KEY = 'al_asad_prescription_footer';

export const usePrescriptionTemplate = () => {
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(null);

  useEffect(() => {
    // Load header and footer settings
    const savedHeader = localStorage.getItem(HEADER_STORAGE_KEY);
    const savedFooter = localStorage.getItem(FOOTER_STORAGE_KEY);
    
    if (savedHeader) {
      setHeaderSettings(JSON.parse(savedHeader));
    }
    
    if (savedFooter) {
      setFooterSettings(JSON.parse(savedFooter));
    }
  }, []);

  return {
    headerSettings,
    footerSettings
  };
};
