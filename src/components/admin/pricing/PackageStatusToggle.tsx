
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="status-toggle" className="mr-2">Status:</Label>
      <Switch
        id="status-toggle"
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={disabled}
      />
      <span className={isActive ? "text-green-600" : "text-gray-500"}>
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
};

export default PackageStatusToggle;
