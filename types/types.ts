import {
  applicationSchema,
  gigFormSchema,
  jobPostSchema,
  jobSchema,
  signInSchema,
  signUpSchema,
  talentSchema,
  userProfileSchema,
  createContractSchema,
} from "./index";
import { z } from "zod";

export type Application = z.infer<typeof applicationSchema>;

export type Job = z.infer<typeof jobSchema> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  applications: Application[];
  skills: string[];
};

export type SignUp = z.infer<typeof signUpSchema>;

export type SignIn = z.infer<typeof signInSchema>;

export type Talent = z.infer<typeof talentSchema>;

export type JobPost = z.infer<typeof jobPostSchema>;

export type Contract = z.infer<typeof createContractSchema> & {
  clientId: string;
  rating: number;
  reviews: {
    rating: number;
    jobId: string;
    contractId: string;
    review: string;
  }[];
  clientReviews: {
    rating: number;
    jobId: string;
    contractId: string;
    review: string;
    userId: string;
  }[];
  id: string;
  jobId: string;
  talentId: string;
};

export interface Data {
  data: {
    talent: UserProfile;
    averageRating?: number;
    user?: {
      id?: string;
      name: string;
      email?: string;
      userProfilePic?: string[];
    };
  };
}

export interface UserProfile {
  description: string;
  gigs: Gig[];
  id: string;
  name: string;
  skills: string[];
  userProfilePic: string[];
  portfolio: string[];
  email: string;
  phone: string;
  location: string;
  availabilty: string;
  Bio: string;
  talentReviews?: TalentReview[];
}

export interface Gig {
  fixedPrice: boolean;
  hourlyPrice: boolean;
  id: string;
  name: string;
  price: number;
  userId: string;
  gigDescription: string;
}

export interface TalentReview {
  id: string;
  userId: string;
  talentId: string;
  rating: number;
  jobId: string;
  review: string;
  contractId: string;
  createdAt: string;
  updatedAt: string;
}

export type Profile = z.infer<typeof userProfileSchema>;

export type GigFormData = z.infer<typeof gigFormSchema>;

export type CreateContractFormData = z.infer<typeof createContractSchema>;
