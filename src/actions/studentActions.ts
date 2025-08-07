
"use server";

import { z } from "zod";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addStudentFormSchema, marksheetSchema, updateStudentSchema } from "@/lib/schemas";


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
    
    await setDoc(studentRef, studentData);
    
    return {
      success: true,
      message: `Successfully added student ${studentData.studentName}.`,
    };
  } catch (error: any) {
    console.error("Error adding student: ", error);
    // This is a server-side error, the client will see a generic error message
    return {
      success: false,
      message: error.message || "An unknown error occurred while communicating with the database.",
    };
  }
}

export async function saveMarksheetData(rollNumber: string, formData: z.infer<typeof marksheetSchema>) {
    const validatedData = marksheetSchema.safeParse(formData);

    if(!validatedData.success) {
        return {
            success: false,
            message: "Invalid data provided.",
            errors: validatedData.error.flatten().fieldErrors,
        };
    }

    try {
        const studentRef = doc(db, "students", rollNumber.toLowerCase());
        const marksCollectionRef = collection(studentRef, "marks");
        
        const { ...marksheetData } = validatedData.data;

        let calculatedTotal = 0;
        let calculatedMaxTotal = 0;

        const subjects = [
            marksheetData.physics, 
            marksheetData.chemistry, 
            marksheetData.maths, 
            marksheetData.botany, 
            marksheetData.zoology
        ];

        subjects.forEach(subject => {
            if(subject && subject.marks !== null && subject.maxMarks !== null && subject.marks !== undefined && subject.maxMarks !== undefined) {
                calculatedTotal += subject.marks;
                calculatedMaxTotal += subject.maxMarks;
            }
        })


        const dataToSave = {
            ...marksheetData,
            total: calculatedTotal,
            totalMax: calculatedMaxTotal,
        }
        
        await addDoc(marksCollectionRef, dataToSave);

        return {
            success: true,
            message: "Successfully added marksheet data.",
        }

    } catch (error: any) {
        console.error("Error adding marksheet: ", error);
        return {
            success: false,
            message: error.message || "An unknown error occurred while communicating with the database.",
        }
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
    
    const oldDoc = await getDoc(studentRef);
    if (!oldDoc.exists()) {
      return { success: false, message: "Student not found." };
    }
   
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
