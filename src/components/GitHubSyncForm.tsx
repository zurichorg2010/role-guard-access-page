
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  commitMessage: z.string().min(1, "Commit message is required"),
  accessToken: z.string().min(1, "GitHub access token is required"),
  repositoryUrl: z.string().url("Please enter a valid GitHub repository URL"),
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
      accessToken: localStorage.getItem('github_access_token') || "",
      repositoryUrl: localStorage.getItem('github_repo_url') || "",
    },
  });

  // Extract owner and repo from GitHub URL
  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  useEffect(() => {
    const handleGitHubEvent = (e: CustomEvent) => {
      console.log("GitHub event received:", e.detail);
      if (e.detail?.status === "success") {
        toast({
          title: "GitHub sync complete",
          description: e.detail.message || "Changes committed successfully",
        });
        setIsSyncing(false);
      } else if (e.detail?.status === "error") {
        toast({
          variant: "destructive",
          title: "GitHub sync failed",
          description: e.detail.message || "Failed to commit changes",
        });
        setIsSyncing(false);
      }
    };

    window.addEventListener('lovable:commit-result' as any, handleGitHubEvent as any);
    setIsGitHubConnected(true);
    
    return () => {
      window.removeEventListener('lovable:commit-result' as any, handleGitHubEvent as any);
    };
  }, [toast]);

  async function onSubmit(data: FormValues) {
    setIsSyncing(true);
    
    // Save token and URL to localStorage
    localStorage.setItem('github_access_token', data.accessToken);
    localStorage.setItem('github_repo_url', data.repositoryUrl);

    try {
      console.log("Commit message:", data.commitMessage);
      console.log("Repository URL:", data.repositoryUrl);
      
      const repoInfo = parseGitHubUrl(data.repositoryUrl);
      if (!repoInfo) {
        throw new Error("Invalid GitHub repository URL");
      }

      toast({
        title: "Syncing changes...",
        description: `Commit message: "${data.commitMessage}"`,
      });

      window.dispatchEvent(new CustomEvent('lovable:commit', {
        detail: {
          message: data.commitMessage,
          repository: repoInfo.repo,
          owner: repoInfo.owner,
          token: data.accessToken
        }
      }));

      const timeout = setTimeout(() => {
        console.log("GitHub sync timeout - no response received");
        toast({
          variant: "destructive",
          title: "Sync status unknown",
          description: "No confirmation received from GitHub. Please check your repository.",
        });
        setIsSyncing(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } catch (error) {
      console.error("GitHub sync error:", error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync with GitHub",
      });
      setIsSyncing(false);
    }
  }

  if (isGitHubConnected === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>GitHub Not Connected</AlertTitle>
        <AlertDescription>
          Please check your GitHub access token and repository URL.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Access Token</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your GitHub access token..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repositoryUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Repository URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://github.com/username/repo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
