
export type Student = {
  id: string; // Firestore document ID
  rollNumber: string;
  studentName: string;
  parentsName: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  class: 11 | 12;
  stream: "JEE" | "NEET" | "MHT-CET" | "Regular Batch";
  batch: string; // e.g., "2022-2024"
  uid?: string; // Firebase Auth User ID
};

export type SubjectMarks = {
  marks: number;
  maxMarks: number;
}

export type MarksheetData = {
  id?: string;
  testName: string;
  dateOfTest: string; // YYYY-MM-DD
  physics: SubjectMarks | null;
  chemistry: SubjectMarks | null;
  maths: SubjectMarks | null;
  botany: SubjectMarks | null;
  zoology: SubjectMarks | null;
  total: number;
  totalMax: number;
  result: "Pass" | "Fail";
}

export type LoginAttempt = {
  id: string;
  email: string;
  timestamp: Date;
  status: "failed";
  studentName?: string;
}
