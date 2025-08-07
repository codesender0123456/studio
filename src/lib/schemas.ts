
import { z } from "zod";

const studentBaseSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required"),
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfBirth: z.string().refine((date) => new Date(date) < new Date(), {
    message: "Date of birth must be in the past.",
  }),
  email: z.string().email("Invalid email address"),
  class: z.coerce.number().min(11, "Class is required.").max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"], { required_error: "Stream is required." }),
  batch: z.string().min(1, "Batch is required"),
});

export const addStudentFormSchema = studentBaseSchema;

export const updateStudentSchema = studentBaseSchema.omit({ rollNumber: true });
