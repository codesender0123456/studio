
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import debounce from "lodash.debounce";

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
import { addStudent, getStudentByEmail } from "@/actions/studentActions";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Student } from "@/lib/student-types";


const formSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfBirth: z.string().refine((date) => new Date(date) <= new Date(), {
    message: "Date of birth cannot be in the future.",
  }),
  email: z.string().email("A valid email is required for student login."),
  class: z.coerce.number({required_error: "Please select a class."}).min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"], { required_error: "Please select a stream."}),
  batch: z.string().min(1, "Batch is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddStudentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rollNumber: "",
      studentName: "",
      parentsName: "",
      dateOfBirth: new Date().toISOString().split('T')[0], // Set default to today
      email: "",
      batch: "",
    },
  });

  const watchedEmail = useWatch({ control: form.control, name: 'email'});

  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!z.string().email().safeParse(email).success) {
        setExistingStudent(null);
        return;
      }
      try {
        const { data, success, message } = await getStudentByEmail(email);
        if (success && data) {
          setExistingStudent(data as Student);
        } else if (!success) {
          // Handle case where the check itself fails, maybe show a toast
          console.error("Failed to check email:", message);
          setExistingStudent(null);
        } else {
          setExistingStudent(null);
        }
      } catch (error) {
        console.error("Error checking email existence:", error);
        setExistingStudent(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (watchedEmail) {
      checkEmail(watchedEmail);
    } else {
        setExistingStudent(null);
    }
  }, [watchedEmail, checkEmail]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    const response = await addStudent(values);

    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      form.reset({
        rollNumber: "",
        studentName: "",
        parentsName: "",
        dateOfBirth: new Date().toISOString().split('T')[0],
        email: "",
        batch: "",
        class: undefined,
        stream: undefined
      });
      setExistingStudent(null);
    } else {
      toast({
        title: "Error",
        description: response.message || "An error occurred.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Student's Login Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="student.email@example.com" {...field} className="glowing-shadow-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {existingStudent && (
              <Alert variant="destructive" className="md:col-span-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Student Already Exists</AlertTitle>
                <AlertDescription>
                  A student with this email address already exists in the system. Please use a different email or edit the existing student record from the 'View All Students' tab.
                </AlertDescription>
              </Alert>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rollNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2024001" {...field} className="glowing-shadow-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value) || ''}>
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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting || !!existingStudent}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
        </Button>
      </form>
    </Form>
  );
}
