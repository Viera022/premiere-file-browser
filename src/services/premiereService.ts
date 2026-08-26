declare global {
  interface Window {
    CSInterface?: any;
    __csInterfaceInstance?: any;
  }
}

class PremiereService {
  private csInterface: any = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      if (window.CSInterface) {
        this.csInterface = new window.CSInterface();
        window.__csInterfaceInstance = this.csInterface;
      }
    }
  }

  public isAvailable(): boolean {
    return this.csInterface !== null;
  }

  public evalScript(script: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.csInterface) {
        console.warn("[PremiereService] CSInterface not available (running in browser mode). Script:", script);
        resolve({ status: 'mock', message: 'Running outside CEP environment.' });
        return;
      }

      this.csInterface.evalScript(script, (result: string) => {
        try {
          if (!result || result === 'EvalScript error.') {
            reject(new Error('ExtendScript evaluation error: ' + result));
            return;
          }
          // Try parse JSON
          const parsed = JSON.parse(result);
          resolve(parsed);
        } catch (err) {
          // Return raw string if not JSON
          resolve({ status: 'raw', message: result });
        }
      });
    });
  }

  /**
   * Import multiple files to the active project / bin
   */
  public async importFiles(filePaths: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const formatted = filePaths.map(p => p.replace(/\\/g, '\\\\')).join('|||');
      const script = `importFilesToProject("${formatted}")`;
      const res = await this.evalScript(script);
      return { success: res.status === 'success', message: res.message || 'Files imported' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Import failed' };
    }
  }

  /**
   * Insert clip at current sequence playhead with optional In and Out trim points
   */
  public async insertAtPlayhead(
    filePath: string,
    inSeconds: number = 0,
    outSeconds: number = 0
  ): Promise<{ success: boolean; message: string }> {
    try {
      const cleanPath = filePath.replace(/\\/g, '\\\\');
      const script = `insertClipAtPlayhead("${cleanPath}", "${inSeconds.toFixed(3)}", "${outSeconds.toFixed(3)}")`;
      const res = await this.evalScript(script);
      return { success: res.status === 'success', message: res.message || 'Clip inserted' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Insert failed' };
    }
  }

  /**
   * Get active sequence details
   */
  public async getSequenceInfo(): Promise<string> {
    try {
      const res = await this.evalScript('getActiveSequenceInfo()');
      return res.message || 'No active sequence';
    } catch (e) {
      return 'Premiere offline';
    }
  }
}

export const premiereService = new PremiereService();
