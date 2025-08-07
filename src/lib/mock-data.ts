export type Student = {
  rollNumber: string;
  studentName: string;
  parentsName: string;
  dob: string; // YYYY-MM-DD
  stream: "PCM" | "PCB" | "PCMB";
  subjects: {
    physics: number;
    chemistry: number;
    maths: number | null;
    biology: number | null;
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
    stream: "PCMB",
    subjects: { physics: 88, chemistry: 92, maths: 78, biology: 95 },
    total: 353,
    result: "Pass",
  },
  {
    rollNumber: "2024002",
    studentName: "Olivia Johnson",
    parentsName: "Sarah Johnson",
    dob: "2006-08-22",
    stream: "PCM",
    subjects: { physics: 91, chemistry: 85, maths: 89, biology: null },
    total: 265,
    result: "Pass",
  },
  {
    rollNumber: "2024003",
    studentName: "Noah Williams",
    parentsName: "David Williams",
    dob: "2006-02-10",
    stream: "PCB",
    subjects: { physics: 75, chemistry: 68, maths: null, biology: 82 },
    total: 225,
    result: "Pass",
  },
  {
    rollNumber: "2024004",
    studentName: "Emma Brown",
    parentsName: "Jessica Brown",
    dob: "2006-11-30",
    stream: "PCMB",
    subjects: { physics: 25, chemistry: 45, maths: 55, biology: 60 },
    total: 185,
    result: "Fail",
  },
  {
    rollNumber: "2024005",
    studentName: "Oliver Jones",
    parentsName: "Christopher Jones",
    dob: "2006-07-19",
    stream: "PCM",
    subjects: { physics: 98, chemistry: 99, maths: 95, biology: null },
    total: 292,
    result: "Pass",
  },
  {
    rollNumber: "2024999",
    studentName: "Test Student",
    parentsName: "Test Parent",
    dob: "2007-01-01",
    stream: "PCMB",
    subjects: { physics: 75, chemistry: 80, maths: 85, biology: 90 },
    total: 330,
    result: "Pass",
  },
];
