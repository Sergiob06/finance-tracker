import { useThemeStore } from '../store/themeStore'

export function useChartColors() {
  const isDark = useThemeStore((state) => state.theme === 'dark')

  return {
    grid: isDark ? '#1F2937' : '#E5E7EB',
    axis: isDark ? '#9CA3AF' : '#6B7280',
    tooltipBg: isDark ? '#111827' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#F3F4F6' : '#111827',
  }
}
