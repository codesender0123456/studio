
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LogOut, Loader2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";


import { auth, db } from "@/lib/firebase";
import type { Student } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import Marksheet from "@/components/student/Marksheet";
import StudentLoginForm from "@/components/student/StudentLoginForm";
import { Icons } from "@/components/common/Icons";

export default function Home() {
  const [user, authLoading, authError] = useAuthState(auth);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const studentsRef = collection(db, "students");
          const q = query(studentsRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming one student per email
            const studentDoc = querySnapshot.docs[0];
            setStudentData(studentDoc.data() as Student);
          } else {
            setError("No student record found for this email address. Please contact the administration.");
            // Sign out if no record found
            await auth.signOut();
          }
        } catch (err) {
          console.error(err);
          setError("An error occurred while fetching your data.");
        } finally {
          setLoading(false);
        }
      } else {
        setStudentData(null); // Clear data on sign out
      }
    };

    fetchStudentData();
  }, [user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out: ", error);
        setError("Could not sign you out. Please try again.");
    } finally {
        setIsSigningOut(false);
    }
  }


  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <div className="flex flex-col justify-center items-center gap-4 mb-4">
                <Icons.logo className="h-20 w-20 text-primary" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline text-glow">
                  Phoenix Science Academy
                </h1>
            </div>
            <p className="text-muted-foreground">Your digital gateway to academic results.</p>
        </div>

        {authLoading || loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p>Loading...</p>
          </div>
        ) : user && studentData ? (
          <Marksheet student={studentData} onReset={handleSignOut} isSigningOut={isSigningOut}/>
        ) : (
          <StudentLoginForm error={error || authError?.message} />
        )}
      </div>
      <div className="absolute top-4 right-4">
          { !user && !authLoading && (
            <Button asChild variant="ghost" className="glowing-shadow-sm">
              <Link href="/admin">
                Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          { user && (
            <Button variant="ghost" className="glowing-shadow-sm" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Sign Out
            </Button>
          )}
        </div>
    </main>
  );
}
