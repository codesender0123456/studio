"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/firebase";
import type { Student } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ ...doc.data() } as Student);
      });
      setStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="holographic-card glowing-shadow w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="view-students" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="glowing-shadow-sm">
              <TabsTrigger value="view-students">View All Students</TabsTrigger>
              <TabsTrigger value="add-student">Add New Student</TabsTrigger>
            </TabsList>
            <Button asChild variant="ghost" className="glowing-shadow-sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <TabsContent value="view-students">
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <p>Loading students...</p>
              </div>
            ) : (
              <StudentsTable students={students} />
            )}
          </TabsContent>
          <TabsContent value="add-student">
            <AddStudentForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
