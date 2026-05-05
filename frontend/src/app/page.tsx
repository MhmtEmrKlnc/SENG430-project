import dynamic from 'next/dynamic'

// Dynamically import AppShell - reduces initial JS parse time
// which directly lowers Total Blocking Time (TBT)
const AppShell = dynamic(
  () => import('@/components/layout/AppShell').then((m) => m.AppShell),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-screen bg-surface flex items-center justify-center"
        aria-label="Loading application"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <svg
            className="animate-spin h-8 w-8 text-brand-teal"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Loading HEALTH-AI…</span>
        </div>
      </div>
    ),
  }
)

export default function HomePage() {
  return <AppShell />
}
