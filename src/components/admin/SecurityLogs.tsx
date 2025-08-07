
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";

import type { LoginAttempt } from "@/lib/student-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { clearLoginAttempts } from "@/actions/studentActions";

type SecurityLogsProps = {
  attempts: LoginAttempt[];
  onRefresh: () => void;
};

export default function SecurityLogs({ attempts, onRefresh }: SecurityLogsProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearLogs = async () => {
    setIsClearing(true);
    const result = await clearLoginAttempts();
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      onRefresh(); // Refresh the list after clearing
    } else {
      toast({
        title: "Error",
        description: result.message || "An error occurred while clearing logs.",
        variant: "destructive",
      });
    }
    setIsClearing(false);
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Unauthorized Login Attempts</h3>
          <p className="text-sm text-muted-foreground">
            Logs of failed admin login attempts.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onRefresh} className="glowing-shadow-sm">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="glowing-shadow-sm" disabled={attempts.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Logs
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete all login attempt records. This cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearLogs} disabled={isClearing}>
                        {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      <ScrollArea className="h-[400px] rounded-md border border-border">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Email Address</TableHead>
              <TableHead>Registered Student</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.email}</TableCell>
                  <TableCell>{attempt.studentName || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(attempt.timestamp), "PPP p")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No unauthorized login attempts recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
