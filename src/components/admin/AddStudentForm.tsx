
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import debounce from "lodash.debounce";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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
import { saveStudentData, getStudentByEmail } from "@/actions/studentActions";
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
import { addStudentFormSchema } from "@/lib/schemas";


type FormValues = z.infer<typeof addStudentFormSchema>;

export default function AddStudentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(addStudentFormSchema),
    defaultValues: {
      rollNumber: "",
      studentName: "",
      parentsName: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      email: "",
      batch: "",
    },
    mode: 'onChange',
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
    
    // This is a placeholder password. The user will be forced to reset it.
    // In a real application, you would implement a more secure flow,
    // like sending a password reset email.
    const tempPassword = `password${Date.now()}`;
    const clientAuth = getAuth();

    try {
        // Step 1: Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(clientAuth, values.email, tempPassword);
        const user = userCredential.user;

        // Step 2: If user creation is successful, save the student data to Firestore
        const response = await saveStudentData({ ...values, uid: user.uid });

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
          // If saving data fails, we should ideally delete the created user
          // to avoid orphaned auth accounts.
          await user.delete();
          toast({
            title: "Error Saving Data",
            description: response.message || "An error occurred while saving student data. The user account was not created.",
            variant: "destructive",
          });
        }
    } catch (error: any) {
        // This will catch errors from both createUserWithEmailAndPassword and the server action
        toast({
            title: "Error Creating User",
            description: error.message || "An error occurred during user creation.",
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
                  A student with this email address already exists. Please use a different email or edit the existing student record from the 'View All Students' tab.
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
        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting || !!existingStudent || !form.formState.isValid}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
        </Button>
      </form>
    </Form>
  );
}
