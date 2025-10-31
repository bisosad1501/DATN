import type { Notification } from "@/types"

type SSEListener = (notification: Notification) => void
type ErrorListener = (error: Event | Error) => void

class SSEManager {
  private abortController: AbortController | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private shouldReconnect = true
  private listeners: Set<SSEListener> = new Set()
  private errorListeners: Set<ErrorListener> = new Set()
  private isConnected = false
  private isConnecting = false
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  }

  connect(
    onNotification: SSEListener,
    onError?: ErrorListener
  ): () => void {
    console.log("[SSE-Manager] connect() called, current listeners:", this.listeners.size, "connected:", this.isConnected, "connecting:", this.isConnecting)
    
    // Add listeners FIRST, before starting connection
    // Set doesn't allow duplicates, so we don't need to check
    this.listeners.add(onNotification)
    if (onError) {
      this.errorListeners.add(onError)
    }

    console.log("[SSE-Manager] After adding listener, total listeners:", this.listeners.size)

    // Create unsubscribe function FIRST (before any async operations)
    const unsubscribe = () => {
      console.log("[SSE-Manager] Unsubscribing listener, current count before:", this.listeners.size)
      this.listeners.delete(onNotification)
      if (onError) {
        this.errorListeners.delete(onError)
      }
      console.log("[SSE-Manager] After unsubscribe, listeners:", this.listeners.size)
      
      // Only disconnect if no listeners left
      // Use longer delay to avoid race conditions when component re-renders quickly
      if (this.listeners.size === 0) {
        console.log("[SSE-Manager] No listeners left, scheduling disconnect in 500ms...")
        // Longer delay to avoid race conditions
        setTimeout(() => {
          // Double check - maybe a new listener was added during the delay
          if (this.listeners.size === 0) {
            console.log("[SSE-Manager] Confirmed no listeners, disconnecting...")
            this.disconnect()
          } else {
            console.log("[SSE-Manager] New listener added during delay, keeping connection (listeners:", this.listeners.size, ")")
          }
        }, 500)
      }
    }

    // Start connection if not already connected or connecting
    // Only create ONE connection regardless of how many listeners
    // Use much longer timeout to handle React Strict Mode double-invoke cycle completely
    if (!this.isConnected && !this.isConnecting) {
      console.log("[SSE-Manager] Scheduling connection start (listeners:", this.listeners.size, ")...")
      // Use longer delay (1200ms) to fully handle React Strict Mode double-invoke cycle
      // React Strict Mode: mount → unmount → mount (takes ~200-500ms, but we need more buffer)
      setTimeout(() => {
        // Double-check listeners before starting
        if (this.listeners.size > 0 && !this.isConnected && !this.isConnecting) {
          console.log("[SSE-Manager] ✅ Starting connection now (listeners:", this.listeners.size, ")...")
          this.startConnection()
        } else {
          console.log("[SSE-Manager] ⏭️ Skipping connection start (listeners:", this.listeners.size, "connected:", this.isConnected, "connecting:", this.isConnecting, ")")
        }
      }, 1200)
    } else {
      console.log("[SSE-Manager] Connection already exists, adding listener to existing connection (connected:", this.isConnected, "connecting:", this.isConnecting, ")")
    }

    // Return unsubscribe function (ALWAYS return a function)
    console.log("[SSE-Manager] Returning unsubscribe function, type:", typeof unsubscribe)
    return unsubscribe
  }

  private startConnection() {
    if (this.isConnected || this.isConnecting) {
      console.log("[SSE-Manager] Already connected or connecting, skipping")
      return
    }

    // Final check - ensure we have listeners before starting
    if (this.listeners.size === 0) {
      console.warn("[SSE-Manager] ⚠️ startConnection() called but no listeners, aborting")
      return
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      console.error("[SSE-Manager] No token available")
      return
    }

    console.log("[SSE-Manager] ✅ Starting connection with", this.listeners.size, "listener(s)...")
    this.shouldReconnect = true
    // Call private async connectAsync() method
    this.connectAsync()
  }

  private async connectAsync() {
    if (this.isConnecting || !this.shouldReconnect) {
      console.log("[SSE-Manager] connect() called but already connecting or shouldReconnect=false")
      return
    }

    // Double-check listeners before starting connection
    // If no listeners, wait for React Strict Mode to finish
    // Instead of aborting, we retry after a delay to handle React Strict Mode
    if (this.listeners.size === 0) {
      console.warn("[SSE-Manager] ⚠️ No listeners before starting connection, waiting 1500ms for React Strict Mode...")
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (this.listeners.size === 0) {
        console.warn("[SSE-Manager] ⚠️ Still no listeners after wait - will retry connection attempt later")
        this.isConnecting = false
        // Retry connection after React Strict Mode cycle completes
        // This ensures we don't permanently abort during development
        setTimeout(() => {
          if (this.listeners.size > 0 && !this.isConnected && !this.isConnecting) {
            console.log("[SSE-Manager] ✅ Retrying connection after React Strict Mode (listeners:", this.listeners.size, ")")
            this.startConnection()
          }
        }, 2000)
        return
      }
      console.log("[SSE-Manager] ✅ Listeners registered after wait (count:", this.listeners.size, "), proceeding with connection")
    }


    this.isConnecting = true
    this.abortController = new AbortController()
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      console.error("[SSE-Manager] No token available")
      this.isConnecting = false
      return
    }

    const url = `${this.apiBaseUrl}/notifications/stream`
    let reconnectDelay = 1000

    try {
      console.log("[SSE-Manager] Fetching SSE stream, listeners:", this.listeners.size)
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: this.abortController?.signal,
      })

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      let buffer = ""
      this.isConnecting = false
      this.isConnected = true
      console.log("[SSE-Manager] ✅ Connected to notification stream, listeners:", this.listeners.size)

      reconnectDelay = 1000

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("[SSE-Manager] ⚠️ Stream ended, reconnecting in", reconnectDelay, "ms...")
          this.isConnected = false
          this.isConnecting = false
          if (this.shouldReconnect && this.listeners.size > 0) {
            this.reconnectTimeout = setTimeout(() => {
              reconnectDelay = Math.min(reconnectDelay * 2, 30000)
              this.connectAsync()
            }, reconnectDelay)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Process complete events (SSE format: event: <type>\ndata: <data>\n\n)
        while (buffer.includes("\n\n") || (buffer.includes("\n") && buffer.endsWith("\n"))) {
          let eventEndIndex = buffer.indexOf("\n\n")
          if (eventEndIndex === -1 && buffer.endsWith("\n")) {
            eventEndIndex = buffer.length - 1
          }

          if (eventEndIndex === -1) break

          const eventText = buffer.substring(0, eventEndIndex)
          buffer = buffer.substring(eventEndIndex + 2)

          let eventType = "message" // Default SSE event type
          let eventData = ""

          // Parse SSE format lines (split by \n or \r\n)
          const eventLines = eventText.split(/\r?\n/)
          
          for (let i = 0; i < eventLines.length; i++) {
            const line = eventLines[i]
            const trimmedLine = line.trim()
            if (!trimmedLine) continue // Skip empty lines
            
            const lowerLine = trimmedLine.toLowerCase()
            
            // Parse event type: "event:connected" or "event: connected" (case-insensitive)
            if (lowerLine.startsWith("event:")) {
              const afterColon = trimmedLine.substring(6) // After "event:"
              eventType = afterColon.trim()
              console.log("[SSE-Manager] 🔍 Found event type:", eventType, "from line:", line.substring(0, 50))
              continue
            }
            
            // Parse data: "data:{\"message\":\"...\"}" or "data: {\"message\":\"...\"}" (case-insensitive)
            if (lowerLine.startsWith("data:")) {
              const afterColon = trimmedLine.substring(5) // After "data:"
              const lineData = afterColon.trim()
              // Handle multi-line data (join with newline)
              if (eventData) {
                eventData += "\n" + lineData
              } else {
                eventData = lineData
              }
              console.log("[SSE-Manager] 🔍 Found data line:", lineData.substring(0, 50), "...")
              continue
            }
            
            // Ignore other lines (comments starting with ":", id, retry, etc.)
          }
          
          // Debug: Log what we parsed
          console.log("[SSE-Manager] 📦 Parsed SSE event:", {
            type: eventType,
            hasData: !!eventData,
            dataLength: eventData.length,
            rawLines: eventLines.length,
            firstLine: eventLines[0]?.substring(0, 50),
            preview: eventText.substring(0, 200),
          })

          // Process event - only process if there's data
          if (!eventData) {
            // Skip events without data (like empty heartbeats or connection messages)
            if (eventType === "heartbeat" || eventType === "connected" || eventType === "message") {
              console.log("[SSE-Manager] ⏭️ Skipping empty", eventType, "event (no data)")
            } else {
              console.log("[SSE-Manager] ⚠️ Received event with no data:", eventType)
            }
            continue
          }
          
          console.log("[SSE-Manager] 📥 Processing SSE event:", { eventType, dataLength: eventData.length })
          
          if (eventType === "notification") {
            try {
              const notification = JSON.parse(eventData) as Notification
              console.log("[SSE-Manager] 📬 Parsed notification:", {
                id: notification.id,
                title: notification.title,
                message: notification.message?.substring(0, 50),
                category: notification.category,
              })
              reconnectDelay = 1000
              
              // Notify all listeners - use Array.from to avoid iterator issues
              const listenersToNotify = Array.from(this.listeners)
              console.log("[SSE-Manager] 📢 Broadcasting to", listenersToNotify.length, "listener(s)")
              
              // Notify listeners synchronously to ensure immediate delivery
              listenersToNotify.forEach((listener) => {
                try {
                  console.log("[SSE-Manager] 📤 Calling listener with notification:", notification.id)
                  listener(notification)
                  console.log("[SSE-Manager] ✅ Listener called successfully")
                } catch (error) {
                  console.error("[SSE-Manager] ❌ Error in listener:", error)
                }
              })
            } catch (error) {
              console.error("[SSE-Manager] ❌ Parse error:", error, "Event data:", eventData)
            }
          } else if (eventType === "connected") {
            console.log("[SSE-Manager] ✅ Server confirmed connection")
            reconnectDelay = 1000
          } else if (eventType === "heartbeat") {
            console.log("[SSE-Manager] 💓 Heartbeat received")
            reconnectDelay = 1000
          } else {
            console.log("[SSE-Manager] ℹ️ Unknown event type:", eventType)
          }
        }
      }
    } catch (error: any) {
      this.isConnected = false
      this.isConnecting = false
      if (error.name !== "AbortError") {
        console.error("[SSE-Manager] ❌ Connection error:", error)
        this.errorListeners.forEach((listener) => {
          try {
            listener(error)
          } catch (err) {
            console.error("[SSE-Manager] Error in error listener:", err)
          }
        })
        // Auto-reconnect on error
        if (this.shouldReconnect && this.listeners.size > 0) {
          this.reconnectTimeout = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000)
            this.connectAsync()
          }, reconnectDelay)
        }
      }
    }
  }

  private disconnect() {
    this.shouldReconnect = false
    this.isConnected = false
    this.isConnecting = false
    
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    console.log("[SSE-Manager] Disconnected from notification stream")
  }

  // Public method to manually disconnect (when user logs out, etc.)
  destroy() {
    this.listeners.clear()
    this.errorListeners.clear()
    this.disconnect()
    console.log("[SSE-Manager] Destroyed all connections")
  }

  // Check if connected
  getConnected() {
    return this.isConnected
  }

  // Get listener count
  getListenerCount() {
    return this.listeners.size
  }
}

// Singleton instance
export const sseManager = new SSEManager()

