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
import type { Student } from "@/lib/student-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditStudentDialog from "./EditStudentDialog";

type StudentsTableProps = {
  students: Student[];
};

export default function StudentsTable({ students: initialStudents }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const filteredStudents = initialStudents
    .filter(
      (student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((student) =>
      classFilter === "all" ? true : student.class === Number(classFilter)
    )
    .filter((student) => {
      if (streamFilter === 'all') {
        return true;
      }
      return student.stream === streamFilter;
    });
  
  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
              placeholder="Search by name, roll no, or email..."
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
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                      <SelectItem value="MHT-CET">MHT-CET</SelectItem>
                      <SelectItem value="Regular Batch">Regular Batch</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </div>
        <ScrollArea className="h-[400px] rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[100px]">Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[80px]">Class</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead className="w-[120px]">Batch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <DialogTrigger asChild key={student.rollNumber}>
                      <TableRow onClick={() => handleRowClick(student)} className="cursor-pointer">
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.class}th</TableCell>
                          <TableCell>
                              <Badge variant="secondary">{student.stream}</Badge>
                          </TableCell>
                          <TableCell>{student.batch}</TableCell>
                      </TableRow>
                    </DialogTrigger>
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
      {selectedStudent && (
        <EditStudentDialog 
          student={selectedStudent} 
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </Dialog>
  );
}
