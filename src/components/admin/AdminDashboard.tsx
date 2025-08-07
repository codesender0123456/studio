import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";
import { students } from "@/lib/mock-data";
import { LogOut } from "lucide-react";

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  return (
    <Card className="holographic-card glowing-shadow w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="view-students" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="glowing-shadow-sm">
              <TabsTrigger value="view-students">View All Students</TabsTrigger>
              <TabsTrigger value="add-student">Add New Student</TabsTrigger>
            </TabsList>
            <Button variant="ghost" onClick={onLogout} className="glowing-shadow-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
          <TabsContent value="view-students">
            <StudentsTable students={students} />
          </TabsContent>
          <TabsContent value="add-student">
            <AddStudentForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
