export type AffiliationType = 'undergrad' | 'grad_student' | 'alumni' | 'faculty_or_staff'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'member' | 'admin'
export type AfricaRegion = 'north' | 'west' | 'east' | 'central' | 'southern' | 'diaspora'

export interface Profile {
  id: string
  email: string
  email_domain: string
  affiliation_type: AffiliationType
  approval_status: ApprovalStatus
  role: UserRole
  // Identity
  prefix: string | null
  first_name: string
  last_name: string
  preferred_name: string | null
  // Harvard
  harvard_school: string
  harvard_school_code: string | null
  degree: string | null
  degree_abbreviation: string | null
  concentration_field: string | null
  house: string | null
  graduation_year: number | null
  is_current_student: boolean
  // African connection
  country_of_origin: string
  africa_region: AfricaRegion | null
  languages: string[]
  // Career
  job_title: string | null
  current_company: string | null
  industry: string | null
  city: string | null
  country_of_residence: string | null
  // Contact + bio
  contact_email: string | null
  linkedin_url: string | null
  personal_website: string | null
  short_bio: string | null
  // Avatar
  avatar_url: string | null
  // Preferences
  willing_to_mentor: boolean
  open_to_coffee_chats: boolean
  show_email_to_members: boolean
  // Activity
  last_signed_in_at: string | null
  // Password / recovery (added in 0005_password_auth)
  recovery_email: string | null
  recovery_email_verified: boolean
  password_set_at: string | null
  // Timestamps
  created_at: string
  updated_at: string
}

export interface AdminAction {
  id: number
  admin_id: string
  target_id: string
  action: string
  note: string | null
  created_at: string
}
