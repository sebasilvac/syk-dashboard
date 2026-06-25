import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
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

  function handleClose() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 px-5 bg-surface border border-secondary/50 rounded-xl shadow-elevated flex flex-col gap-3 max-w-[320px] animate-[slide-up_300ms_ease-out]" role="alert" aria-live="polite">
      <div className="text-sm text-text-primary">
        {offlineReady ? (
          <span>App lista para uso offline.</span>
        ) : (
          <span>Nueva versión disponible.</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button
            type="button"
            className="text-[13px] px-3 py-1.5 rounded-xl border-none cursor-pointer font-sans transition-opacity duration-200 hover:opacity-85 bg-accent text-white"
            onClick={() => updateServiceWorker(true)}
          >
            Actualizar
          </button>
        )}
        <button
          type="button"
          className="text-[13px] px-3 py-1.5 rounded-xl border-none cursor-pointer font-sans transition-opacity duration-200 hover:opacity-85 bg-bg-secondary text-text-muted"
          onClick={handleClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export { ReloadPrompt }
