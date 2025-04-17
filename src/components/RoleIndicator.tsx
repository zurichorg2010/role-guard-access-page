
import React from 'react';
import { getCurrentRole } from '@/utils/roleGuard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ROLE } from '@/utils/roleGuard';

const RoleIndicator = () => {
  const [currentRole, setCurrentRole] = React.useState('');
  
  React.useEffect(() => {
    setCurrentRole(getCurrentRole());
    
    const handleStorageChange = () => {
      setCurrentRole(getCurrentRole());
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('roleChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('roleChanged', handleStorageChange);
    };
  }, []);
  
  const getRoleClass = () => {
    switch (currentRole) {
      case ROLE.DEVELOPER:
        return 'role-developer';
      case ROLE.OWNER:
        return 'role-owner';
      case ROLE.ADMIN:
        return 'role-admin';
      case ROLE.VISITOR:
        return 'role-visitor';
      default:
        return 'role-custom';
    }
  };
  
  return (
    <div className="role-pill fade-in mb-4 text-center flex items-center justify-center gap-2">
      <span className="text-sm font-medium mr-1">Current Role:</span>
      <Badge variant="outline" className={cn("capitalize", getRoleClass())}>
        {currentRole}
      </Badge>
    </div>
  );
};

export default RoleIndicator;
