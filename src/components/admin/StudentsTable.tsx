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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentsTableProps = {
  students: Student[];
};

export default function StudentsTable({ students: initialStudents }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");

  const filteredStudents = initialStudents
    .filter(
      (student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((student) =>
      classFilter === "all" ? true : student.class === Number(classFilter)
    )
    .filter((student) =>
      streamFilter === "all" ? true : student.stream === streamFilter
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm glowing-shadow-sm"
        />
        <div className="flex gap-4">
            <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[180px] glowing-shadow-sm">
                    <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="11">11th</SelectItem>
                    <SelectItem value="12">12th</SelectItem>
                </SelectContent>
            </Select>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
                <SelectTrigger className="w-[240px] glowing-shadow-sm">
                    <SelectValue placeholder="Filter by stream" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Streams</SelectItem>
                    <SelectItem value="JEE">JEE (PCM - Regular Batch)</SelectItem>
                    <SelectItem value="NEET">NEET (PCB - Regular Batch)</SelectItem>
                    <SelectItem value="MHT-CET">MHT-CET (PCMB - Regular Batch)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <ScrollArea className="h-[400px] rounded-md border border-border">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Roll No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent's Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Batch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                    <TableRow key={student.rollNumber}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.parentsName}</TableCell>
                        <TableCell>{student.class}th</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{student.stream}</Badge>
                        </TableCell>
                        <TableCell>{student.batch}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No results found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
