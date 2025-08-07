
"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where, getDoc, writeBatch, serverTimestamp, getFirestore } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addStudentFormSchema, updateStudentSchema } from "@/lib/schemas";
import { initializeApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

// --- Firebase Admin SDK Initialization ---
let adminApp;
if (!getApps().length) {
    try {
        const serviceAccount: ServiceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string
        );
        adminApp = initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error: any) {
        console.error("Firebase Admin Initialization Error: ", error.message);
        // This is a server-side error, the client will see a generic error message
        // unless we explicitly handle it in the calling function.
    }
} else {
    adminApp = getApps()[0];
}

const checkAdminCredentials = () => {
    if (!adminApp) {
        throw new Error("The Firebase Admin credentials are not set correctly on the server.");
    }
    return getAdminAuth(adminApp);
}

// --- Server Actions ---

export async function saveStudentData(formData: z.infer<typeof addStudentFormSchema>) {
  try {
    const adminAuth = checkAdminCredentials();
    const validatedData = addStudentFormSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Invalid data provided.",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }
    
    const { ...studentData } = validatedData.data;
    
    const studentRef = doc(db, "students", studentData.rollNumber.toLowerCase());

    const docSnap = await getDoc(studentRef);
    if (docSnap.exists()) {
      return {
        success: false,
        message: `A student with Roll Number ${studentData.rollNumber} already exists.`,
      };
    }

    // This is a placeholder password. The user will be forced to reset it.
    const tempPassword = `password${Date.now()}`;
    const userRecord = await adminAuth.createUser({
        email: studentData.email,
        password: tempPassword,
        displayName: studentData.studentName,
    });
    
    await setDoc(studentRef, { ...studentData, uid: userRecord.uid });
    
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
    const adminAuth = checkAdminCredentials();
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    
    const oldDoc = await getDoc(studentRef);
    if (!oldDoc.exists()) {
      return { success: false, message: "Student not found." };
    }
    const oldData = oldDoc.data();

    await updateDoc(studentRef, validatedData.data);
    
    // If email is changed, update it in Firebase Auth as well
    if (oldData.email !== validatedData.data.email && oldData.uid) {
        await adminAuth.updateUser(oldData.uid, {
            email: validatedData.data.email,
        });
    }
    
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

export async function deleteStudent(rollNumber: string, uid?: string) {
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  
  try {
    const adminAuth = checkAdminCredentials();
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);

    if (uid) {
        await adminAuth.deleteUser(uid);
    }

    return {
      success: true,
      message: "Successfully deleted student record and login account.",
    };
  } catch (error: any) {
    console.error("Error deleting student: ", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
}

export async function getLoginAttempts() {
    try {
        const attemptsRef = collection(db, "login_attempts");
        const q = query(attemptsRef);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, data: [] };
        }
        
        const attempts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
        }));

        return { success: true, data: attempts };
    } catch (error: any) {
        console.error("Error fetching login attempts:", error);
        return { success: false, data: null, message: "An error occurred while fetching login attempts." };
    }
}


export async function clearLoginAttempts() {
  try {
    checkAdminCredentials();
    const attemptsRef = collection(db, "login_attempts");
    const querySnapshot = await getDocs(attemptsRef);
    
    if (querySnapshot.empty) {
      return { success: true, message: "No logs to clear." };
    }
    
    // Use a batch to delete all documents
    const batch = writeBatch(getFirestore(adminApp!));
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true, message: "Successfully cleared all login attempts." };
  } catch (error: any) {
    console.error("Error clearing login attempts:", error);
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}
