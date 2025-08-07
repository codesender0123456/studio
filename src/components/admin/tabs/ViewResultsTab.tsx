
"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, Trash2, Edit } from 'lucide-react';

import { db } from '@/lib/firebase';
import type { Student, MarksheetData, SubjectMarks } from '@/lib/student-types';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteMarksheet } from '@/actions/studentActions';
import EditMarksheetDialog from '../EditMarksheetDialog';

type ViewResultsTabProps = {
  student: Student;
};

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


export default function ViewResultsTab({ student }: ViewResultsTabProps) {
  const [marks, setMarks] = useState<MarksheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingMarksheet, setEditingMarksheet] = useState<MarksheetData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!student.rollNumber) {
        setLoading(false);
        setError("Student Roll Number is missing.");
        return;
    }

    setLoading(true);
    const studentRef = doc(db, "students", student.rollNumber.toLowerCase());
    const marksQuery = query(collection(studentRef, "marks"), orderBy("dateOfTest", "desc"));

    const unsubscribe = onSnapshot(marksQuery, (querySnapshot) => {
      const marksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MarksheetData);
      setMarks(marksData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching marks:", err);
      setError("Could not load test results.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [student.rollNumber]);

  const handleDelete = async (marksheetId: string) => {
    setIsDeleting(marksheetId);
    const response = await deleteMarksheet(student.rollNumber, marksheetId);
    if (response.success) {
      toast({ title: "Success", description: "Marksheet deleted successfully." });
    } else {
      toast({ title: "Error", description: response.message || "Failed to delete marksheet.", variant: "destructive" });
    }
    setIsDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading results...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  if (marks.length === 0) {
    return <p className="text-muted-foreground text-center">No results have been added for this student yet.</p>;
  }

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
        {marks.map((mark) => (
            <Accordion type="single" collapsible key={mark.id}>
                <AccordionItem value={mark.id!} className="border rounded-md px-4 bg-muted/20">
                     <div className="flex justify-between items-center w-full">
                        <AccordionTrigger className="flex-1">
                            <div className="flex flex-col text-left">
                                <span className="font-semibold">{mark.testName}</span>
                                <span className="text-xs text-muted-foreground">{mark.dateOfTest}</span>
                            </div>
                        </AccordionTrigger>
                        <div className="flex items-center gap-2 ml-4">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditingMarksheet(mark)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive" className="h-8 w-8 p-0" disabled={isDeleting === mark.id}>
                                        {isDeleting === mark.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the result for "{mark.testName}". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(mark.id!)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <AccordionContent>
                         <MarksheetResultItem marksheet={mark} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ))}
         {editingMarksheet && (
            <EditMarksheetDialog
                student={student}
                marksheet={editingMarksheet}
                onClose={() => setEditingMarksheet(null)}
            />
        )}
    </div>
  );
}
