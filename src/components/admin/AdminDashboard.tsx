
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Loader2, LogOut } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import type { Student } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoadingStudents(true);
    const studentsQuery = query(collection(db, "students"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(studentsData);
      setLoadingStudents(false);
    }, (error) => {
      console.error("Error fetching students: ", error);
      setLoadingStudents(false);
    });

    return () => {
        studentsUnsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
        await auth.signOut();
        toast({ title: "Success", description: "You have been signed out." });
    } catch (error) {
        console.error("Error signing out: ", error);
        toast({ title: "Error", description: "Could not sign you out. Please try again.", variant: "destructive" });
    } finally {
        setIsSigningOut(false);
    }
  }

  return (
    <Card className="holographic-card glowing-shadow w-full max-w-6xl">
      <CardContent className="p-6">
        <Tabs defaultValue="view-students" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="glowing-shadow-sm">
              <TabsTrigger value="view-students">View All Students</TabsTrigger>
              <TabsTrigger value="add-student">Add New Student</TabsTrigger>
            </TabsList>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="glowing-shadow-sm" disabled={isSigningOut}>
                    {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of the admin panel.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
                    {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <TabsContent value="view-students">
            {loadingStudents ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
