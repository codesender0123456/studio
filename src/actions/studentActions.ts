
"use server";

import { z } from "zod";
import * as admin from "firebase-admin";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, writeBatch, query, where, getFirestore as getClientFirestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Firebase Admin SDK Initialization ---
// This logic is moved here to ensure it runs in the correct server action context.

let adminApp: admin.app.App;

function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountEnv) {
    throw new Error("The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    
    if (admin.apps.length > 0) {
      adminApp = admin.app();
    } else {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return adminApp;
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

function getAuth() {
  try {
    return getAdminApp().auth();
  } catch (error) {
    console.error("Failed to get Firebase Auth instance:", error);
    throw error;
  }
}

function getFirestore() {
  try {
    return getAdminApp().firestore();
  } catch (error) {
    console.error("Failed to get Firebase Firestore instance:", error);
    throw error;
  }
}

// --- Schemas ---

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

// --- Server Actions ---

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
      await authAdmin.getUserByEmail(email);
      return {
        success: false,
        message: "A user with this email address already exists. Please use a different email.",
      };
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        console.error("Error checking user:", error);
        return { success: false, message: error.message || "An unexpected error occurred while checking user existence." };
      }
    }
    
    const userRecord = await authAdmin.createUser({
      email: email,
      displayName: studentData.studentName,
    });
    
    const studentRef = doc(db, "students", studentData.rollNumber.toLowerCase());
    await setDoc(studentRef, { ...studentData, email, uid: userRecord.uid });
    
    return {
      success: true,
      message: `Successfully added student ${studentData.studentName}.`,
    };
  } catch (error: any) {
    console.error("Error adding student: ", error);
    // Provide a more specific error message if it's an initialization failure
    if (error.message.includes("environment variable is not set")) {
        return {
            success: false,
            message: "Server configuration error: The Firebase Admin credentials are not set correctly on the server.",
        };
    }
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

    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);

    const user = await authAdmin.getUserByEmail(email);
    await authAdmin.deleteUser(user.uid);

    return {
      success: true,
      message: "Successfully deleted student.",
    };
  } catch (error: any) {
    console.error("Error deleting document: ", error);
    if (error.message.includes("environment variable is not set")) {
        return {
            success: false,
            message: "Server configuration error: The Firebase Admin credentials are not set correctly on the server.",
        };
    }
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
}

export async function clearLoginAttempts() {
  try {
    const firestoreAdmin = getFirestore();
    const logsCollection = collection(firestoreAdmin, "login_attempts");
    const logsSnapshot = await getDocs(logsCollection);

    if (logsSnapshot.empty) {
      return { success: true, message: "No logs to clear." };
    }
    
    const batch = writeBatch(firestoreAdmin);
    logsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true, message: `Successfully cleared ${logsSnapshot.size} log(s).` };
  } catch (error: any) {
    console.error("Error clearing login attempts: ", error);
     if (error.message.includes("environment variable is not set")) {
        return {
            success: false,
            message: "Server configuration error: The Firebase Admin credentials are not set correctly on the server.",
        };
    }
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
