
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toggle } from '@/components/ui/toggle';

// Storage keys
const HEADER_STORAGE_KEY = 'al_asad_prescription_header';
const FOOTER_STORAGE_KEY = 'al_asad_prescription_footer';
const HEADER_LOGO_STORAGE_KEY = 'al_asad_prescription_header_logo';

// Default header and footer templates
const DEFAULT_HEADER = {
  text: 'Al-Asad Clinic',
  address: '123 Medical Plaza, Suite 101',
  contact: 'Phone: (555) 123-4567 | Email: info@alasadclinic.com',
  fontStyle: 'normal',
  fontSize: 'medium',
  alignment: 'center',
  logo: '',
};

const DEFAULT_FOOTER = {
  text: 'Thank you for visiting Al-Asad Clinic',
  additionalInfo: '© Al-Asad Clinic. All rights reserved.',
  fontStyle: 'normal',
  fontSize: 'small',
  alignment: 'center',
};

// Font size options
const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const PrescriptionTemplate: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('header');
  
  // Header state
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [headerLogo, setHeaderLogo] = useState<string | null>(null);
  
  // Footer state
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  
  // Load saved settings
  useEffect(() => {
    // Load header settings
    const savedHeader = localStorage.getItem(HEADER_STORAGE_KEY);
    if (savedHeader) {
      setHeader(JSON.parse(savedHeader));
    }
    
    // Load footer settings
    const savedFooter = localStorage.getItem(FOOTER_STORAGE_KEY);
    if (savedFooter) {
      setFooter(JSON.parse(savedFooter));
    }
    
    // Load header logo
    const savedHeaderLogo = localStorage.getItem(HEADER_LOGO_STORAGE_KEY);
    if (savedHeaderLogo) {
      setHeaderLogo(savedHeaderLogo);
    }
  }, []);
  
  // Function to handle header logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo image must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or SVG image',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert to base64 and save
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setHeaderLogo(base64);
      localStorage.setItem(HEADER_LOGO_STORAGE_KEY, base64);
      
      // Update header object with logo
      const updatedHeader = { ...header, logo: base64 };
      setHeader(updatedHeader);
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(updatedHeader));
      
      toast({
        title: 'Logo uploaded',
        description: 'Prescription header logo has been updated',
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Function to remove logo
  const handleRemoveLogo = () => {
    setHeaderLogo(null);
    localStorage.removeItem(HEADER_LOGO_STORAGE_KEY);
    
    // Update header object without logo
    const updatedHeader = { ...header, logo: '' };
    setHeader(updatedHeader);
    localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(updatedHeader));
    
    toast({
      title: 'Logo removed',
      description: 'Prescription header logo has been removed',
    });
  };
  
  // Function to save header settings
  const saveHeaderSettings = () => {
    localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(header));
    toast({
      title: 'Header saved',
      description: 'Prescription header settings have been saved',
    });
  };
  
  // Function to save footer settings
  const saveFooterSettings = () => {
    localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(footer));
    toast({
      title: 'Footer saved',
      description: 'Prescription footer settings have been saved',
    });
  };
  
  // Function to toggle bold text
  const toggleBold = (type: 'header' | 'footer') => {
    if (type === 'header') {
      const newStyle = header.fontStyle.includes('bold') 
        ? header.fontStyle.replace('bold', 'normal') 
        : 'bold';
      setHeader({ ...header, fontStyle: newStyle });
    } else {
      const newStyle = footer.fontStyle.includes('bold') 
        ? footer.fontStyle.replace('bold', 'normal') 
        : 'bold';
      setFooter({ ...footer, fontStyle: newStyle });
    }
  };
  
  // Function to toggle italic text
  const toggleItalic = (type: 'header' | 'footer') => {
    if (type === 'header') {
      const newStyle = header.fontStyle.includes('italic') 
        ? header.fontStyle.replace('italic', 'normal') 
        : 'italic';
      setHeader({ ...header, fontStyle: newStyle });
    } else {
      const newStyle = footer.fontStyle.includes('italic') 
        ? footer.fontStyle.replace('italic', 'normal') 
        : 'italic';
      setFooter({ ...footer, fontStyle: newStyle });
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prescription Template Settings</h2>
      <p className="text-gray-500">
        Customize how your prescriptions look with custom header and footer content.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="header">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Header Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="header-title">Clinic Name/Title</Label>
                  <Input
                    id="header-title"
                    value={header.text}
                    onChange={(e) => setHeader({ ...header, text: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="header-address">Address</Label>
                  <Input
                    id="header-address"
                    value={header.address}
                    onChange={(e) => setHeader({ ...header, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="header-contact">Contact Information</Label>
                  <Input
                    id="header-contact"
                    value={header.contact}
                    onChange={(e) => setHeader({ ...header, contact: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Text Styling</Label>
                  <div className="flex gap-2">
                    <Toggle 
                      pressed={header.fontStyle.includes('bold')}
                      onPressedChange={() => toggleBold('header')}
                      aria-label="Bold text"
                    >
                      <Bold className="h-4 w-4" />
                    </Toggle>
                    
                    <Toggle 
                      pressed={header.fontStyle.includes('italic')}
                      onPressedChange={() => toggleItalic('header')}
                      aria-label="Italic text"
                    >
                      <Italic className="h-4 w-4" />
                    </Toggle>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="header-font-size">Font Size</Label>
                    <Select
                      value={header.fontSize}
                      onValueChange={(val) => setHeader({ ...header, fontSize: val })}
                    >
                      <SelectTrigger id="header-font-size">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <div className="flex gap-2">
                      <Toggle 
                        pressed={header.alignment === 'left'}
                        onPressedChange={() => setHeader({ ...header, alignment: 'left' })}
                        aria-label="Align left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Toggle>
                      
                      <Toggle 
                        pressed={header.alignment === 'center'}
                        onPressedChange={() => setHeader({ ...header, alignment: 'center' })}
                        aria-label="Align center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Toggle>
                      
                      <Toggle 
                        pressed={header.alignment === 'right'}
                        onPressedChange={() => setHeader({ ...header, alignment: 'right' })}
                        aria-label="Align right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </Toggle>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Logo</Label>
                  {headerLogo ? (
                    <div className="space-y-2">
                      <div className="border rounded p-2 max-w-[200px]">
                        <img 
                          src={headerLogo} 
                          alt="Header Logo" 
                          className="max-h-16 object-contain mx-auto" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" type="button" onClick={handleRemoveLogo}>
                          Remove Logo
                        </Button>
                        <Label 
                          htmlFor="header-logo-upload" 
                          className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm"
                        >
                          Change Logo
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <Label 
                      htmlFor="header-logo-upload" 
                      className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 block w-full text-center px-4 py-2 rounded-md"
                    >
                      Upload Logo
                    </Label>
                  )}
                  <Input
                    id="header-logo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-gray-500">Max file size: 2MB. Formats: JPG, PNG, SVG</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveHeaderSettings} className="w-full">Save Header Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border p-4 rounded-md bg-white min-h-[200px]">
                  <div 
                    className="mb-4 pb-4 border-b"
                    style={{
                      fontWeight: header.fontStyle.includes('bold') ? 'bold' : 'normal',
                      fontStyle: header.fontStyle.includes('italic') ? 'italic' : 'normal',
                      fontSize: header.fontSize === 'small' ? '14px' : header.fontSize === 'medium' ? '18px' : '22px',
                      textAlign: header.alignment as 'left' | 'center' | 'right',
                    }}
                  >
                    <div className="flex items-center gap-3 justify-start">
                      {headerLogo && (
                        <img 
                          src={headerLogo} 
                          alt="Header Logo" 
                          className="max-h-12 object-contain" 
                        />
                      )}
                      <div className={`${headerLogo ? "" : "w-full"}`}>
                        <div className="font-semibold">{header.text}</div>
                        <div className="text-sm">{header.address}</div>
                        <div className="text-sm">{header.contact}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-400 italic">
                    (Prescription content will appear here)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="footer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-text">Main Text</Label>
                  <Input
                    id="footer-text"
                    value={footer.text}
                    onChange={(e) => setFooter({ ...footer, text: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="footer-additional">Additional Information</Label>
                  <Textarea
                    id="footer-additional"
                    value={footer.additionalInfo}
                    onChange={(e) => setFooter({ ...footer, additionalInfo: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Text Styling</Label>
                  <div className="flex gap-2">
                    <Toggle 
                      pressed={footer.fontStyle.includes('bold')}
                      onPressedChange={() => toggleBold('footer')}
                      aria-label="Bold text"
                    >
                      <Bold className="h-4 w-4" />
                    </Toggle>
                    
                    <Toggle 
                      pressed={footer.fontStyle.includes('italic')}
                      onPressedChange={() => toggleItalic('footer')}
                      aria-label="Italic text"
                    >
                      <Italic className="h-4 w-4" />
                    </Toggle>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-font-size">Font Size</Label>
                    <Select
                      value={footer.fontSize}
                      onValueChange={(val) => setFooter({ ...footer, fontSize: val })}
                    >
                      <SelectTrigger id="footer-font-size">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <div className="flex gap-2">
                      <Toggle 
                        pressed={footer.alignment === 'left'}
                        onPressedChange={() => setFooter({ ...footer, alignment: 'left' })}
                        aria-label="Align left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Toggle>
                      
                      <Toggle 
                        pressed={footer.alignment === 'center'}
                        onPressedChange={() => setFooter({ ...footer, alignment: 'center' })}
                        aria-label="Align center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Toggle>
                      
                      <Toggle 
                        pressed={footer.alignment === 'right'}
                        onPressedChange={() => setFooter({ ...footer, alignment: 'right' })}
                        aria-label="Align right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </Toggle>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveFooterSettings} className="w-full">Save Footer Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border p-4 rounded-md bg-white min-h-[200px] flex flex-col">
                  <div className="text-center text-gray-400 italic flex-1">
                    (Prescription content will appear here)
                  </div>
                  
                  <div 
                    className="mt-4 pt-4 border-t"
                    style={{
                      fontWeight: footer.fontStyle.includes('bold') ? 'bold' : 'normal',
                      fontStyle: footer.fontStyle.includes('italic') ? 'italic' : 'normal',
                      fontSize: footer.fontSize === 'small' ? '12px' : footer.fontSize === 'medium' ? '14px' : '16px',
                      textAlign: footer.alignment as 'left' | 'center' | 'right',
                    }}
                  >
                    <div>{footer.text}</div>
                    <div className="mt-1">{footer.additionalInfo}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrescriptionTemplate;
