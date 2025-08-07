
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { getAuth, signInWithPopup, GoogleAuthProvider, reauthenticateWithPopup, deleteUser } from "firebase/auth";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateStudent, deleteStudent } from "@/actions/studentActions";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Student } from "@/lib/student-types";
import { updateStudentSchema } from "@/lib/schemas";


type FormValues = z.infer<typeof updateStudentSchema>;

type EditStudentDialogProps = {
    student: Student;
    onClose: () => void;
}

export default function EditStudentDialog({ student, onClose }: EditStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

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

  async function onUpdate(values: FormValues) {
    setIsSubmitting(true);
    const response = await updateStudent(student.rollNumber, values);

    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: response.message || "An error occurred.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  async function onDelete() {
    setIsDeleting(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ title: "Authentication Error", description: "Admin user not found. Please sign in again.", variant: "destructive" });
        setIsDeleting(false);
        return;
    }
    
    try {
        const response = await deleteStudent(student.rollNumber);
        
        if (response.success) {
            toast({
                title: "Success",
                description: `Student record for ${student.studentName} deleted. Now, please re-authenticate to delete their login account.`,
            });
            
            // Re-authenticate admin to get fresh credentials for deleting the user
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(currentUser, provider);
            
            // This is a placeholder. In a real app, you would need a secure way
            // to get the student's auth object to delete them. This will not work
            // as you cannot delete another user from the client-side SDK directly.
            // This operation requires the Admin SDK.
            // For the purpose of this demo, we will log a message.
            console.log(`Deletion of auth user for ${student.email} would require Admin SDK.`);
            toast({
              title: "Manual Action Required",
              description: `Student record deleted. Please manually delete the user ${student.email} from the Firebase Authentication console.`,
              variant: "default",
              duration: 10000,
            })
            
            onClose();
        } else {
            toast({
                title: "Error Deleting Record",
                description: response.message || "An error occurred while deleting the student record.",
                variant: "destructive",
            });
        }
    } catch (error: any) {
        console.error("Error during deletion process: ", error);
        if (error.code === 'auth/requires-recent-login') {
            toast({
                title: "Authentication Expired",
                description: "For security, please sign in again to delete this user.",
                variant: "destructive",
            });
        } else {
             toast({
                title: "Error",
                description: error.message || "An unknown error occurred during deletion.",
                variant: "destructive",
            });
        }
    }

    setIsDeleting(false);
  }

  return (
    <DialogContent className="sm:max-w-[625px] holographic-card">
        <DialogHeader>
            <DialogTitle>Edit Student: {student.studentName}</DialogTitle>
            <DialogDescription>
                Roll Number: {student.rollNumber} - Make changes to the student's profile here. Click save when you're done.
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student Name</FormLabel>
                            <FormControl>
                            <Input placeholder="John Doe" {...field} className="glowing-shadow-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="parentsName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent's Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Jane Doe" {...field} className="glowing-shadow-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>D.O.B.</FormLabel>
                            <FormControl>
                            <Input type="date" {...field} className="glowing-shadow-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student's Login Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="student.email@example.com" {...field} className="glowing-shadow-sm" readOnly />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                            <FormControl>
                                <SelectTrigger className="glowing-shadow-sm">
                                <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="11">11th</SelectItem>
                                <SelectItem value="12">12th</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stream"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stream</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="glowing-shadow-sm">
                                <SelectValue placeholder="Select a stream" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="JEE">JEE - Regular Batch</SelectItem>
                                <SelectItem value="NEET">NEET - Regular Batch</SelectItem>
                                <SelectItem value="MHT-CET">MHT-CET - Regular Batch</SelectItem>
                                <SelectItem value="Regular Batch">Regular Batch</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="batch"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Batch</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 2022-2024" {...field} className="glowing-shadow-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <DialogFooter className="pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="glowing-shadow-sm mr-auto" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 />}
                                Delete Student
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently delete the student's record from the database. You will need to manually delete their login account from the Firebase Console.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} disabled={isDeleting}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <DialogClose asChild>
                        <Button variant="ghost" className="glowing-shadow-sm">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" className="glowing-shadow" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    </DialogContent>
  );
}
