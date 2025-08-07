"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Student } from "@/lib/mock-data";
import { students } from "@/lib/mock-data";
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

  const handleSearch = (rollNumber: string) => {
    setLoading(true);
    setError(null);
    setStudentData(null);

    setTimeout(() => {
      const foundStudent = students.find(
        (s) => s.rollNumber.toLowerCase() === rollNumber.toLowerCase()
      );
      if (foundStudent) {
        setStudentData(foundStudent);
      } else {
        setError("Invalid Roll Number. Please try again.");
      }
      setLoading(false);
    }, 1000);
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
                ResultVerse
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
                Enter your roll number to view your marksheet.
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
