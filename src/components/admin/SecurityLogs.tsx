"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LoginAttempt } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { clearLoginAttempts } from "@/actions/studentActions";
import { useToast } from "@/hooks/use-toast";


type SecurityLogsProps = {
  attempts: LoginAttempt[];
};

export default function SecurityLogs({ attempts }: SecurityLogsProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearLogs = async () => {
    setIsClearing(true);
    const response = await clearLoginAttempts();
    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
    setIsClearing(false);
  };


  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
                Showing {attempts.length} unauthorized attempt(s) to access the admin panel.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="glowing-shadow-sm" disabled={attempts.length === 0 || isClearing}>
                        {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Clear Logs
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all {attempts.length} security log entries.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearLogs} disabled={isClearing}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        <ScrollArea className="h-[400px] rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Attempted By (if student)</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.email}</TableCell>
                        <TableCell>{attempt.studentName || 'Unknown User'}</TableCell>
                        <TableCell>{attempt.timestamp ? format(new Date(attempt.timestamp), "PPP p") : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="destructive">{attempt.status}</Badge>
                        </TableCell>
                    </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                          No unauthorized login attempts found.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
    </div>
  );
}
