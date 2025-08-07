"use client";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Student } from "@/lib/mock-data";
import { Icons } from "@/components/common/Icons";
import { cn } from "@/lib/utils";

type MarksheetProps = {
  student: Student;
  onReset: () => void;
};

const subjectDisplayNameMap = {
    physics: "Physics",
    chemistry: "Chemistry",
    maths: "Mathematics",
    zoology: "Zoology",
    botany: "Botany",
}

export default function Marksheet({ student, onReset }: MarksheetProps) {
  const marksheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!marksheetRef.current) return;
    setIsDownloading(true);

    const canvas = await html2canvas(marksheetRef.current, {
        backgroundColor: "#0d0d1a", // Dark background for canvas
        scale: 2, // Higher scale for better quality
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`marksheet-${student.rollNumber}.pdf`);
    setIsDownloading(false);
  };

  const subjectsToDisplay = Object.entries(student.subjects)
    .filter(([_, value]) => value !== null);
  
  const maxMarks = subjectsToDisplay.length * 100;

  return (
    <Card className="w-full max-w-md mx-auto holographic-card glowing-shadow">
      <div ref={marksheetRef} className="p-6 bg-background/50">
        <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-center space-x-4">
                <Icons.logo className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-2xl font-bold font-headline text-glow">ResultVerse Institute</h2>
                </div>
            </div>
        </CardHeader>
        <Separator className="my-4 bg-primary/20" />
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
            <div><span className="font-semibold text-muted-foreground">Student:</span> {student.studentName}</div>
            <div><span className="font-semibold text-muted-foreground">Roll No:</span> {student.rollNumber}</div>
            <div><span className="font-semibold text-muted-foreground">Parent:</span> {student.parentsName}</div>
            <div><span className="font-semibold text-muted-foreground">D.O.B:</span> {student.dob}</div>
            <div><span className="font-semibold text-muted-foreground">Stream:</span> <Badge variant="outline" className="text-xs">{student.stream}</Badge></div>
            <div><span className="font-semibold text-muted-foreground">Class:</span> <Badge variant="outline" className="text-xs">{student.class}th</Badge></div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Marks Obtained</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectsToDisplay.map(([subjectKey, mark]) => (
                <TableRow key={subjectKey}>
                  <TableCell>{subjectDisplayNameMap[subjectKey as keyof typeof subjectDisplayNameMap]}</TableCell>
                  <TableCell className="text-right">{mark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4 bg-primary/20" />

          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Marks:</span>
            <span className="text-primary text-glow">{student.total} / {maxMarks}</span>
          </div>

          <div className="flex justify-between items-center font-bold text-lg mt-2">
            <span>Result:</span>
            <Badge
                className={cn(
                    "text-lg",
                    student.result === "Pass"
                        ? "bg-primary/20 text-primary border-primary/50"
                        : "bg-destructive/20 text-destructive border-destructive/50"
                )}
                variant="outline"
                >
                {student.result}
            </Badge>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex justify-between p-6">
        <Button variant="ghost" onClick={onReset} className="glowing-shadow-sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Check Another
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="glowing-shadow">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
