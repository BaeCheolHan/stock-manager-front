import { useUiStore } from '@/store/ui'

export function useLoading() {
  const ui = useUiStore()
  const start = (message) => ui.startLoading(message)
  const stop = () => ui.stopLoading()
  return { start, stop }
}

export default useLoading

