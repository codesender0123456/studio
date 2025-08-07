"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type StudentsTableProps = {
  students: Student[];
};

export default function StudentsTable({ students: initialStudents }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = initialStudents.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or roll number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm glowing-shadow-sm"
      />
      <ScrollArea className="h-[400px] rounded-md border border-border">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Roll No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent's Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.rollNumber}>
                <TableCell className="font-medium">{student.rollNumber}</TableCell>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>{student.parentsName}</TableCell>
                <TableCell>{student.class}th</TableCell>
                <TableCell>
                    <Badge variant="secondary">{student.stream}</Badge>
                </TableCell>
                <TableCell className="text-right">{student.total}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      student.result === "Pass"
                        ? "bg-primary/20 text-primary border-primary/50"
                        : "bg-destructive/20 text-destructive border-destructive/50"
                    )}
                    variant="outline"
                  >
                    {student.result}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
