import { z } from "zod";

const jobSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z
    .string()
    .nullish()
    .transform((val) => val ?? null),
  timeline: z.string().min(1, "Timeline is required"),
  paymentType: z.enum(["HOURLY", "FIXED"]),
  budget: z.number().min(1, "Budget is required"),
  status: z
    .enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .default("OPEN"),
});

const applicationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  talentId: z.string().min(1, "Talent ID is required"),
  coverLetter: z.string().min(1, "Cover letter is required"),
  proposedRate: z.number().min(1, "Proposed rate is required"),
  timeline: z.string().min(1, "Timeline is required"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]),
  keysUsed: z.number().min(1, "Keys used is required"),
});

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    emailAddress: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "TALENT", "ADMIN"]),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "TALENT") {
        return data.description && data.skills && data.skills.length > 0;
      }
      return true;
    },
    {
      message: "Description and skills are required for talents",
      path: ["description"],
    }
  );

const signInSchema = z.object({
  emailAddress: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const talentSchema = z.object({
  id: z.string(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  skills: z.array(z.string()).nullish(),
  role: "CLIENT",
  phone: z.string().nullish(),
  avatar: z
    .string()
    .nullish()
    .transform((val) => val ?? null),
  keyBalance: z.number().default(0),
  isVerified: z.boolean().default(false),
});

const jobPostSchema = z.object({
  title: z.string().min(1, "Job must have a title"),
  category: z.string().min(1, "Please provide a category"),
  description: z.string().min(10, "Please provide a valid description"),
  location: z.string().optional().nullable(),
  timeline: z.string().min(1, "Job must have a timeline"),
  paymentType: z.enum(["HOURLY", "FIXED"]),
  budget: z.number().finite().positive(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  skills: z
    .any()
    .transform((val) => {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "string") {
        return val.trim() === ""
          ? []
          : val
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
      }
      return [];
    })
    .pipe(z.array(z.string())),
});

const userProfileSchema = z.object({
  fullname: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  Bio: z.string().optional(),
  availabilty: z.string().optional(),
  portfolio: z.any().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

const gigFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Gig name is required")
      .max(100, "Gig name must be less than 100 characters"),
    price: z.number().min(0, "Price must be positive"),
    gigDescription: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    hourlyPrice: z.boolean(),
    fixedPrice: z.boolean(),
  })
  .refine((data) => data.hourlyPrice !== data.fixedPrice, {
    message: "Please select either hourly or fixed price",
    path: ["priceType"],
  });

const createContractSchema = z.object({
  description: z.string().min(1, "Description is required"),
  status: z.enum(["ACTIVE"]),
  rate: z.number().min(1, "Rate is required"),
  paymentType: z.enum(["HOURLY", "FIXED"]),
  timeline: z.string().min(1, "Timeline is required"),
});

// const applicationSchema = z.object({
//   coverLetter: z.string().min(1, "Cover letter is required"),
//   proposedRate: z.number().min(1, "Proposed rate is required"),
//   timeline: z.string().min(1, "Timeline is required"),
// });

export {
  gigFormSchema,
  applicationSchema,
  jobSchema,
  jobPostSchema,
  signUpSchema,
  signInSchema,
  talentSchema,
  userProfileSchema,
  createContractSchema,
};
