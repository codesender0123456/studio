
"use server";

import { z } from "zod";
import * as admin from "firebase-admin";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, writeBatch, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addStudentFormSchema, updateStudentSchema } from "@/lib/schemas";


// --- Firebase Admin SDK Initialization ---
function getAdminApp() {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountEnv) {
    throw new Error("Server Configuration Error: The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }

  const serviceAccount = JSON.parse(serviceAccountEnv);
  
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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

// --- Server Actions ---

export async function saveStudentData(formData: z.infer<typeof addStudentFormSchema>) {
  try {
    const validatedData = addStudentFormSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }
    
    const { email, uid, ...studentData } = validatedData.data;
    
    const studentRef = doc(db, "students", studentData.rollNumber.toLowerCase());

    const docSnap = await getDoc(studentRef);
    if (docSnap.exists()) {
      return {
        success: false,
        message: `A student with Roll Number ${studentData.rollNumber} already exists.`,
      };
    }

    await setDoc(studentRef, { ...studentData, email, uid });
    
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

export async function deleteStudent(rollNumber: string, uid: string) {
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  if (!uid) {
    return { success: false, message: "User ID is required to delete the account." };
  }
  
  try {
    const authAdmin = getAuth();

    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);

    await authAdmin.deleteUser(uid);

    return {
      success: true,
      message: "Successfully deleted student and their account.",
    };
  } catch (error: any) {
    console.error("Error deleting student: ", error);
    if (error.code === 'auth/user-not-found') {
        // If user doesn't exist in auth, but we still want to delete from firestore
        const studentRef = doc(db, "students", rollNumber.toLowerCase());
        await deleteDoc(studentRef);
        return { success: true, message: "Student record deleted. The associated user account was not found." };
    }
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
    const logsCollection = firestoreAdmin.collection("login_attempts");
    const logsSnapshot = await logsCollection.get();

    if (logsSnapshot.empty) {
      return { success: true, message: "No logs to clear." };
    }
    
    const batch = firestoreAdmin.batch();
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
