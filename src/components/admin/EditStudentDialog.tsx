
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";


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
    
    const response = await deleteStudent(student.rollNumber, student.uid);
    
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
                            <Input type="email" placeholder="student.email@example.com" {...field} className="glowing-shadow-sm" />
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
                                This action will permanently delete the student's record and their login account. This cannot be undone.
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
