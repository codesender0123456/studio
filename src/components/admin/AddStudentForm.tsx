
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Student } from "@/lib/student-types";


const formSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfTest: z.string().min(1, "Date of Test is required"),
  email: z.string().email("A valid email is required for student login."),
  password: z.string().min(6, "Password must be at least 6 characters."),
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
      dateOfTest: "",
      email: "",
      password: "",
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
      const { data } = await getStudentByEmail(email);
      if (data) {
        setExistingStudent(data as Student);
        form.setValue("studentName", data.studentName, { shouldValidate: true });
        form.setValue("class", data.class, { shouldValidate: true });
        form.setValue("stream", data.stream, { shouldValidate: true });
        form.setValue("batch", data.batch, { shouldValidate: true });
        form.setValue("parentsName", data.parentsName, { shouldValidate: true });
        form.setValue("rollNumber", data.rollNumber, { shouldValidate: true });
      } else {
        setExistingStudent(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkEmail(watchedEmail);
  }, [watchedEmail, checkEmail]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    const response = await addStudent(values);

    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      form.reset();
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
                <AlertDescription>
                  A student with this email already exists. Submitting will create a new login but may lead to duplicate records.
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
            name="dateOfTest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Registration</FormLabel>
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
         <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set Initial Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="glowing-shadow-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
        </Button>
      </form>
    </Form>
  );
}
