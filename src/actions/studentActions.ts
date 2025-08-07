"use server";

import { z } from "zod";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfTest: z.string().min(1, "Date of Test is required"),
  class: z.coerce.number().min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"]),
  batch: z.string().min(1, "Batch is required"),
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

  const SCRIPT_URL = process.env.GOOGLE_SHEET_SCRIPT_URL;

  if (!SCRIPT_URL) {
    console.error("Google Sheet script URL is not defined in environment variables.");
    return {
      success: false,
      message: "Server configuration error: Script URL is missing.",
    };
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData.data),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        message: `Successfully added student ${validatedData.data.studentName}.`,
      };
    } else {
      return {
        success: false,
        message: result.message || "An unknown error occurred while adding the student.",
      };
    }
  } catch (error) {
    console.error("Error submitting to Google Sheet:", error);
    return {
      success: false,
      message: "An error occurred while communicating with the database.",
    };
  }
}