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
