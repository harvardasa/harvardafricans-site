// Tiny support-contact footer used on the directory side and auth pages so
// every page shows where to send questions / report bugs.

export default function SupportFooter() {
  return (
    <footer className="mt-auto pt-8 pb-6 px-4 text-center text-xs text-muted-foreground">
      <div className="max-w-2xl mx-auto space-x-2">
        <span>Questions?</span>
        <a
          href="mailto:inquiries@harvardafricans.com"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          inquiries@harvardafricans.com
        </a>
        <span aria-hidden="true">·</span>
        <span>Site bug?</span>
        <a
          href="mailto:tech@harvardafricans.com"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          tech@harvardafricans.com
        </a>
      </div>
    </footer>
  )
}
