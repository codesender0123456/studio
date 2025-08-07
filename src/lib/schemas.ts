
import { z } from "zod";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfBirth: z.string().refine((date) => new Date(date) <= new Date(), {
    message: "Date of birth cannot be in the future.",
  }),
  email: z.string().email("Invalid email address"),
  class: z.coerce.number().min(11).max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"]),
  batch: z.string().min(1, "Batch is required"),
});

export const addStudentFormSchema = studentSchema.extend({
  uid: z.string().min(1, "User ID is required."),
});

export const updateStudentSchema = studentSchema.omit({ rollNumber: true });
