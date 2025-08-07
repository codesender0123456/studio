
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Loader2, LogOut } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import type { Student, LoginAttempt } from "@/lib/student-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";
import SecurityLogs from "./SecurityLogs";
import { useToast } from "@/hooks/use-toast";
import { getLoginAttempts } from "@/actions/studentActions";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const studentsQuery = query(collection(db, "students"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ ...doc.data() } as Student);
      });
      setStudents(studentsData);
      setLoadingStudents(false);
    }, (error) => {
      console.error("Error fetching students: ", error);
      setLoadingStudents(false);
    });

    const fetchLogs = async () => {
      setLoadingLogs(true);
      const result = await getLoginAttempts();
      if (result.success && result.data) {
        // Sort logs by timestamp descending
        const sortedLogs = result.data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setLoginAttempts(sortedLogs as LoginAttempt[]);
      } else {
        toast({
            title: "Error fetching logs",
            description: result.message || "Could not fetch security logs.",
            variant: "destructive"
        })
      }
      setLoadingLogs(false);
    }
    fetchLogs();


    return () => {
        studentsUnsubscribe();
    };
  }, [toast]);

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
  
  const refreshLogs = async () => {
      setLoadingLogs(true);
      const result = await getLoginAttempts();
      if (result.success && result.data) {
        const sortedLogs = result.data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setLoginAttempts(sortedLogs as LoginAttempt[]);
      }
      setLoadingLogs(false);
    };

  return (
    <Card className="holographic-card glowing-shadow w-full max-w-6xl">
      <CardContent className="p-6">
        <Tabs defaultValue="view-students" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="glowing-shadow-sm">
              <TabsTrigger value="view-students">View All Students</TabsTrigger>
              <TabsTrigger value="add-student">Add New Student</TabsTrigger>
              <TabsTrigger value="security-logs">Security Logs</TabsTrigger>
            </TabsList>
            <Button variant="ghost" className="glowing-shadow-sm" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Sign Out
            </Button>
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
          <TabsContent value="security-logs">
             {loadingLogs ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>Loading security logs...</p>
              </div>
            ) : (
              <SecurityLogs attempts={loginAttempts} onRefresh={refreshLogs} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
