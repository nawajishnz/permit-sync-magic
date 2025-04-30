
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
  topic: string;
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ open, onClose, topic }) => {
  const getHelpContent = () => {
    switch (topic) {
      case 'visa-packages':
        return (
          <>
            <h3 className="font-semibold text-lg mb-2">How to Add & Activate Visa Packages</h3>
            
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold">Step 1: Select a Country</h4>
                <p>From the dropdown menu, select the country you want to manage.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold">Step 2: Activate the Package</h4>
                <p>Toggle the status switch to "Active" to enable the visa package.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold">Step 3: Set Pricing Details</h4>
                <p>Enter the government fee, service fee, and processing days.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold">Step 4: Save Your Changes</h4>
                <p>Click the "Save Changes" button to apply your settings.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold">Troubleshooting</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If packages aren't showing, try the "Refresh Data" button</li>
                  <li>The "Diagnose" button can identify database issues</li>
                  <li>You must activate a package before editing its details</li>
                  <li>Total price is automatically calculated from the fees</li>
                </ul>
              </div>
            </div>
          </>
        );
        
      default:
        return <p>Select a help topic to get started.</p>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Help Guide</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {getHelpContent()}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpOverlay;
