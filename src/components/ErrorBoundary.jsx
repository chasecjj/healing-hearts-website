import React from 'react';

// Detects chunk-load failures caused by stale HTML referencing chunk hashes
// that no longer exist after a deployment. Matches Vite/Rollup variants and
// the generic webpack-style message in case a dep throws it.
function isChunkLoadError(error) {
  if (!error) return false;
  const msg = String(error?.message ?? '');
  const name = String(error?.name ?? '');
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

// Session-scoped flag: lets us reload exactly once for a ChunkLoadError.
// If the reload still throws the same error (e.g. CDN still serving stale
// HTML), we fall through to the manual fallback UI instead of looping.
const RELOAD_FLAG = 'hh_chunk_reload_attempted';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }
  }

  handleManualReload = () => {
    sessionStorage.removeItem(RELOAD_FLAG);
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkError = isChunkLoadError(error);

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl text-primary mb-3">
            {chunkError ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p className="font-outfit text-primary/70 text-sm mb-6">
            {chunkError
              ? 'The site has been updated since you opened this tab. Refresh to load the latest version.'
              : 'An unexpected error occurred. Refreshing the page usually fixes it.'}
          </p>
          <button
            onClick={this.handleManualReload}
            className="inline-flex items-center justify-center rounded-full bg-primary text-white px-6 py-3 font-outfit text-sm hover:opacity-90 transition"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }
}
