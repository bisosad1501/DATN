// SSE Client with Authorization header support
// EventSource doesn't support custom headers, so we use fetch API

export class SSEClient {
  private eventSource: EventSource | null = null
  private abortController: AbortController | null = null

  connect(
    url: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
  ): void {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      console.error("[SSE] No token available")
      return
    }

    // Since EventSource doesn't support headers, we'll use API Gateway's middleware
    // which validates token from Authorization header in the request
    // But EventSource sends requests with credentials, so we need a workaround
    
    // Workaround: Use EventSource with credentials (cookies work, but we need header)
    // Alternative: Use fetch with ReadableStream to implement SSE manually
    
    // For now, use EventSource - API Gateway middleware should handle auth via cookie or query param
    const fullUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url
    
    this.eventSource = new EventSource(fullUrl, {
      withCredentials: true,
    })

    this.eventSource.addEventListener("connected", (event) => {
      console.log("[SSE] ✅ Connected:", event)
    })

    this.eventSource.addEventListener("notification", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error("[SSE] Parse error:", error)
      }
    })

    this.eventSource.addEventListener("error", (error) => {
      console.error("[SSE] ❌ Error:", error)
      if (onError) onError(error)
    })
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

// Better approach: Use fetch-based SSE to support Authorization header
export function createSSEConnection(
  url: string,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
): () => void {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (!token) {
    console.error("[SSE] No token available")
    return () => {}
  }

  const abortController = new AbortController()

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.substring(7).trim()
            // Handle event type
          } else if (line.startsWith("data: ")) {
            const data = line.substring(6).trim()
            try {
              const parsed = JSON.parse(data)
              onMessage(parsed)
            } catch (error) {
              // Not JSON, treat as plain text
              if (data) onMessage(data)
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== "AbortError") {
        console.error("[SSE] Connection error:", error)
        if (onError) onError(error)
      }
    })

  return () => {
    abortController.abort()
  }
}

