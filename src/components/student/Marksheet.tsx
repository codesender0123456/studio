
"use client";
import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { collection, getDocs, query, orderBy, doc } from "firebase/firestore";
import { Download, Loader2, LogOut, ChevronDown } from "lucide-react";

import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Student, MarksheetData, SubjectMarks } from "@/lib/student-types";
import { Icons } from "@/components/common/Icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "../ui/skeleton";


type MarksheetProps = {
  student: Student;
  onReset: () => void;
  isSigningOut: boolean;
};

const MarksheetDetails = ({ student }: { student: Student }) => {
    const formattedDate = student.dateOfBirth.split('-').reverse().join('-');
    return (
        <>
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
        </>
    )
}

const MarksheetResultItem = ({ marksheet }: { marksheet: MarksheetData }) => {
    const subjects = [
        { name: "Physics", data: marksheet.physics },
        { name: "Chemistry", data: marksheet.chemistry },
        { name: "Maths", data: marksheet.maths },
        { name: "Botany", data: marksheet.botany },
        { name: "Zoology", data: marksheet.zoology },
    ].filter(s => s.data && s.data.marks !== null && s.data.marks !== undefined) as { name: string; data: SubjectMarks }[];


    return (
        <div className="text-sm">
            <div className="grid grid-cols-3 gap-2 mb-2">
                <div><span className="font-semibold text-muted-foreground">Test Date:</span> {marksheet.dateOfTest}</div>
                <div className="text-center"><span className="font-semibold text-muted-foreground">Total:</span> {marksheet.total} / {marksheet.totalMax}</div>
                <div className="text-right"><span className="font-semibold text-muted-foreground">Result:</span> <Badge variant={marksheet.total > (marksheet.totalMax/2) ? 'default' : 'destructive'}>{marksheet.total > (marksheet.totalMax/2) ? 'Pass' : 'Fail'}</Badge></div>
            </div>
             <div className="grid grid-cols-3 gap-2 p-2 border rounded-md bg-muted/20">
                <div className="font-semibold text-center">Subject</div>
                <div className="font-semibold text-center">Marks</div>
                <div className="font-semibold text-center">Total Marks</div>
                
                {subjects.map(subject => (
                    <React.Fragment key={subject.name}>
                        <div className="text-center">
                            {subject.name}
                            {subject.data.topic && <div className="text-xs text-muted-foreground">({subject.data.topic})</div>}
                        </div>
                        <div className="text-center">{subject.data.marks}</div>
                        <div className="text-center">{subject.data.maxMarks}</div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default function Marksheet({ student, onReset, isSigningOut }: MarksheetProps) {
  const marksheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [marks, setMarks] = useState<MarksheetData[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarks = async () => {
        if(!student.rollNumber) return;
        setLoadingMarks(true);
        try {
            const studentRef = doc(db, "students", student.rollNumber.toLowerCase());
            const marksQuery = query(collection(studentRef, "marks"), orderBy("dateOfTest", "desc"));
            const querySnapshot = await getDocs(marksQuery);
            const marksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MarksheetData);
            setMarks(marksData);
        } catch (err) {
            console.error("Error fetching marks:", err);
            setError("Could not load test results.");
        } finally {
            setLoadingMarks(false);
        }
    }
    fetchMarks();
  }, [student.rollNumber])

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
  
  return (
    <Card className="w-full max-w-md mx-auto holographic-card glowing-shadow">
      <div ref={marksheetRef} className="p-6 bg-background/50">
        <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-center space-x-4">
                <Icons.logo className="h-20 w-20 text-primary" />
                <div>
                    <h2 className="text-2xl font-bold font-headline text-glow whitespace-nowrap">Phoenix Science Academy</h2>
                    <p className="text-sm text-center text-muted-foreground">Student Marksheet</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Accordion type="single" collapsible defaultValue="details">
                <AccordionItem value="details">
                    <AccordionTrigger className="text-base font-semibold">Student Details</AccordionTrigger>
                    <AccordionContent>
                        <MarksheetDetails student={student} />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="results">
                    <AccordionTrigger className="text-base font-semibold">Test Results</AccordionTrigger>
                    <AccordionContent>
                        {loadingMarks && (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        )}
                        {error && <p className="text-destructive text-center">{error}</p>}
                        {!loadingMarks && !error && marks.length === 0 && (
                            <p className="text-muted-foreground text-center text-sm">No test results found.</p>
                        )}
                        {!loadingMarks && marks.length > 0 && (
                            <Accordion type="single" collapsible className="w-full">
                                {marks.map((mark) => (
                                    <AccordionItem value={mark.id!} key={mark.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <span>{mark.testName}</span>
                                                <span className="text-muted-foreground">{mark.dateOfTest}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <MarksheetResultItem marksheet={mark} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
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
          Download Marksheet
        </Button>
      </CardFooter>
    </Card>
  );
}
