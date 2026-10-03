export default function Badge({ color = '#6366f1', icon: Icon, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  )
}
