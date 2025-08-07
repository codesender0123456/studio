"use server";

import { z } from "zod";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  s1: z.coerce.number().min(0).max(100),
  s2: z.coerce.number().min(0).max(100),
  s3: z.coerce.number().min(0).max(100),
  s4: z.coerce.number().min(0).max(100),
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
