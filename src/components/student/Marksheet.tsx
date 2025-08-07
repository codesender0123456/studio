
"use client";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Student } from "@/lib/student-types";
import { Icons } from "@/components/common/Icons";

type MarksheetProps = {
  student: Student;
  onReset: () => void;
  isSigningOut: boolean;
};

export default function Marksheet({ student, onReset, isSigningOut }: MarksheetProps) {
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
    pdf.save(`student-details-${student.rollNumber}.pdf`);
    setIsDownloading(false);
  };
  
  const formattedDate = student.dateOfBirth.split('-').reverse().join('-');

  return (
    <Card className="w-full max-w-md mx-auto holographic-card glowing-shadow">
      <div ref={marksheetRef} className="p-6 bg-background/50">
        <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-center space-x-4">
                <Icons.logo className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-2xl font-bold font-headline text-glow">Phoenix Science Academy</h2>
                    <p className="text-sm text-center text-muted-foreground">Student Details</p>
                </div>
            </div>
        </CardHeader>
        <Separator className="my-4 bg-primary/20" />
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
            <div><span className="font-semibold text-muted-foreground">Student:</span> {student.studentName}</div>
            <div><span className="font-semibold text-muted-foreground">Roll No:</span> {student.rollNumber}</div>
            <div><span className="font-semibold text-muted-foreground">Parent:</span> {student.parentsName}</div>
            <div><span className="font-semibold text-muted-foreground">Date of Birth:</span> {formattedDate}</div>
            <div><span className="font-semibold text-muted-foreground">Stream:</span> <Badge variant="outline" className="text-xs">{student.stream}</Badge></div>
            <div><span className="font-semibold text-muted-foreground">Class:</span> <Badge variant="outline" className="text-xs">{student.class}th</Badge></div>
            <div className="col-span-2"><span className="font-semibold text-muted-foreground">Batch:</span> <Badge variant="outline" className="text-xs">{student.batch}</Badge></div>
            <div className="col-span-2"><span className="font-semibold text-muted-foreground">Email:</span> {student.email}</div>
          </div>
          
          <Separator className="my-4 bg-primary/20" />

          <div className="text-center text-sm text-muted-foreground">
            To view results for a specific test, please select the test from the student's profile.
          </div>
        
        </CardContent>
      </div>
      <CardFooter className="flex justify-between p-6">
        <Button variant="ghost" onClick={onReset} className="glowing-shadow-sm" disabled={isSigningOut}>
          {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          Sign Out
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="glowing-shadow">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download Details
        </Button>
      </CardFooter>
    </Card>
  );
}
