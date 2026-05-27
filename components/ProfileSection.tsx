// Harvard Alumni–style section block: ALL-CAPS heading + 2px black underline.

export default function ProfileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm uppercase tracking-widest font-semibold border-b-2 border-black pb-2">
        {title}
      </h2>
      <div className="pt-4 text-gray-900">{children}</div>
    </section>
  )
}

// Helper for the label/value pairs used inside sections.
export function ProfileField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="text-base">{children}</div>
    </div>
  )
}
