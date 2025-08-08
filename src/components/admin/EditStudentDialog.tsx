
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { updateStudent, deleteStudent } from "@/actions/studentActions";
import { deleteUser } from "@/actions/authActions";
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
import ViewResultsTab from "./tabs/ViewResultsTab";


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

    try {
        // Step 1: Delete the student's Firestore record
        const dbResponse = await deleteStudent(student.rollNumber);
        
        if (!dbResponse.success) {
            toast({ title: "Error", description: dbResponse.message || "Could not delete student record.", variant: "destructive" });
            setIsDeleting(false);
            return;
        }

        toast({ title: "Success", description: "Student record deleted. Now deleting login account..."});

        // Step 2: Delete the user's Firebase Authentication account
        if (student.uid) {
             const authResponse = await deleteUser(student.uid);
             if (authResponse.success) {
                toast({
                    title: "Complete",
                    description: `Successfully deleted student ${student.studentName} and their login account.`,
                });
             } else {
                 toast({
                    title: "Manual Action Required",
                    description: authResponse.message || `Student record deleted, but failed to delete login account for ${student.email}. Please delete it manually.`,
                    variant: "destructive",
                    duration: 10000,
                });
             }
        } else {
             toast({
                title: "Warning",
                description: `Student record deleted, but no associated User ID was found to delete the login account.`,
                variant: "destructive",
            });
        }
      
      onClose();
    } catch (error: any) {
        toast({ title: "Error", description: "An unknown error occurred during deletion.", variant: "destructive" });
    } finally {
        setIsDeleting(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-4xl holographic-card">
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
                    <TabsTrigger value="view-results">View Results</TabsTrigger>
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
                            This action will permanently delete the student's database record and their associated login account. This cannot be undone.
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
            <TabsContent value="view-results">
                <ViewResultsTab student={student} />
            </TabsContent>
        </Tabs>
    </DialogContent>
  );
}
