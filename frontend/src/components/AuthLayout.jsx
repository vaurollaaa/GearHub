import { Link } from 'react-router-dom'

export default function AuthLayout({ title, backTo, children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative flex h-72 shrink-0 items-end overflow-hidden bg-brand-blue px-6 pb-12 sm:h-80 lg:h-auto lg:flex-1 lg:px-16 lg:pb-24">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-32 size-72 rounded-full bg-linear-to-b from-brand-yellow/60 to-transparent sm:size-96 lg:size-[34rem]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 top-16 size-48 rounded-full bg-linear-to-b from-brand-yellow/50 to-transparent sm:size-64 lg:size-96"
        />

        {backTo && (
          <Link
            to={backTo}
            aria-label="Kembali"
            className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        <h1 className="relative text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
      </section>

      <section className="relative -mt-8 flex-1 rounded-t-[2rem] bg-white px-6 pb-10 pt-10 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:rounded-none lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </div>
  )
}