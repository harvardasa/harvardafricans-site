'use client'

import { ToggleRow, type ProfileFormProps } from './_shared'

export function MentorshipFields({
  form,
  idPrefix = 'mentorship',
}: ProfileFormProps & { idPrefix?: string }) {
  const { watch, setValue } = form
  const values = watch()
  return (
    <>
      <ToggleRow
        id={`${idPrefix}-mentor`}
        label="I'm willing to mentor younger members"
        checked={values.willing_to_mentor}
        onChange={(v) => setValue('willing_to_mentor', v)}
      />
      <ToggleRow
        id={`${idPrefix}-coffee`}
        label="I'm open to coffee chats from other members"
        checked={values.open_to_coffee_chats}
        onChange={(v) => setValue('open_to_coffee_chats', v)}
      />
      <ToggleRow
        id={`${idPrefix}-email`}
        label="Show my contact email to other approved members"
        checked={values.show_email_to_members}
        onChange={(v) => setValue('show_email_to_members', v)}
      />
    </>
  )
}
