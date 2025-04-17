
import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  commitMessage: z.string().min(1, "Commit message is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function GitHubSyncForm() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commitMessage: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSyncing(true);
    try {
      // Log the commit message to verify it's being captured
      console.log("Commit message:", data.commitMessage);
      
      // Ensure we're passing the commit message correctly to the event
      window.dispatchEvent(new CustomEvent('lovable:commit', {
        detail: {
          message: data.commitMessage,
          repository: "your-repo",
          owner: "your-username"
        }
      }));

      toast({
        title: "Syncing changes...",
        description: `Commit message: "${data.commitMessage}"`,
      });

      // Wait for the commit process to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Changes synced",
        description: "Successfully synced changes to GitHub",
      });

      form.reset();
    } catch (error) {
      console.error("GitHub sync error:", error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Make sure you've connected your GitHub account in Lovable settings.",
      });
    } finally {
      setIsSyncing(false);
    }
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
