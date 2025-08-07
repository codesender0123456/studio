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
  FormDescription,
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
  dateOfTest: z.string().min(1, "Date of Test is required"),
  class: z.coerce.number({required_error: "Please select a class."}).min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET"], { required_error: "Please select a stream."}),
  physics: z.coerce.number().min(0).max(100),
  chemistry: z.coerce.number().min(0).max(100),
  maths: z.coerce.number().min(0).max(100).optional(),
  zoology: z.coerce.number().min(0).max(100).optional(),
  botany: z.coerce.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PASS_MARK = 33;

const subjectFields = {
    JEE: ["physics", "chemistry", "maths"],
    NEET: ["physics", "chemistry", "zoology", "botany"],
    "MHT-CET": ["physics", "chemistry", "maths", "zoology", "botany"],
} as const;

export default function AddStudentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rollNumber: "",
      studentName: "",
      parentsName: "",
      dateOfTest: "",
      physics: 0,
      chemistry: 0,
      maths: 0,
      zoology: 0,
      botany: 0,
    },
  });

  const stream = form.watch("stream");
  
  const activeSubjects = stream ? subjectFields[stream] : [];
  
  const marks = form.watch(activeSubjects as any);
  
  const total = marks.reduce((acc: number, mark: any) => acc + (Number(mark) || 0), 0);
  
  const result: "Pass" | "Fail" = marks.every((mark: any) => (Number(mark) || 0) >= PASS_MARK) ? "Pass" : "Fail";
  
  const maxMarks = activeSubjects.length * 100;

  useEffect(() => {
    form.register("maths");
    form.register("zoology");
    form.register("botany");
  },[form.register])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    const subjects = {
      physics: values.physics,
      chemistry: values.chemistry,
      maths: activeSubjects.includes("maths") ? values.maths! : null,
      zoology: activeSubjects.includes("zoology") ? values.zoology! : null,
      botany: activeSubjects.includes("botany") ? values.botany! : null,
    }

    const fullData = { 
        rollNumber: values.rollNumber,
        studentName: values.studentName,
        parentsName: values.parentsName,
        dateOfTest: values.dateOfTest,
        class: values.class,
        stream: values.stream,
        subjects, 
        total, 
        result 
    };

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
                <FormLabel>Date of Test</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="glowing-shadow-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="JEE">JEE (PCM - Regular Batch)</SelectItem>
                        <SelectItem value="NEET">NEET (PCB - Regular Batch)</SelectItem>
                        <SelectItem value="MHT-CET">MHT-CET (PCMB - Regular Batch)</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        {stream && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {activeSubjects.map((subject) => (
                <FormField
                key={subject}
                control={form.control}
                name={subject as keyof FormValues}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="capitalize">{subject}</FormLabel>
                    <FormControl>
                        <Input type="number" min="0" max="100" {...field} className="glowing-shadow-sm" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            ))}
            </div>
        )}

        {stream && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-card-foreground/5 holographic-card">
                <div className="text-lg font-medium">Total Marks: <span className="font-bold text-primary text-glow">{total} / {maxMarks}</span></div>
                <div className="text-lg font-medium">Result: <span className={cn("font-bold text-glow", result === "Pass" ? "text-primary" : "text-destructive")}>{result}</span></div>
            </div>
        )}

        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting || !stream}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
        </Button>
      </form>
    </Form>
  );
}
