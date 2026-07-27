'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="shard p-8 max-w-md w-full text-center space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 inline-block">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight">System Anomaly Detected</h3>
            <p className="text-xs text-muted-foreground font-mono uppercase">
              An unexpected error occurred in this module.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground font-bold uppercase text-xs transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Module
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
