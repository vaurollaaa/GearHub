export default function CategoryCard({ name, image, scale = 1, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-28 shrink-0 flex-col items-center gap-2 sm:w-32"
    >
      <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-200">
        <img
          src={image}
          alt=""
          loading="lazy"
        className="size-full object-contain p-3"
          style={{ transform: `scale(${scale})` }}
        />
      </span>
      <span className="text-sm font-medium text-black">{name}</span>
    </button>
  )
}