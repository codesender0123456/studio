"use client";

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
import { format } from "date-fns";


type SecurityLogsProps = {
  attempts: LoginAttempt[];
};

export default function SecurityLogs({ attempts }: SecurityLogsProps) {
  return (
    <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
            This log shows all unauthorized attempts to access the admin panel.
        </p>
        <ScrollArea className="h-[400px] rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.email}</TableCell>
                        <TableCell>{format(new Date(attempt.timestamp), "PPP p")}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="destructive">{attempt.status}</Badge>
                        </TableCell>
                    </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
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
