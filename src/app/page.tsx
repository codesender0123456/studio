
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Student } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import Marksheet from "@/components/student/Marksheet";
import StudentLoginForm from "@/components/student/StudentLoginForm";
import { Icons } from "@/components/common/Icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState("Checking connection...");

  useEffect(() => {
    // Test Firestore connection
    const testConnection = async () => {
      try {
        const testDocRef = doc(db, "internal", "connection-test");
        await setDoc(testDocRef, { timestamp: new Date() });
        const docSnap = await getDoc(testDocRef);
        if (docSnap.exists()) {
          setConnectionStatus("Connection to database successful!");
          setError(null);
        } else {
          throw new Error("Test document not found after writing.");
        }
      } catch (err: any) {
        console.error("Firestore connection test failed:", err);
        setConnectionStatus("Failed to connect to the database.");
        setError(`Connection Error: ${err.message}. Please ensure you have enabled Firestore in your Firebase project and check the browser console for more details.`);
      }
    };
    testConnection();
  }, []);


  const handleSearch = async (rollNumber: string) => {
    setLoading(true);
    setError(null);
    setStudentData(null);

    try {
      const docRef = doc(db, "students", rollNumber.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudentData(docSnap.data() as Student);
      } else {
        setError("Invalid Roll Number. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentData(null);
    setError(null);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
                <Icons.logo className="h-12 w-12 text-primary" />
                <h1 className="text-5xl font-bold font-headline text-glow">
                Phoenix Science Academy
                </h1>
            </div>
            <p className="text-muted-foreground">Your digital gateway to academic results.</p>
        </div>

        {studentData ? (
          <Marksheet student={studentData} onReset={handleReset} />
        ) : (
          <Card className="holographic-card glowing-shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-center">Student Portal</CardTitle>
              <CardDescription className="text-center">
                {connectionStatus}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentLoginForm onSearch={handleSearch} loading={loading} error={error} />
            </CardContent>
          </Card>
        )}
      </div>
      <div className="absolute top-4 right-4">
          <Button asChild variant="ghost" className="glowing-shadow-sm">
            <Link href="/admin">
              Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
    </main>
  );
}
