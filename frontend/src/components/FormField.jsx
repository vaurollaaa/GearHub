export default function FormField({ label, id, children, hint, multiline, ...props }) {
  const base =
    'mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-black placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none'

  let control
  if (children) {
    control = (
      <select id={id} className={base} {...props}>
        {children}
      </select>
    )
  } else if (multiline) {
    control = <textarea id={id} className={`${base} min-h-32 resize-y`} {...props} />
  } else {
    control = <input id={id} className={base} {...props} />
  }

  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-black">
        {label}
      </label>
      {control}
      {hint && <p className="mt-1 text-sm text-neutral-600">{hint}</p>}
    </div>
  )
}