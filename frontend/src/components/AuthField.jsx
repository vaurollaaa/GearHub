export default function AuthField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-black">
        {label}
      </label>
      <input
        id={id}
        className="mt-1 w-full border-0 border-b border-neutral-500 bg-transparent py-2 text-base text-black placeholder:text-neutral-400 focus:border-b-2 focus:border-brand-blue focus:outline-none"
        {...props}
      />
    </div>
  )
}