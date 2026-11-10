import { CheckIcon } from './icons'

export default function Stepper({ steps, step }) {
  return (
    <ol className="flex items-start" aria-label="Langkah">
      {steps.map((label, i) => {
        const number = i + 1
        const done = number < step
        const current = number === step
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${
                  number <= step ? 'bg-brand-blue' : 'bg-neutral-300'
                }`}
              />
            )}
            <span
              aria-current={current ? 'step' : undefined}
              className={`relative flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                done
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : current
                    ? 'border-brand-blue bg-white text-brand-blue'
                    : 'border-neutral-300 bg-white text-neutral-400'
              }`}
            >
              {done ? <CheckIcon className="size-4" /> : number}
            </span>
            <span className="text-center text-xs text-neutral-600">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}