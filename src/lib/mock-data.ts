export type Student = {
  rollNumber: string;
  studentName: string;
  parentsName: string;
  dob: string; // YYYY-MM-DD
  subjects: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  };
  total: number;
  result: "Pass" | "Fail";
};

export const students: Student[] = [
  {
    rollNumber: "2024001",
    studentName: "Liam Smith",
    parentsName: "Michael Smith",
    dob: "2006-05-15",
    subjects: { s1: 88, s2: 92, s3: 78, s4: 95, s5: 85 },
    total: 438,
    result: "Pass",
  },
  {
    rollNumber: "2024002",
    studentName: "Olivia Johnson",
    parentsName: "Sarah Johnson",
    dob: "2006-08-22",
    subjects: { s1: 91, s2: 85, s3: 89, s4: 94, s5: 88 },
    total: 447,
    result: "Pass",
  },
  {
    rollNumber: "2024003",
    studentName: "Noah Williams",
    parentsName: "David Williams",
    dob: "2006-02-10",
    subjects: { s1: 75, s2: 68, s3: 82, s4: 71, s5: 79 },
    total: 375,
    result: "Pass",
  },
  {
    rollNumber: "2024004",
    studentName: "Emma Brown",
    parentsName: "Jessica Brown",
    dob: "2006-11-30",
    subjects: { s1: 25, s2: 45, s3: 55, s4: 60, s5: 33 },
    total: 218,
    result: "Fail",
  },
  {
    rollNumber: "2024005",
    studentName: "Oliver Jones",
    parentsName: "Christopher Jones",
    dob: "2006-07-19",
    subjects: { s1: 98, s2: 99, s3: 95, s4: 97, s5: 96 },
    total: 485,
    result: "Pass",
  },
  {
    rollNumber: "2024999",
    studentName: "Test Student",
    parentsName: "Test Parent",
    dob: "2007-01-01",
    subjects: { s1: 75, s2: 80, s3: 85, s4: 90, s5: 95 },
    total: 425,
    result: "Pass",
  },
];
