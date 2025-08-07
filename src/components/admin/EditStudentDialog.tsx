
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { getAuth } from "firebase/auth";


import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { updateStudent, deleteStudent } from "@/actions/studentActions";
import { useToast } from "@/hooks/use-toast";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Student } from "@/lib/student-types";
import { updateStudentSchema } from "@/lib/schemas";
import EditStudentForm from "./forms/EditStudentForm";
import AddMarksheetForm from "./forms/AddMarksheetForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";


type FormValues = z.infer<typeof updateStudentSchema>;

type EditStudentDialogProps = {
    student: Student;
    onClose: () => void;
}

export default function EditStudentDialog({ student, onClose }: EditStudentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      studentName: student.studentName,
      parentsName: student.parentsName,
      dateOfBirth: student.dateOfBirth,
      email: student.email,
      class: student.class,
      stream: student.stream,
      batch: student.batch,
    },
  });

  async function onDelete() {
    setIsDeleting(true);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        toast({ title: "Error", description: "Admin not signed in.", variant: "destructive" });
        setIsDeleting(false);
        return;
    }
    
    try {
        const response = await deleteStudent(student.rollNumber);
        
        if (!response.success) {
            toast({ title: "Error", description: response.message || "Could not delete student record.", variant: "destructive" });
            setIsDeleting(false);
            return;
        }

        toast({ title: "Success", description: "Student record deleted. Now attempting to delete login account..."});

        if (student.uid) {
             toast({
                title: "Manual Action Required",
                description: `Student record for ${student.rollNumber} deleted. Please manually delete the user with email ${student.email} from the Firebase Authentication console.`,
                duration: 10000,
            });
        }
      
      onClose();
    } catch (error: any) {
        let errorMessage = "An unknown error occurred during deletion.";
        if (error.code === 'auth/requires-recent-login') {
            errorMessage = "This is a sensitive operation. Please sign out and sign back in to the admin panel before trying again.";
        }
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }

    setIsDeleting(false);
  }

  return (
    <DialogContent className="sm:max-w-[625px] holographic-card">
        <DialogHeader>
            <DialogTitle>Manage Student: {student.studentName}</DialogTitle>
            <DialogDescription>
                Roll Number: {student.rollNumber}
            </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="edit-details" className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList className="glowing-shadow-sm">
                    <TabsTrigger value="edit-details">Edit Details</TabsTrigger>
                    <TabsTrigger value="add-marksheet">Add Marksheet</TabsTrigger>
                </TabsList>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="glowing-shadow-sm" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 />}
                            Delete Student
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the student's database record. You will need to manually delete their login account from the Firebase Console. This cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} disabled={isDeleting}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <TabsContent value="edit-details">
                <EditStudentForm student={student} onClose={onClose} />
            </TabsContent>
            <TabsContent value="add-marksheet">
                <AddMarksheetForm student={student} />
            </TabsContent>
        </Tabs>
    </DialogContent>
  );
}
