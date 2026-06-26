import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update()
        }, 5 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  return null
}

export { ReloadPrompt }
