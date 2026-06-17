import { useRegisterSW } from 'virtual:pwa-register/react'
import './ReloadPrompt.css'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
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
    <div className="reload-prompt" role="alert" aria-live="polite">
      <div className="reload-prompt__message">
        {offlineReady ? (
          <span>App lista para uso offline.</span>
        ) : (
          <span>Nueva versión disponible.</span>
        )}
      </div>
      <div className="reload-prompt__actions">
        {needRefresh && (
          <button
            type="button"
            className="reload-prompt__btn reload-prompt__btn--update"
            onClick={() => updateServiceWorker(true)}
          >
            Actualizar
          </button>
        )}
        <button
          type="button"
          className="reload-prompt__btn reload-prompt__btn--close"
          onClick={handleClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export { ReloadPrompt }
