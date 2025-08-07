"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { addStudent } from "@/actions/studentActions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  s1: z.coerce.number().min(0).max(100),
  s2: z.coerce.number().min(0).max(100),
  s3: z.coerce.number().min(0).max(100),
  s4: z.coerce.number().min(0).max(100),
  s5: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

const PASS_MARK = 33;

export default function AddStudentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rollNumber: "",
      studentName: "",
      parentsName: "",
      dob: "",
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
    },
  });

  const marks = form.watch(["s1", "s2", "s3", "s4", "s5"]);
  const total = marks.reduce((acc, mark) => acc + (Number(mark) || 0), 0);
  const result: "Pass" | "Fail" = marks.every(mark => (Number(mark) || 0) >= PASS_MARK) ? "Pass" : "Fail";

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    const fullData = { ...values, total, result };
    const response = await addStudent(fullData);

    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      form.reset();
    } else {
      toast({
        title: "Error",
        description: response.message,
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
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="glowing-shadow-sm" />
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
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
             <FormField
              key={i}
              control={form.control}
              name={`s${i+1}` as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject {i+1}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} className="glowing-shadow-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-card-foreground/5 holographic-card">
            <div className="text-lg font-medium">Total Marks: <span className="font-bold text-primary text-glow">{total} / 500</span></div>
            <div className="text-lg font-medium">Result: <span className={cn("font-bold text-glow", result === "Pass" ? "text-primary" : "text-destructive")}>{result}</span></div>
        </div>

        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
        </Button>
      </form>
    </Form>
  );
}
