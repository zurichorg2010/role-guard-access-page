
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  commitMessage: z.string().min(1, "Commit message is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function GitHubSyncForm() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState<boolean | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMessage: "",
    },
  });

  // Check GitHub connection status
  useEffect(() => {
    // This is a simple check - in a real app you might want to verify the connection more thoroughly
    const checkConnection = () => {
      try {
        // Listen for a custom event that might be triggered by the GitHub integration
        const handleGitHubEvent = (e: CustomEvent) => {
          console.log("GitHub event received:", e.detail);
          if (e.detail?.status === "success") {
            toast({
              title: "GitHub sync complete",
              description: e.detail.message || "Changes committed successfully",
            });
          } else if (e.detail?.status === "error") {
            toast({
              variant: "destructive",
              title: "GitHub sync failed",
              description: e.detail.message || "Failed to commit changes",
            });
          }
        };

        window.addEventListener('lovable:commit-result' as any, handleGitHubEvent as any);
        
        // For demo purposes, assume GitHub is connected if we can attach the event listener
        setIsGitHubConnected(true);
        
        return () => {
          window.removeEventListener('lovable:commit-result' as any, handleGitHubEvent as any);
        };
      } catch (error) {
        console.error("Error checking GitHub connection:", error);
        setIsGitHubConnected(false);
        return () => {};
      }
    };
    
    return checkConnection();
  }, [toast]);

  async function onSubmit(data: FormValues) {
    setIsSyncing(true);
    try {
      // Log the commit message to verify it's being captured
      console.log("Commit message:", data.commitMessage);
      
      toast({
        title: "Syncing changes...",
        description: `Commit message: "${data.commitMessage}"`,
      });
      
      // Dispatch the commit event - this should trigger the GitHub integration
      window.dispatchEvent(new CustomEvent('lovable:commit', {
        detail: {
          message: data.commitMessage,
          repository: "your-repo",
          owner: "your-username"
        }
      }));

      // Wait for the commit process to complete or timeout
      const timeout = setTimeout(() => {
        console.log("GitHub sync timeout - no response received");
        toast({
          variant: "destructive",
          title: "Sync status unknown",
          description: "No confirmation received from GitHub. Please check your repository.",
        });
        setIsSyncing(false);
      }, 5000);

      // The result should be handled by the event listener in useEffect
      
      // Clear timeout on component unmount
      return () => clearTimeout(timeout);
    } catch (error) {
      console.error("GitHub sync error:", error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Make sure you've connected your GitHub account in Lovable settings.",
      });
    } finally {
      // Don't reset the syncing state here - it will be reset by the event listener or timeout
    }
  }

  if (isGitHubConnected === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>GitHub Not Connected</AlertTitle>
        <AlertDescription>
          Please connect your GitHub account in Lovable settings before using this feature.
          Click on the GitHub button in the top right corner of the editor.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="commitMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commit Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your commit message here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isSyncing}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync to GitHub'}
        </Button>
      </form>
    </Form>
  );
}
