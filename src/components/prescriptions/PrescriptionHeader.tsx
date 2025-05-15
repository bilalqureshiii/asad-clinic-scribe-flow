
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrescriptionHeaderProps {
  mrNumber: string;
  date: string;
  onDownload: () => void;
  onPrint: () => void;
}

const PrescriptionHeader: React.FC<PrescriptionHeaderProps> = ({
  mrNumber,
  date,
  onDownload,
  onPrint,
}) => {
  return (
    <>
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
          <p className="text-gray-500">MR#: {mrNumber} | Date: {new Date(date).toLocaleDateString()}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onDownload}
          >
            <File className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onPrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </>
  );
};

export default PrescriptionHeader;
