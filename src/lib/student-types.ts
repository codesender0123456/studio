
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

export type MarksheetData = {
  testId: string;
  studentRollNumber: string;
  dateOfTest: string; // YYYY-MM-DD
  subjects: {
    physics: number;
    chemistry: number;
    maths: number | null;
    zoology: number | null;
    botany: number | null;
  };
  total: number;
  result: "Pass" | "Fail";
}

export type LoginAttempt = {
  id: string;
  email: string;
  timestamp: Date;
  status: "failed";
  studentName?: string;
}
