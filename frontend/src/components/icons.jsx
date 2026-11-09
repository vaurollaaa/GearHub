function Svg({ className = 'size-6', fill = 'none', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p) => (
  <Svg {...p}><path d="M3 11l9-8 9 8M5 10v10h14V10" /></Svg>
)
export const SearchIcon = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>
)
export const PlusIcon = (p) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
)
export const HistoryIcon = (p) => (
  <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></Svg>
)
export const UserIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Svg>
)
export const BellIcon = (p) => (
  <Svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0" /></Svg>
)
export const ChevronDownIcon = (p) => (
  <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
)
export const ArrowRightIcon = (p) => (
  <Svg {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Svg>
)
export const ArrowLeftIcon = (p) => (
  <Svg {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
)
export const StarIcon = (p) => (
  <Svg fill="currentColor" {...p}>
    <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z" />
  </Svg>
)
export const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)