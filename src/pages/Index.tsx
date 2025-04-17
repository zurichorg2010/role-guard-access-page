import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, Lock, Info, Users } from 'lucide-react';
import { ROLE, hasAccess, applyRoleRestrictions, getCurrentRole } from '@/utils/roleGuard';
import SettingsModal from '@/components/SettingsModal';
import RoleIndicator from '@/components/RoleIndicator';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useEffect(() => {
    applyRoleRestrictions();
    
    const handleRoleChange = () => {
      applyRoleRestrictions();
    };
    
    document.addEventListener('roleChanged', handleRoleChange);
    
    return () => {
      document.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Role-Based Access Control</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete in-browser implementation of role-based access control with persistent role codes
          </p>
          <RoleIndicator />
        </header>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2"
            size="lg"
          >
            <Settings className="h-5 w-5" /> Role Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Public Information
              </CardTitle>
              <CardDescription>This content is visible to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Welcome to the role-based access control demo. This section is visible
                to everyone, regardless of their current role.
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">No access restrictions applied</p>
            </CardFooter>
          </Card>

          <Card data-role={ROLE.ADMIN}>
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>Content only visible to Admin, Owner, and Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section contains administrative controls and settings for managing 
                application settings and user permissions.
              </p>
              <div className="border rounded-md p-3 bg-secondary">
                <h4 className="font-medium mb-2">Admin Actions:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Manage custom role access codes</li>
                  <li>View user activity logs</li>
                  <li>Configure application settings</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Requires Admin role or higher</p>
            </CardFooter>
          </Card>

          <Card data-role={ROLE.OWNER}>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Owner Controls
              </CardTitle>
              <CardDescription>Content only visible to Owner and Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section contains owner-level controls for managing the entire system
                and delegating administrative permissions.
              </p>
              <div className="border rounded-md p-3 bg-secondary">
                <h4 className="font-medium mb-2">Owner Abilities:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Manage Admin role access code</li>
                  <li>Create and manage custom roles</li>
                  <li>Access sensitive system settings</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Requires Owner role or higher</p>
            </CardFooter>
          </Card>

          <Card data-role={ROLE.DEVELOPER}>
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Developer Access
              </CardTitle>
              <CardDescription>Content only visible to Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section contains developer-only controls and system information
                for debugging and maintenance.
              </p>
              <div className="border rounded-md p-3 bg-secondary">
                <h4 className="font-medium mb-2">Developer Tools:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Manage Owner role access code</li>
                  <li>View system debug information</li>
                  <li>Access all protected sections</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Requires Developer role</p>
            </CardFooter>
          </Card>

          <Card data-role="betaTester">
            <CardHeader className="bg-accent/10">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-foreground" />
                Beta Features
              </CardTitle>
              <CardDescription>Content only visible to Beta Testers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This section shows the unreleased beta features that are only available
                to beta testers and higher roles.
              </p>
              <div className="border rounded-md p-3 bg-secondary">
                <h4 className="font-medium mb-2">Beta Features:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Try new experimental functions</li>
                  <li>Provide feedback on upcoming features</li>
                  <li>Access beta-only documentation</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Requires Beta Tester role or Developer</p>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 p-4 border rounded-md bg-card">
          <h2 className="text-lg font-semibold mb-2">How to Use This Demo</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click the "Role Settings" button to open the settings modal</li>
            <li>
              Use these codes to test different roles:
              <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                <li>Developer: <code className="bg-muted px-1 py-0.5 rounded">112233</code></li>
                <li>Owner: <code className="bg-muted px-1 py-0.5 rounded">445566</code> (default, can be changed)</li>
                <li>Admin: <code className="bg-muted px-1 py-0.5 rounded">778899</code> (default, can be changed)</li>
                <li>Beta Tester: <code className="bg-muted px-1 py-0.5 rounded">123456</code> (default, can be changed)</li>
              </ul>
            </li>
            <li>Notice how different sections appear or disappear based on your role</li>
            <li>Higher-privilege roles can manage the access codes for lower roles</li>
          </ol>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
