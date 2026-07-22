import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional().refine(val => !val || (val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15), {
    message: "Enter a valid phone number (7-15 digits)"
  }),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal('')),
  challenge: z.string().min(1, "Please select your biggest challenge"),
  otherChallenge: z.string().optional()
});
