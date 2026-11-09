export default function FormField({ label, id, children, hint, ...props }) {
  const base =
    'mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-black placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none'

  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-black">
        {label}
      </label>
      {children ? (
        <select id={id} className={base} {...props}>
          {children}
        </select>
      ) : (
        <input id={id} className={base} {...props} />
      )}
      {hint && <p className="mt-1 text-sm text-neutral-600">{hint}</p>}
    </div>
  )
}