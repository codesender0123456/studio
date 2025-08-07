
"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, writeBatch, query, where } from "firebase/firestore"; 
import { getAuth, getFirestore } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfTest: z.string().min(1, "Date of Test is required"),
  email: z.string().email("Invalid email address"),
  class: z.coerce.number().min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"]),
  batch: z.string().min(1, "Batch is required"),
});

const addStudentFormSchema = studentSchema;
const updateStudentSchema = studentSchema.omit({ rollNumber: true });

export async function addStudent(formData: z.infer<typeof addStudentFormSchema>) {
  try {
    const authAdmin = getAuth();
    const validatedData = addStudentFormSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const { email, ...studentData } = validatedData.data;

    try {
      // Check if a user with that email already exists in Firebase Auth
      await authAdmin.getUserByEmail(email);
      // If it doesn't throw, a user exists.
      return {
        success: false,
        message: "A user with this email address already exists in the authentication system. Please use a different email.",
      };
    } catch (error: any) {
      // "user-not-found" is the expected error if the email is available.
      if (error.code !== 'auth/user-not-found') {
        // For any other auth-related error, return a message.
        console.error("Error checking user:", error);
        return { success: false, message: error.message || "An unexpected error occurred while checking user existence." };
      }
    }
    
    // 1. Create Firebase Auth user (no password)
    const userRecord = await authAdmin.createUser({
      email: email,
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
    return {
      success: false,
      message: error.message || "An unknown error occurred while communicating with the database.",
    };
  }
}

export async function getStudentByEmail(email: string) {
    if (!email) {
        return { success: false, data: null, message: "Email is required." };
    }
    try {
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            return { success: true, data: { id: studentDoc.id, ...studentDoc.data()} };
        } else {
            return { success: true, data: null };
        }
    } catch (error) {
        console.error("Error fetching student by email: ", error);
        return { success: false, data: null, message: "An error occurred while fetching student data." };
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
  } catch (error: any) {
    console.error("Error updating document: ", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
}

export async function deleteStudent(rollNumber: string, email: string) {
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  
  try {
    const authAdmin = getAuth();

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
  } catch (error: any) {
    console.error("Error deleting document: ", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
}

export async function clearLoginAttempts() {
  try {
    const firestore = getFirestore();
    const logsCollection = collection(firestore, "login_attempts");
    const logsSnapshot = await getDocs(logsCollection);

    if (logsSnapshot.empty) {
      return { success: true, message: "No logs to clear." };
    }
    
    const batch = writeBatch(firestore);
    logsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true, message: `Successfully cleared ${logsSnapshot.size} log(s).` };
  } catch (error: any) {
    console.error("Error clearing login attempts: ", error);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
