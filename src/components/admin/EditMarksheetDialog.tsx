
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import type { Student, MarksheetData } from "@/lib/student-types";
import { marksheetSchema } from "@/lib/schemas";
import { updateMarksheet } from "@/actions/studentActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type FormValues = z.infer<typeof marksheetSchema>;

type EditMarksheetDialogProps = {
    student: Student;
    marksheet: MarksheetData;
    onClose: () => void;
}

export default function EditMarksheetDialog({ student, marksheet, onClose }: EditMarksheetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const isJeeStudent = student.stream === "JEE";
  const isNeetStudent = student.stream === "NEET";
  const isRegularOrCet = student.stream === "Regular Batch" || student.stream === "MHT-CET";

  const form = useForm<FormValues>({
    resolver: zodResolver(marksheetSchema),
    defaultValues: {
        testName: marksheet.testName,
        dateOfTest: marksheet.dateOfTest,
        physics: marksheet.physics || { topic: "", marks: undefined, maxMarks: undefined },
        chemistry: marksheet.chemistry || { topic: "", marks: undefined, maxMarks: undefined },
        maths: marksheet.maths || { topic: "", marks: undefined, maxMarks: undefined },
        botany: marksheet.botany || { topic: "", marks: undefined, maxMarks: undefined },
        zoology: marksheet.zoology || { topic: "", marks: undefined, maxMarks: undefined },
    },
    mode: "onBlur"
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    const response = await updateMarksheet(student.rollNumber, marksheet.id!, values);
    
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
  
  const renderSubjectInput = (name: "physics" | "chemistry" | "maths" | "botany" | "zoology", label: string) => (
     <div className="space-y-2 border p-4 rounded-md">
        <FormLabel className="text-base">{label}</FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <FormField
                control={form.control}
                name={`${name}.topic`}
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel className="text-xs text-muted-foreground">Topic</FormLabel>
                    <FormControl>
                        <Input 
                            type="text"
                            placeholder="Topic"
                            {...field}
                            value={field.value ?? ""}
                            className="glowing-shadow-sm h-9"
                            />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`${name}.marks`}
                render={({ field }) => (
                    <FormItem className="w-full">
                     <FormLabel className="text-xs text-muted-foreground">Marks Obtained</FormLabel>
                    <FormControl>
                        <Input 
                            type="number"
                            placeholder="Marks Obtained"
                            {...field}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                            value={field.value ?? ""}
                            className="glowing-shadow-sm"
                         />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`${name}.maxMarks`}
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel className="text-xs text-muted-foreground">Total Marks</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            placeholder="Total Marks"
                             {...field}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                            value={field.value ?? ""}
                            className="glowing-shadow-sm"
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    </div>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl holographic-card">
            <DialogHeader>
                <DialogTitle>Edit Marksheet</DialogTitle>
                <DialogDescription>Update the details for the test: {marksheet.testName}</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-6">
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
                                            <Input
                                                type={field.value ? "date" : "text"}
                                                onFocus={(e) => e.target.type = 'date'}
                                                onBlur={(e) => { if (!e.target.value) e.target.type = 'text';}}
                                                placeholder="DD-MM-YYYY"
                                                {...field}
                                                max={today}
                                                className="glowing-shadow-sm"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-muted-foreground">Enter marks only for the subjects included in this test.</p>
                                {form.formState.errors.testName && <FormMessage>{form.formState.errors.testName.message}</FormMessage>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderSubjectInput("physics", "Physics")}
                                    {renderSubjectInput("chemistry", "Chemistry")}

                                    {(isJeeStudent || isRegularOrCet) && (
                                        renderSubjectInput("maths", "Maths")
                                    )}
                                    {(isNeetStudent || isRegularOrCet) && (
                                        <>
                                            {renderSubjectInput("botany", "Botany")}
                                            {renderSubjectInput("zoology", "Zoology")}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="glowing-shadow" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
