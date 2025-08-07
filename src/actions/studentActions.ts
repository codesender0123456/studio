"use server";

import { z } from "zod";
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

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

  try {
    // Use rollNumber as the document ID
    const studentRef = doc(db, "students", validatedData.data.rollNumber);
    await setDoc(studentRef, validatedData.data);
    
    return {
      success: true,
      message: `Successfully added student ${validatedData.data.studentName}.`,
    };
  } catch (error) {
    console.error("Error adding document: ", error);
    return {
      success: false,
      message: "An error occurred while communicating with the database.",
    };
  }
}
