import { useUiStore } from '@/store/ui'

export function useNotify() {
  const ui = useUiStore()
  const success = (message, timeout) => ui.showSnackbar({ message, color: 'success', timeout })
  const error = (message, timeout) => ui.showSnackbar({ message, color: 'error', timeout })
  const info = (message, timeout) => ui.showSnackbar({ message, color: 'info', timeout })
  return { success, error, info }
}

export default useNotify

