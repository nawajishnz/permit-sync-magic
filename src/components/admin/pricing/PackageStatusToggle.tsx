
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PackageStatusToggleProps {
  isActive?: boolean;
  onToggle: (isActive: boolean) => Promise<void>;
  disabled?: boolean;
}

const PackageStatusToggle: React.FC<PackageStatusToggleProps> = ({
  isActive = false,
  onToggle,
  disabled = false
}) => {
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setIsToggling(true);
      await onToggle(checked);
      toast({
        title: checked ? "Package Activated" : "Package Deactivated",
        description: `The visa package has been ${checked ? 'activated' : 'deactivated'} successfully.`,
        duration: 3000
      });
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast({
        title: "Status Update Failed",
        description: error.message || "There was an error updating the package status.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="status-toggle" className="mr-2">Status:</Label>
      <Switch
        id="status-toggle"
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={disabled || isToggling}
      />
      <span className={isActive ? "text-green-600" : "text-gray-500"}>
        {isToggling ? "Updating..." : isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
};

export default PackageStatusToggle;
