
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/lib/student-types";
import { marksheetSchema } from "@/lib/schemas";
import { saveMarksheetData } from "@/actions/studentActions";

type FormValues = z.infer<typeof marksheetSchema>;

type AddMarksheetFormProps = {
    student: Student;
}

export default function AddMarksheetForm({ student }: AddMarksheetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isJeeStudent = student.stream === "JEE";
  const isNeetStudent = student.stream === "NEET";
  const isRegularOrCet = student.stream === "Regular Batch" || student.stream === "MHT-CET";


  const form = useForm<FormValues>({
    resolver: zodResolver(marksheetSchema),
    defaultValues: {
        testName: "",
        dateOfTest: new Date().toISOString().split('T')[0],
        physics: null,
        chemistry: null,
        maths: null,
        botany: null,
        zoology: null,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    const response = await saveMarksheetData(student.rollNumber, values);
    
    if (response.success) {
        toast({
            title: "Success",
            description: response.message,
        });
        form.reset({
            testName: "",
            dateOfTest: new Date().toISOString().split('T')[0],
            physics: null,
            chemistry: null,
            maths: null,
            botany: null,
            zoology: null,
        });
    } else {
        toast({
            title: "Error",
            description: response.message || "An error occurred.",
            variant: "destructive",
        });
    }

    setIsSubmitting(false);
  }

  const renderNumberInput = (field: any, placeholder: string) => (
    <Input 
        type="number" 
        placeholder={placeholder}
        {...field}
        onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)}
        value={field.value ?? ""}
        className="glowing-shadow-sm" 
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="testName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly Test 1" {...field} className="glowing-shadow-sm" />
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
        <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Enter marks only for the subjects included in this test.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="physics"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Physics Marks</FormLabel>
                        <FormControl>
                            {renderNumberInput(field, "out of 180")}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="chemistry"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Chemistry Marks</FormLabel>
                        <FormControl>
                            {renderNumberInput(field, "out of 180")}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {(isJeeStudent || isRegularOrCet) && (
                    <FormField
                        control={form.control}
                        name="maths"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maths Marks</FormLabel>
                            <FormControl>
                                {renderNumberInput(field, "out of 120")}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
                {(isNeetStudent || isRegularOrCet) && (
                    <>
                        <FormField
                            control={form.control}
                            name="botany"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Botany Marks</FormLabel>
                                <FormControl>
                                    {renderNumberInput(field, "out of 180")}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zoology"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Zoology Marks</FormLabel>
                                <FormControl>
                                    {renderNumberInput(field, "out of 180")}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </>
                )}
            </div>
        </div>
        <Button type="submit" className="w-full glowing-shadow" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Marksheet
        </Button>
      </form>
    </Form>
  );
}
