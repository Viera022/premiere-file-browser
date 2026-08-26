import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, ExternalLink, Trash2, HelpCircle } from 'lucide-react';
import { Language, getTranslation } from '../i18n/translations';

interface Props {
  children: ReactNode;
  language?: Language;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[Premiere File Browser Error Boundary]', error, errorInfo);
  }

  private generateReport(): string {
    const { error, errorInfo } = this.state;
    const isMac = typeof navigator !== 'undefined' && (/Mac/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent));
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const lastPath = localStorage.getItem('filebrowser_last_path') || 'Home';
    const lang = localStorage.getItem('filebrowser_language') || 'pt';

    return [
      '### 🚨 Premiere File Browser Crash Report',
      '',
      `- **App Version**: v1.0.0`,
      `- **OS / Platform**: ${isMac ? 'macOS' : 'Windows'} (${userAgent})`,
      `- **Language**: ${lang}`,
      `- **Last Path**: ${lastPath}`,
      `- **Timestamp**: ${new Date().toISOString()}`,
      '',
      '#### 💥 Error Message',
      '```',
      error?.name ? `${error.name}: ${error.message}` : 'Unknown Error',
      '```',
      '',
      '#### 📜 Stack Trace',
      '```',
      error?.stack || 'No stack trace available',
      '```',
      '',
      '#### 🧩 Component Stack',
      '```',
      errorInfo?.componentStack || 'No component stack available',
      '```'
    ].join('\n');
  }

  private handleCopyReport = () => {
    const report = this.generateReport();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(report).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 3000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = report;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);
    }
  };

  private handleOpenGitHubIssue = () => {
    const { error } = this.state;
    const report = this.generateReport();
    const title = encodeURIComponent(`[Crash Report] ${error?.message?.slice(0, 60) || 'Unexpected Error'}`);
    const body = encodeURIComponent(report);
    const url = `https://github.com/Viera022/premiere-file-browser/issues/new?title=${title}&body=${body}`;

    if (typeof window !== 'undefined' && window.cep && window.cep.util) {
      window.cep.util.openURLInDefaultBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReset = () => {
    try {
      localStorage.removeItem('filebrowser_last_path');
      localStorage.removeItem('filebrowser_hover_scrub');
      localStorage.removeItem('filebrowser_hw_accel');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const savedLang = (localStorage.getItem('filebrowser_language') as Language) || this.props.language || 'pt';
      const t = getTranslation(savedLang);
      const { error, copied } = this.state;

      return (
        <div className="flex h-full w-full items-center justify-center p-6 bg-zinc-950 text-white select-none overflow-y-auto font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-wide">{t.crashTitle}</h1>
                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{t.crashSub}</p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-rose-300 break-words max-h-24 overflow-y-auto">
              {error?.name ? `${error.name}: ${error.message}` : 'Error: An unknown exception occurred in the UI.'}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={this.handleCopyReport}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow ${
                  copied
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.crashCopied : t.crashCopyBtn}</span>
              </button>

              <button
                onClick={this.handleOpenGitHubIssue}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-white flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.crashGitHubBtn}</span>
              </button>
            </div>

            {/* Quick Tutorial Box */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-[11px] text-zinc-400">
              <div className="font-semibold text-zinc-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.crashTutorialTitle}</span>
              </div>
              <p className="leading-snug">{t.crashStep1}</p>
              <p className="leading-snug">{t.crashStep2}</p>
              <p className="leading-snug">{t.crashStep3}</p>
            </div>

            {/* Footer Recovery Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
              <button
                onClick={this.handleClearCacheAndReset}
                className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[10px] text-zinc-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                title={t.crashResetBtn}
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.crashResetBtn}</span>
              </button>

              <button
                onClick={this.handleReload}
                className="py-1.5 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.crashReloadBtn}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
