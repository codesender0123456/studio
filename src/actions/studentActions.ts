"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
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

const updateStudentSchema = studentSchema.omit({ rollNumber: true });

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

export async function updateStudent(rollNumber: string, formData: z.infer<typeof updateStudentSchema>) {
  const validatedData = updateStudentSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await updateDoc(studentRef, validatedData.data);
    
    return {
      success: true,
      message: `Successfully updated student ${validatedData.data.studentName}.`,
    };
  } catch (error) {
    console.error("Error updating document: ", error);
    return {
      success: false,
      message: "An error occurred while communicating with the database.",
    };
  }
}

export async function deleteStudent(rollNumber: string) {
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  
  try {
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);
    return {
      success: true,
      message: "Successfully deleted student.",
    };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return {
      success: false,
      message: "An error occurred while communicating with the database.",
    };
  }
}
