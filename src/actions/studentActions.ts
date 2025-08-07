"use server";

import { z } from "zod";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  class: z.coerce.number().min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET"]),
  subjects: z.object({
    physics: z.coerce.number().min(0).max(100),
    chemistry: z.coerce.number().min(0).max(100),
    maths: z.coerce.number().min(0).max(100).nullable(),
    zoology: z.coerce.number().min(0).max(100).nullable(),
    botany: z.coerce.number().min(0).max(100).nullable(),
  }),
  total: z.coerce.number(),
  result: z.enum(["Pass", "Fail"]),
});

export async function addStudent(formData: z.infer<typeof studentSchema>) {
  const validatedData = studentSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  
  // In a real application, you would save this data to your database (e.g., a Google Sheet via an API).
  // For this demo, we'll just log it to the console.
  console.log("New student data received:", validatedData.data);
  
  // Here, we would also update our mock data source if we wanted the table to update.
  // This part is omitted for simplicity as it would require managing state on the server or refetching.

  return {
    success: true,
    message: `Successfully added student ${validatedData.data.studentName}.`,
  };
}
