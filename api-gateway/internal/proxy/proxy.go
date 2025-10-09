package proxy

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// ReverseProxy creates a reverse proxy handler for a target service
func ReverseProxy(targetURL string) gin.HandlerFunc {
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Fatalf("Failed to parse target URL %s: %v", targetURL, err)
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	// Customize the Director to preserve the path and query
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = target.Host
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host

		// Log the proxied request
		log.Printf("[Proxy] %s %s → %s%s", req.Method, req.URL.Path, target.String(), req.URL.Path)
	}

	// Custom error handler
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("[Proxy Error] Failed to proxy request to %s: %v", targetURL, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		fmt.Fprintf(w, `{"error":"service_unavailable","message":"Failed to connect to backend service","details":"%v"}`, err.Error())
	}

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// ProxyWithPathRewrite creates a reverse proxy that rewrites the path
func ProxyWithPathRewrite(targetURL, stripPrefix string) gin.HandlerFunc {
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Fatalf("Failed to parse target URL %s: %v", targetURL, err)
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalPath := req.URL.Path
		originalDirector(req)
		req.Host = target.Host
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host

		// Strip prefix from path
		if stripPrefix != "" {
			req.URL.Path = req.URL.Path[len(stripPrefix):]
			if req.URL.Path == "" {
				req.URL.Path = "/"
			}
		}

		log.Printf("[Proxy] %s %s (stripped: %s) → %s%s",
			req.Method, originalPath, stripPrefix, target.String(), req.URL.Path)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("[Proxy Error] Failed to proxy request to %s: %v", targetURL, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		fmt.Fprintf(w, `{"error":"service_unavailable","message":"Failed to connect to backend service"}`)
	}

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
