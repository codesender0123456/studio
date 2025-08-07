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
    const studentRef = doc(db, "students", validatedData.data.rollNumber.toLowerCase());
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
