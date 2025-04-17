
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
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case ROLE.OWNER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case ROLE.ADMIN:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case ROLE.VISITOR:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    }
  };
  
  return (
    <div className="role-pill fade-in mb-4 text-center flex items-center justify-center gap-2">
      <span className="text-sm font-medium mr-1">Current Role:</span>
      <Badge variant="outline" className={cn("capitalize px-3 py-1", getRoleClass())}>
        {currentRole}
      </Badge>
      {currentRole === ROLE.DEVELOPER && (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 ml-1">
          Publish Enabled
        </Badge>
      )}
    </div>
  );
};

export default RoleIndicator;
