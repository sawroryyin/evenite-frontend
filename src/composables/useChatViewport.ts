import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Keeps a full-screen chat layout glued to the top of the on-screen keyboard.
 * iOS doesn't resize the page when the keyboard opens, so we measure the
 * visible area (visualViewport) and size the chat screen to it.
 */
export function useChatViewport() {
  const root = document.documentElement
  const vv = window.visualViewport

  const update = () => {
    const visibleHeight = vv ? vv.height : window.innerHeight
    root.style.setProperty('--app-height', `${visibleHeight}px`)

    // clientHeight = full layout height (unaffected by the iOS keyboard)
    const keyboardOpen = vv ? root.clientHeight - vv.height > 120 : false
    root.toggleAttribute('data-keyboard-open', keyboardOpen)

    // iOS scrolls the page up to reveal the input; pin it back to the top
    if (window.scrollY !== 0) window.scrollTo(0, 0)
  }

  onMounted(() => {
    root.classList.add('chat-locked')
    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    vv?.removeEventListener('resize', update)
    vv?.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    root.classList.remove('chat-locked')
    root.removeAttribute('data-keyboard-open')
    root.style.removeProperty('--app-height')
  })
}