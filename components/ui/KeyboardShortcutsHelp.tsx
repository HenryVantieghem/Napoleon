'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Keyboard, X } from 'lucide-react'
import { useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = useKeyboardShortcutsHelp()

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        title="Keyboard shortcuts (or press ?)"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Navigate faster with these executive-grade keyboard shortcuts:
          </p>
          
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded text-gray-600">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Pro tip:</strong> These shortcuts work globally in your dashboard for maximum productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}