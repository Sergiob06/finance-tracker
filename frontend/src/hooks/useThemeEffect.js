import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useThemeEffect() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
