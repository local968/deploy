import React, { Component } from 'react';
import styles from './styles.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  refresh = window.location.reload.bind(window.location)

  goback = window.history.back.bind(window.history)

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div className={styles.errorBoundary}>
          <h2>Something went wrong. Please <a onClick={this.refresh}>refresh</a> or <a onClick={this.goback}>go back</a></h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}