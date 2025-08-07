
"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addStudentFormSchema, updateStudentSchema } from "@/lib/schemas";

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
    
    const { ...studentData } = validatedData.data;
    
    const studentRef = doc(db, "students", studentData.rollNumber.toLowerCase());

    const docSnap = await getDoc(studentRef);
    if (docSnap.exists()) {
      return {
        success: false,
        message: `A student with Roll Number ${studentData.rollNumber} already exists.`,
      };
    }

    await setDoc(studentRef, { ...studentData });
    
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

export async function deleteStudent(rollNumber: string) {
  if (!rollNumber) {
    return { success: false, message: "Roll Number is required." };
  }
  
  try {
    const studentRef = doc(db, "students", rollNumber.toLowerCase());
    await deleteDoc(studentRef);

    return {
      success: true,
      message: "Successfully deleted student record.",
    };
  } catch (error: any) {
    console.error("Error deleting student: ", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
}
