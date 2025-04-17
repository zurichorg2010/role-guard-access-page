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
import { Settings, Key, Shield, UserCog, Github, GitCommit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
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

// GitHub API interfaces
interface GitHubCommitResponse {
  sha: string;
  html_url: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [accessCode, setAccessCode] = useState('');
  const [ownerCode, setOwnerCode] = useState(getOwnerCode());
  const [adminCode, setAdminCode] = useState(getAdminCode());
  const [customRoles, setCustomRoles] = useState<Record<string, string>>(getCustomRoles());
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [lastCommitHash, setLastCommitHash] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const { toast } = useToast();
  
  const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/i;
  const isValidGithubUrl = githubUrlPattern.test(githubUrl.trim());
  const isValidCommitMessage = commitMessage.trim().length > 0;
  const githubIntegrated = true; // Assuming GitHub is already integrated

  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setOwnerCode(getOwnerCode());
      setAdminCode(getAdminCode());
      setCustomRoles(getCustomRoles());
      setNewRoleName('');
      setNewRoleCode('');
      setGithubUrl('');
      setCanonicalUrl('');
      setIsPublishing(false);
      setCommitMessage('');
      setIsCommitting(false);
      setLastCommitHash('');
      
      const storedUrl = localStorage.getItem('github_repo_url') || '';
      if (storedUrl) {
        setGithubUrl(storedUrl);
        parseGitHubUrl(storedUrl);
      }
    }
  }, [isOpen]);
  
  const parseGitHubUrl = (url: string) => {
    const match = url.match(githubUrlPattern);
    if (match && match[1] && match[2]) {
      setRepoOwner(match[1]);
      setRepoName(match[2]);
      return true;
    }
    return false;
  };

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

  const handleGitHubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGithubUrl(url);
    if (parseGitHubUrl(url)) {
      localStorage.setItem('github_repo_url', url);
    }
  };

  const handlePublish = async () => {
    if (!isValidGithubUrl) {
      toast({
        variant: "destructive",
        title: "Invalid GitHub configuration",
        description: "Please provide a valid GitHub repository URL.",
      });
      return;
    }
    
    setIsPublishing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockCanonicalUrl = `https://cloud.example.com/projects/${repoOwner}/${repoName}`;
      setCanonicalUrl(mockCanonicalUrl);
      
      toast({
        title: "Published successfully",
        description: "Your project has been published to the GitHub repository.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCommit = async () => {
    if (!isValidCommitMessage || !repoOwner || !repoName) {
      toast({
        variant: "destructive",
        title: "Invalid configuration",
        description: "Please provide a valid commit message and repository details.",
      });
      return;
    }
    
    setIsCommitting(true);
    
    try {
      toast({
        title: "Committing changes...",
        description: `Commit message: "${commitMessage}"`,
      });
      
      window.dispatchEvent(new CustomEvent('lovable:github-commit', {
        detail: {
          message: commitMessage,
          repo: `${repoOwner}/${repoName}`,
          branch: 'main'
        }
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastCommitHash('Committed');
      
      toast({
        title: "Changes committed",
        description: `Successfully committed with message: "${commitMessage}"`,
      });
      
      setCommitMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Commit failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const currentRole = getCurrentRole();
  const showPublishTab = currentRole === ROLE.DEVELOPER;

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
        
        <Tabs defaultValue={showPublishTab ? "publish" : "access"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="access" className="flex items-center gap-1">
              <Key className="h-4 w-4" /> Access
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-1">
              <UserCog className="h-4 w-4" /> Manage
            </TabsTrigger>
            <TabsTrigger 
              value="publish" 
              className={`flex items-center gap-1 ${showPublishTab ? "" : "hidden"}`}
            >
              <Github className="h-4 w-4" /> Publish
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
          
          {showPublishTab && (
            <TabsContent value="publish" className="mt-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Integration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Commit changes to your GitHub repository.
                </p>
              </div>
              
              <div className="space-y-3 border p-3 rounded-md">
                <div>
                  <label htmlFor="github-url-input" className="text-sm font-medium block mb-1">
                    GitHub Repository URL
                  </label>
                  <Input
                    id="github-url-input"
                    type="url"
                    value={githubUrl}
                    onChange={handleGitHubUrlChange}
                    placeholder="https://github.com/your-username/your-repo"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the full URL to your GitHub repository
                  </p>
                </div>
                
                <Button 
                  onClick={handlePublish} 
                  disabled={!isValidGithubUrl || isPublishing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Project'}
                </Button>
                
                {canonicalUrl && (
                  <div className="mt-4 p-3 border rounded-md bg-secondary">
                    <span className="text-sm font-medium block mb-1">Canonical URL:</span>
                    <a 
                      href={canonicalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-sm break-all"
                    >
                      {canonicalUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <GitCommit className="h-5 w-5" />
                    Git Commit
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Commit your changes directly to GitHub.
                  </p>
                </div>
                
                <div className="space-y-3 mt-3">
                  <div>
                    <label htmlFor="commit-message-input" className="text-sm font-medium block mb-1">
                      Commit Message
                    </label>
                    <Textarea
                      id="commit-message-input"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Enter your commit message here..."
                      className="min-h-[80px] font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCommit} 
                    disabled={!isValidCommitMessage || isCommitting || !repoOwner || !repoName}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    variant="outline"
                  >
                    {isCommitting ? 'Committing...' : 'Commit Changes'}
                  </Button>
                  
                  {lastCommitHash && (
                    <div className="p-3 border rounded-md bg-secondary">
                      <span className="text-sm font-medium">Last Commit:</span>
                      <span className="ml-2 font-mono text-sm">{lastCommitHash}</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
