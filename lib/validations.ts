import { z } from 'zod'
import { isNonHarvardEmail } from '@/lib/email-domains'

export const loginSchema = z.object({
  email: z.string().email("That doesn't look like an email."),
  password: z.string().min(1, "Don't skip this one."),
})

export const signupEmailSchema = z.object({
  email: z.string().email("That doesn't look like an email."),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("That doesn't look like an email."),
})

const strongPassword = z
  .string()
  .min(12, "Password's a bit short — go 12+ characters.")
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/[0-9]/, 'Include a number.')
  .regex(/[^a-zA-Z0-9]/, 'Include a symbol.')

export const accountSetupSchema = z
  .object({
    password: strongPassword,
    confirm: z.string(),
    recovery_email: z
      .string()
      .email("That doesn't look like an email.")
      .refine(
        isNonHarvardEmail,
        'Use a non-Harvard email — Gmail, Outlook, anything that stays alive after you graduate.',
      ),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: "Those passwords don't match.",
  })

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: "Those passwords don't match.",
  })

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Don't skip this one."),
    password: strongPassword,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: "Those passwords don't match.",
  })

const urlOrEmpty = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    { message: 'Needs to start with http:// or https://' }
  )

const emailOrEmpty = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "That doesn't look like an email." }
  )

export const onboardingStep1Schema = z.object({
  prefix: z.string().optional(),
  first_name: z.string().min(1, "We need your first name."),
  last_name: z.string().min(1, "We need your last name."),
  preferred_name: z.string().optional(),
})

export const onboardingStep2Schema = z.object({
  harvard_school: z.string().min(1, "We need your school."),
  harvard_school_code: z.string().min(1, "We need your school code."),
  degree_abbreviation: z.string().optional(),
  concentration_field: z.string().optional(),
  graduation_year: z.coerce
    .number()
    .int()
    .min(1636, "That year is before Harvard existed.")
    .max(2040, "That's pretty far in the future.")
    .optional()
    .nullable(),
  is_current_student: z.boolean(),
  house: z.string().optional(),
})

export const onboardingStep3Schema = z.object({
  country_of_origin: z.string().min(1, "Pick where you're from."),
  africa_region: z
    .enum(['north', 'west', 'east', 'central', 'southern', 'diaspora'])
    .optional()
    .nullable(),
  languages: z.array(z.string()),
})

export const onboardingStep4Schema = z.object({
  job_title: z.string().optional(),
  current_company: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  country_of_residence: z.string().optional(),
})

export const onboardingStep5Schema = z.object({
  contact_email: emailOrEmpty,
  linkedin_url: urlOrEmpty,
  personal_website: urlOrEmpty,
  short_bio: z
    .string()
    .max(600, 'Keep it to 600 characters or less.')
    .optional(),
})

export const onboardingStep6Schema = z.object({
  willing_to_mentor: z.boolean(),
  open_to_coffee_chats: z.boolean(),
  show_email_to_members: z.boolean(),
})

export const fullProfileSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(onboardingStep3Schema)
  .merge(onboardingStep4Schema)
  .merge(onboardingStep5Schema)
  .merge(onboardingStep6Schema)

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupEmailFormData = z.infer<typeof signupEmailSchema>
export type AccountSetupFormData = z.infer<typeof accountSetupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>
export type OnboardingStep3Data = z.infer<typeof onboardingStep3Schema>
export type OnboardingStep4Data = z.infer<typeof onboardingStep4Schema>
export type OnboardingStep5Data = z.infer<typeof onboardingStep5Schema>
export type OnboardingStep6Data = z.infer<typeof onboardingStep6Schema>
export type FullProfileData = z.infer<typeof fullProfileSchema>
