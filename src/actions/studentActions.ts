"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { authAdmin } from "@/lib/firebase-admin";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfTest: z.string().min(1, "Date of Test is required"),
  email: z.string().email("Invalid email address"),
  class: z.coerce.number().min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"]),
  batch: z.string().min(1, "Batch is required"),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

const addStudentFormSchema = studentSchema;
const updateStudentSchema = studentSchema.omit({ rollNumber: true, password: true });
const resetPasswordSchema = z.object({
  password: z.string().min(6, "New password must be at least 6 characters long."),
});


export async function addStudent(formData: z.infer<typeof addStudentFormSchema>) {
  if (!authAdmin) {
    return { success: false, message: "Firebase Admin is not initialized. Please check server logs."};
  }
  const validatedData = addStudentFormSchema.safeParse(formData);

  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  const { email, password, ...studentData } = validatedData.data;

  try {
    // 1. Create Firebase Auth user
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: studentData.studentName,
    });

    // 2. Save student data to Firestore
    const studentRef = doc(db, "students", studentData.rollNumber.toLowerCase());
    await setDoc(studentRef, { ...studentData, email });
    
    return {
      success: true,
      message: `Successfully added student ${studentData.studentName}.`,
    };
  } catch (error: any) {
    console.error("Error adding student: ", error);
    let message = "An error occurred while communicating with the database.";
    if (error.code === 'auth/email-already-exists') {
        message = "A student with this email address already exists.";
    }
    return {
      success: false,
      message: message,
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
  
  // Note: We are not updating the password here. That's a separate action.
  // We may need to update the user's email in Auth if it changes.
  // For now, we assume the email in Auth is the source of truth for login.
  // A more complex implementation might handle email changes.

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

export async function resetStudentPassword(uid: string, formData: z.infer<typeof resetPasswordSchema>) {
    if (!authAdmin) {
      return { success: false, message: "Firebase Admin is not initialized. Please check server logs."};
    }
    const validatedData = resetPasswordSchema.safeParse(formData);
    if (!validatedData.success) {
        return {
            success: false,
            message: "Invalid data provided.",
            errors: validatedData.error.flatten().fieldErrors,
        };
    }
    try {
        await authAdmin.updateUser(uid, {
            password: validatedData.data.password,
        });
        return { success: true, message: "Password updated successfully." };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: "Failed to reset password." };
    }
}


export async function deleteStudent(rollNumber: string, email: string) {
  if (!authAdmin) {
    return { success: false, message: "Firebase Admin is not initialized. Please check server logs."};
  }
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  
  try {
    // 1. Delete from Firestore
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);

    // 2. Delete from Firebase Auth
    const user = await authAdmin.getUserByEmail(email);
    await authAdmin.deleteUser(user.uid);

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
