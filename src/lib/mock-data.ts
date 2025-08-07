export type Student = {
  rollNumber: string;
  studentName: string;
  parentsName: string;
  dob: string; // YYYY-MM-DD
  class: 11 | 12;
  stream: "PCM" | "PCB" | "PCMB";
  subjects: {
    physics: number;
    chemistry: number;
    maths: number | null;
    zoology: number | null;
    botany: number | null;
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
    class: 12,
    stream: "PCMB",
    subjects: { physics: 88, chemistry: 92, maths: 78, zoology: 48, botany: 47 },
    total: 353,
    result: "Pass",
  },
  {
    rollNumber: "2024002",
    studentName: "Olivia Johnson",
    parentsName: "Sarah Johnson",
    dob: "2006-08-22",
    class: 12,
    stream: "PCM",
    subjects: { physics: 91, chemistry: 85, maths: 89, zoology: null, botany: null },
    total: 265,
    result: "Pass",
  },
  {
    rollNumber: "2024003",
    studentName: "Noah Williams",
    parentsName: "David Williams",
    dob: "2006-02-10",
    class: 11,
    stream: "PCB",
    subjects: { physics: 75, chemistry: 68, maths: null, zoology: 40, botany: 42 },
    total: 225,
    result: "Pass",
  },
  {
    rollNumber: "2024004",
    studentName: "Emma Brown",
    parentsName: "Jessica Brown",
    dob: "2006-11-30",
    class: 11,
    stream: "PCMB",
    subjects: { physics: 25, chemistry: 45, maths: 55, zoology: 30, botany: 30 },
    total: 185,
    result: "Fail",
  },
  {
    rollNumber: "2024005",
    studentName: "Oliver Jones",
    parentsName: "Christopher Jones",
    dob: "2006-07-19",
    class: 12,
    stream: "PCM",
    subjects: { physics: 98, chemistry: 99, maths: 95, zoology: null, botany: null },
    total: 292,
    result: "Pass",
  },
  {
    rollNumber: "2024999",
    studentName: "Test Student",
    parentsName: "Test Parent",
    dob: "2007-01-01",
    class: 11,
    stream: "PCMB",
    subjects: { physics: 75, chemistry: 80, maths: 85, zoology: 45, botany: 45 },
    total: 330,
    result: "Pass",
  },
];
