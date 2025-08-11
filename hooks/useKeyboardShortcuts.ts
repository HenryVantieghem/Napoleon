'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcuts {
  onRefresh?: () => void
  onNextMessage?: () => void
  onPrevMessage?: () => void
  onToggleFilter?: () => void
  onFocusSearch?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts({
  onRefresh,
  onNextMessage,
  onPrevMessage,
  onToggleFilter,
  onFocusSearch,
  onEscape
}: KeyboardShortcuts) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    const target = event.target as HTMLElement
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
      // Allow escape to blur inputs
      if (event.key === 'Escape' && onEscape) {
        onEscape()
      }
      return
    }

    // Prevent default for shortcut keys
    const shortcuts = ['r', 'R', 'j', 'J', 'k', 'K', 'f', 'F', '/', 'Escape']
    if (shortcuts.includes(event.key)) {
      event.preventDefault()
    }

    switch (event.key) {
      case 'r':
      case 'R':
        // Refresh messages
        onRefresh?.()
        break
      case 'j':
      case 'J':
        // Next message (Gmail-style)
        onNextMessage?.()
        break
      case 'k':
      case 'K':
        // Previous message (Gmail-style)
        onPrevMessage?.()
        break
      case 'f':
      case 'F':
        // Toggle filter
        onToggleFilter?.()
        break
      case '/':
        // Focus search (future feature)
        onFocusSearch?.()
        break
      case 'Escape':
        // Escape/close modals
        onEscape?.()
        break
    }
  }, [onRefresh, onNextMessage, onPrevMessage, onToggleFilter, onFocusSearch, onEscape])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
}

// Hook to display keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'R', description: 'Refresh messages' },
    { key: 'J', description: 'Next message' },
    { key: 'K', description: 'Previous message' },
    { key: 'F', description: 'Toggle filter' },
    { key: '/', description: 'Focus search' },
    { key: 'Esc', description: 'Close/escape' },
  ]

  return shortcuts
}