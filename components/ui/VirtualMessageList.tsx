'use client'

import { memo, useMemo, useCallback, forwardRef } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { MessageCard } from '@/components/dashboard/MessageCard'
import type { Message } from '@/types'

interface VirtualMessageListProps {
  messages: Message[]
  height: number
  onMessageClick?: (message: Message) => void
  className?: string
}

interface MessageRowProps extends ListChildComponentProps {
  data: {
    messages: Message[]
    onMessageClick?: (message: Message) => void
  }
}

// Memoized message row component
const MessageRow = memo<MessageRowProps>(function MessageRow({ index, style, data }) {
  const { messages, onMessageClick } = data
  const message = messages[index]

  const handleClick = useCallback(() => {
    onMessageClick?.(message)
  }, [message, onMessageClick])

  if (!message) {
    return (
      <div style={style} className="p-3">
        <div className="animate-pulse bg-gray-200 rounded-lg h-32" />
      </div>
    )
  }

  return (
    <div style={style} className="p-3">
      <MessageCard 
        message={message}
        onClick={handleClick}
      />
    </div>
  )
})

export const VirtualMessageList = memo<VirtualMessageListProps>(function VirtualMessageList({
  messages,
  height,
  onMessageClick,
  className = ''
}) {
  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages,
    onMessageClick
  }), [messages, onMessageClick])

  // Calculate item height (card height + padding)
  const itemHeight = 160 // Approximate height including padding

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500 text-center">
          <p className="text-lg mb-2">No messages to display</p>
          <p className="text-sm">Messages will appear here when you refresh</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={messages.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
      >
        {MessageRow}
      </List>
    </div>
  )
})

// Hook for calculating optimal virtual list height
export function useVirtualListHeight(containerRef: React.RefObject<HTMLElement>, offset: number = 200) {
  return useMemo(() => {
    if (typeof window === 'undefined') return 600 // SSR fallback
    
    const viewportHeight = window.innerHeight
    return Math.max(400, viewportHeight - offset) // Minimum 400px, subtract offset for header/footer
  }, [offset])
}

// Priority-grouped virtual list for better UX
interface PriorityGroupedListProps {
  messages: Message[]
  height: number
  onMessageClick?: (message: Message) => void
  showPrioritySections?: boolean
  className?: string
}

export const PriorityGroupedVirtualList = memo<PriorityGroupedListProps>(function PriorityGroupedVirtualList({
  messages,
  height,
  onMessageClick,
  showPrioritySections = true,
  className = ''
}) {
  // Group messages by priority with headers
  const { groupedItems, totalItems } = useMemo(() => {
    if (!showPrioritySections) {
      return {
        groupedItems: messages.map(message => ({ type: 'message', data: message })),
        totalItems: messages.length
      }
    }

    const urgentMessages = messages.filter(m => m.priority === 'urgent')
    const questionMessages = messages.filter(m => m.priority === 'question') 
    const normalMessages = messages.filter(m => m.priority === 'normal')

    const items: Array<{ type: 'header' | 'message', data: string | Message }> = []

    // Add urgent section
    if (urgentMessages.length > 0) {
      items.push({ type: 'header', data: `Urgent Messages (${urgentMessages.length})` })
      urgentMessages.forEach(message => items.push({ type: 'message', data: message }))
    }

    // Add question section  
    if (questionMessages.length > 0) {
      items.push({ type: 'header', data: `Questions (${questionMessages.length})` })
      questionMessages.forEach(message => items.push({ type: 'message', data: message }))
    }

    // Add normal section
    if (normalMessages.length > 0) {
      items.push({ type: 'header', data: `Other Messages (${normalMessages.length})` })
      normalMessages.forEach(message => items.push({ type: 'message', data: message }))
    }

    return {
      groupedItems: items,
      totalItems: items.length
    }
  }, [messages, showPrioritySections])

  // Item data for virtual list
  const itemData = useMemo(() => ({
    items: groupedItems,
    onMessageClick
  }), [groupedItems, onMessageClick])

  // Variable item size based on content type
  const getItemSize = useCallback((index: number) => {
    const item = groupedItems[index]
    return item?.type === 'header' ? 48 : 160 // Headers are shorter
  }, [groupedItems])

  // Grouped row component
  const GroupedRow = memo<ListChildComponentProps>(function GroupedRow({ index, style, data }) {
    const { items, onMessageClick } = data
    const item = items[index]

    if (!item) {
      return (
        <div style={style} className="p-3">
          <div className="animate-pulse bg-gray-200 rounded-lg h-8" />
        </div>
      )
    }

    if (item.type === 'header') {
      return (
        <div style={style} className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              (item.data as string).includes('Urgent') 
                ? 'bg-red-500 animate-pulse' 
                : (item.data as string).includes('Question')
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
            }`} />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {item.data}
            </h4>
          </div>
        </div>
      )
    }

    const message = item.data as Message
    const handleClick = useCallback(() => {
      onMessageClick?.(message)
    }, [message, onMessageClick])

    return (
      <div style={style} className="px-3 pb-3">
        <MessageCard 
          message={message}
          onClick={handleClick}
        />
      </div>
    )
  })

  if (totalItems === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500 text-center">
          <p className="text-lg mb-2">No messages to display</p>
          <p className="text-sm">Messages will appear here when you refresh</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={totalItems}
        itemSize={getItemSize}
        itemData={itemData}
        overscanCount={3}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
      >
        {GroupedRow}
      </List>
    </div>
  )
})