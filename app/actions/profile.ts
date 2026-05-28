'use server'

import { createServerClient } from '@/lib/supabase/server'
import { fullProfileSchema } from '@/lib/validations'
import { getDomainConfig } from '@/lib/email-domains'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertProfile(rawData: unknown) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'You must be signed in.' }
  }

  const parsed = fullProfileSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const cfg = getDomainConfig(user.email)
  if (!cfg) {
    return { error: 'Your email is not a recognized Harvard domain.' }
  }

  const data = parsed.data

  // Strip any HTML / unsafe content from short_bio (defense in depth)
  const safeBio = data.short_bio?.replace(/<[^>]*>/g, '').trim() ?? null

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, approval_status')
    .eq('id', user.id)
    .maybeSingle()

  const upsertData = {
    id: user.id,
    email: user.email,
    email_domain: user.email.split('@')[1].toLowerCase(),
    affiliation_type: cfg.track,
    harvard_school: cfg.school,
    harvard_school_code: cfg.school_code,
    prefix: data.prefix || null,
    first_name: data.first_name,
    last_name: data.last_name,
    preferred_name: data.preferred_name || null,
    degree_abbreviation: data.degree_abbreviation || null,
    concentration_field: data.concentration_field || null,
    graduation_year: data.graduation_year || null,
    is_current_student: data.is_current_student,
    house: data.house || null,
    country_of_origin: data.country_of_origin,
    africa_region: data.africa_region || null,
    languages: data.languages,
    job_title: data.job_title || null,
    current_company: data.current_company || null,
    industry: data.industry || null,
    city: data.city || null,
    country_of_residence: data.country_of_residence || null,
    contact_email: data.contact_email || user.email,
    linkedin_url: data.linkedin_url || null,
    personal_website: data.personal_website || null,
    short_bio: safeBio,
    willing_to_mentor: data.willing_to_mentor,
    open_to_coffee_chats: data.open_to_coffee_chats,
    show_email_to_members: data.show_email_to_members,
  }

  if (!existing) {
    // New profile: auto-approve based on the domain config
    const initialStatus = cfg.auto_approve ? 'approved' : 'pending'
    const { error } = await supabase.from('profiles').insert({
      ...upsertData,
      approval_status: initialStatus,
      role: 'member',
    })
    if (error) return { error: error.message }
    redirect(initialStatus === 'approved' ? '/directory' : '/pending')
  } else {
    const { error } = await supabase
      .from('profiles')
      .update(upsertData)
      .eq('id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/profile')
    revalidatePath(`/directory/${user.id}`)
    // Return redirect destination so callers that can't rely on a server-side
    // redirect (e.g. OnboardingWizard over a pre-existing partial profile) can
    // navigate client-side. Profile-edit callers ignore this field.
    const destination = existing.approval_status === 'approved' ? '/directory' : '/pending'
    return { success: true, redirectTo: destination }
  }
}
