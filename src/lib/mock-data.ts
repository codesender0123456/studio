export type Student = {
  rollNumber: string;
  studentName: string;
  parentsName: string;
  dateOfTest: string; // YYYY-MM-DD
  class: 11 | 12;
  stream: "JEE" | "NEET" | "MHT-CET" | "Regular Batch";
  batch: string; // e.g., "2022-2024"
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
    dateOfTest: "2024-03-15",
    class: 12,
    stream: "MHT-CET",
    batch: "2022-2024",
    subjects: { physics: 88, chemistry: 92, maths: 78, zoology: 48, botany: 47 },
    total: 353,
    result: "Pass",
  },
  {
    rollNumber: "2024002",
    studentName: "Olivia Johnson",
    parentsName: "Sarah Johnson",
    dateOfTest: "2024-03-15",
    class: 12,
    stream: "JEE",
    batch: "2022-2024",
    subjects: { physics: 91, chemistry: 85, maths: 89, zoology: null, botany: null },
    total: 265,
    result: "Pass",
  },
  {
    rollNumber: "2024003",
    studentName: "Noah Williams",
    parentsName: "David Williams",
    dateOfTest: "2024-03-16",
    class: 11,
    stream: "NEET",
    batch: "2023-2025",
    subjects: { physics: 75, chemistry: 68, maths: null, zoology: 40, botany: 42 },
    total: 225,
    result: "Pass",
  },
  {
    rollNumber: "2024004",
    studentName: "Emma Brown",
    parentsName: "Jessica Brown",
    dateOfTest: "2024-03-16",
    class: 11,
    stream: "MHT-CET",
    batch: "2023-2025",
    subjects: { physics: 25, chemistry: 45, maths: 55, zoology: 30, botany: 30 },
    total: 185,
    result: "Fail",
  },
  {
    rollNumber: "2024005",
    studentName: "Oliver Jones",
    parentsName: "Christopher Jones",
    dateOfTest: "2024-03-15",
    class: 12,
    stream: "JEE",
    batch: "2022-2024",
    subjects: { physics: 98, chemistry: 99, maths: 95, zoology: null, botany: null },
    total: 292,
    result: "Pass",
  },
  {
    rollNumber: "2024006",
    studentName: "Ava Garcia",
    parentsName: "Robert Garcia",
    dateOfTest: "2024-03-16",
    class: 11,
    stream: "Regular Batch",
    batch: "2023-2025",
    subjects: { physics: 80, chemistry: 82, maths: 77, zoology: 75, botany: 79 },
    total: 393,
    result: "Pass",
  },
  {
    rollNumber: "2024999",
    studentName: "Test Student",
    parentsName: "Test Parent",
    dateOfTest: "2024-03-16",
    class: 11,
    stream: "MHT-CET",
    batch: "2023-2025",
    subjects: { physics: 75, chemistry: 80, maths: 85, zoology: 45, botany: 45 },
    total: 330,
    result: "Pass",
  },
];
