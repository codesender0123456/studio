
import { z } from "zod";

const studentBaseSchema = {
  studentName: z.string().min(1, "Student Name is required"),
  parentsName: z.string().min(1, "Parent's Name is required"),
  dateOfBirth: z.string().refine((date) => new Date(date) < new Date(), {
    message: "Date of birth must be in the past.",
  }),
  email: z.string().email("Invalid email address"),
  class: z.coerce.number().min(11, "Class is required.").max(12),
  stream: z.enum(["JEE", "NEET", "MHT-CET", "Regular Batch"], { required_error: "Stream is required." }),
  batch: z.string().min(1, "Batch is required"),
};

// Schema for the client-side form (doesn't include uid)
export const addStudentFormClientSchema = z.object({
  ...studentBaseSchema,
  rollNumber: z.string().min(1, "Roll Number is required"),
});

// Schema for the server-side action (includes uid)
export const addStudentFormSchema = z.object({
  ...studentBaseSchema,
  rollNumber: z.string().min(1, "Roll Number is required"),
  uid: z.string().min(1, "User ID is required"),
});

export const updateStudentSchema = z.object(studentBaseSchema);
