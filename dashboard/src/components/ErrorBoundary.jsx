import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          margin: 16,
          fontFamily: "monospace",
          maxHeight: "80vh",
          overflow: "auto",
        }}>
          <h2 style={{ color: "#dc2626", marginBottom: 8, fontSize: 16 }}>
            Error on this page
          </h2>
          <pre style={{
            color: "#7f1d1d",
            whiteSpace: "pre-wrap",
            fontSize: 12,
            lineHeight: 1.5,
            background: "#fff",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #fecaca",
          }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => this.setState({ error: null, errorInfo: null })}
            style={{
              marginTop: 12,
              padding: "8px 20px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
