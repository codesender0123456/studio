
"use server";

import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "@/lib/firebase-admin";

export async function deleteUser(uid: string) {
  if (!uid) {
    return { success: false, message: "User ID is required." };
  }

  try {
    await initializeAdminApp();
    await getAuth().deleteUser(uid);
    return { success: true, message: "User account deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error.code === 'auth/user-not-found') {
        return { success: false, message: "User account not found in Firebase Authentication. It may have been deleted already." };
    }
    return {
      success: false,
      message: error.message || "An unknown error occurred while deleting the user account.",
    };
  }
}
