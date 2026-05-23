// src/components/ui/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error: error.message ?? 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('[ORBITOPS]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full py-24 flex items-center justify-center">
          <div className="panel-glass rounded-sm p-8 max-w-md text-center relative">
            <div className="corner-tl" /><div className="corner-tr" />
            <div className="corner-bl" /><div className="corner-br" />
            <div className="label-mono text-alert/70 mb-3">MODULE ERROR</div>
            <p className="font-mono text-hud-sm text-white/30 mb-5 break-all">
              {this.state.error}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="label-mono text-pulsar border border-pulsar/30 px-4 py-2 hover:bg-pulsar/10 transition-colors duration-200"
            >
              RETRY MODULE
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}