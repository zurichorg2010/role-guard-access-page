import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Key, Shield, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ROLE, 
  getCurrentRole, 
  tryBecomeRole, 
  getOwnerCode, 
  getAdminCode, 
  getCustomRoles, 
  saveCode, 
  saveCustomRoles, 
  OWNER_CODE_KEY, 
  ADMIN_CODE_KEY, 
  canManageRole
} from '@/utils/roleGuard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [accessCode, setAccessCode] = useState('');
  const [ownerCode, setOwnerCode] = useState(getOwnerCode());
  const [adminCode, setAdminCode] = useState(getAdminCode());
  const [customRoles, setCustomRoles] = useState<Record<string, string>>(getCustomRoles());
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const { toast } = useToast();
  
  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!/^\d{6}$/.test(accessCode)) {
        toast({
          variant: "destructive",
          title: "Invalid code format",
          description: "Code must be exactly 6 digits",
        });
        return;
      }
      
      const success = tryBecomeRole(accessCode);
      
      if (success) {
        toast({
          title: "Role changed",
          description: `You are now a ${getCurrentRole()}.`,
        });
        
        document.dispatchEvent(new Event('roleChanged'));
        
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: "The code you entered doesn't match any role.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleSaveOwnerCode = () => {
    try {
      saveCode(OWNER_CODE_KEY, ownerCode);
      toast({
        title: "Owner code updated",
        description: "The owner access code has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleSaveAdminCode = () => {
    try {
      saveCode(ADMIN_CODE_KEY, adminCode);
      toast({
        title: "Admin code updated",
        description: "The admin access code has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleSaveCustomRole = () => {
    try {
      if (!newRoleName.trim()) {
        toast({
          variant: "destructive",
          title: "Invalid role name",
          description: "Role name cannot be empty.",
        });
        return;
      }
      
      if (!/^\d{6}$/.test(newRoleCode)) {
        toast({
          variant: "destructive",
          title: "Invalid code format",
          description: "Code must be exactly 6 digits.",
        });
        return;
      }
      
      const updatedRoles = {
        ...customRoles,
        [newRoleName]: newRoleCode
      };
      
      saveCustomRoles(updatedRoles);
      setCustomRoles(updatedRoles);
      setNewRoleName('');
      setNewRoleCode('');
      
      toast({
        title: "Custom role added",
        description: `The role "${newRoleName}" has been added with code ${newRoleCode}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding role",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleDeleteCustomRole = (roleName: string) => {
    try {
      const { [roleName]: _, ...remainingRoles } = customRoles;
      saveCustomRoles(remainingRoles);
      setCustomRoles(remainingRoles);
      
      toast({
        title: "Custom role deleted",
        description: `The role "${roleName}" has been removed.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting role",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const updateCustomRoleCode = (roleName: string, newCode: string) => {
    try {
      if (!/^\d{6}$/.test(newCode)) {
        toast({
          variant: "destructive",
          title: "Invalid code format",
          description: "Code must be exactly 6 digits.",
        });
        return;
      }
      
      const updatedRoles = {
        ...customRoles,
        [roleName]: newCode
      };
      
      saveCustomRoles(updatedRoles);
      setCustomRoles(updatedRoles);
      
      toast({
        title: "Role code updated",
        description: `The code for "${roleName}" has been updated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setOwnerCode(getOwnerCode());
      setAdminCode(getAdminCode());
      setCustomRoles(getCustomRoles());
      setNewRoleName('');
      setNewRoleCode('');
    }
  }, [isOpen]);

  const currentRole = getCurrentRole();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Role Access Settings
            {currentRole === ROLE.DEVELOPER && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                Developer Mode
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Enter access codes to change roles or manage existing role codes.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access" className="flex items-center gap-1">
              <Key className="h-4 w-4" /> Access
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" /> Manage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="access" className="mt-4">
            <form onSubmit={handleSubmitCode}>
              <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Enter a 6-digit access code</h3>
                  <p className="text-sm text-muted-foreground">
                    To change your current role, enter the appropriate access code.
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="flex-1"
                  />
                  <Button type="submit">Enter</Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="manage" className="mt-4 space-y-6">
            {canManageRole(ROLE.OWNER) && (
              <div className="space-y-3 p-3 border rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" /> Owner Role Code
                </h3>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={ownerCode}
                    onChange={(e) => setOwnerCode(e.target.value)}
                    placeholder="6-digit code"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleSaveOwnerCode}>Save</Button>
                </div>
              </div>
            )}
            
            {canManageRole(ROLE.ADMIN) && (
              <div className="space-y-3 p-3 border rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-500" /> Admin Role Code
                </h3>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="6-digit code"
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleSaveAdminCode}>Save</Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Custom Roles</h3>
              
              {Object.entries(customRoles).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(customRoles).map(([roleName, roleCode]) => (
                    <div key={roleName} className="flex items-center space-x-2 p-2 border rounded-md">
                      <div className="flex-1 font-medium capitalize">{roleName}</div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        defaultValue={roleCode}
                        onBlur={(e) => updateCustomRoleCode(roleName, e.target.value)}
                        placeholder="6-digit code"
                        className="w-28"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCustomRole(roleName)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No custom roles yet.</p>
              )}
              
              {(currentRole === ROLE.DEVELOPER || currentRole === ROLE.OWNER || currentRole === ROLE.ADMIN) && (
                <div className="border p-3 rounded-md space-y-3">
                  <h4 className="text-sm font-medium">Add New Custom Role</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Role name"
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={newRoleCode}
                      onChange={(e) => setNewRoleCode(e.target.value)}
                      placeholder="6-digit code"
                    />
                  </div>
                  <Button 
                    onClick={handleSaveCustomRole} 
                    className="w-full"
                  >
                    Add Custom Role
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
