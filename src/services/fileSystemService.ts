import { FileItem, MediaType, DriveItem, CustomLibrary, MediaFilter } from '../types';
import { premiereService } from './premiereService';
import JSZip from 'jszip';

declare global {
  interface Window {
    require?: any;
    cep_node?: any;
    cep?: any;
    process?: any;
  }
}

const EXTENSIONS: Record<string, MediaType> = {
  mp4: 'video', mov: 'video', mkv: 'video', avi: 'video', webm: 'video', m4v: 'video', wmv: 'video', mpg: 'video', mpeg: 'video',
  mp3: 'audio', wav: 'audio', aac: 'audio', m4a: 'audio', ogg: 'audio', flac: 'audio', aif: 'audio', aiff: 'audio', wma: 'audio',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', psd: 'image', tiff: 'image', tif: 'image', ai: 'image',
  mogrt: 'mogrt', prfpset: 'mogrt',
  ttf: 'font', otf: 'font', woff: 'font', woff2: 'font',
  aep: 'project', aepx: 'project', prproj: 'project'
};

class FileSystemService {
  private cache = new Map<string, { items: FileItem[]; time: number }>();
  private thumbCache = new Map<string, string>();
  private tempThumbDir = '';
  private cachedFfmpegPath: string | null = null;
  private cachedDrives: DriveItem[] | null = null;
  private ffmpegQueue: { videoPath: string; resolve: (url: string | null) => void }[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initTempDir();
  }

  public isMac(): boolean {
    if (typeof window !== 'undefined' && window.process && window.process.platform) {
      return window.process.platform === 'darwin';
    }
    if (typeof navigator !== 'undefined') {
      return /Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
    }
    return false;
  }

  public getNodeModules() {
    try {
      const req = (typeof window !== 'undefined' && window.require) 
        ? window.require 
        : (typeof window !== 'undefined' && window.cep_node && window.cep_node.require)
        ? window.cep_node.require
        : (typeof require !== 'undefined' ? require : null);

      if (req) {
        const fs = req('fs');
        const path = req('path');
        const child_process = req('child_process');
        const os = req('os');
        return { fs, path, child_process, os };
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  public getUserHome(): string {
    const nodeMods = this.getNodeModules();
    if (nodeMods && nodeMods.os && typeof nodeMods.os.homedir === 'function') {
      try {
        const h = nodeMods.os.homedir();
        if (h) return this.normalizePath(h);
      } catch {}
    }

    if (typeof window !== 'undefined' && window.process && window.process.env) {
      const home = window.process.env.HOME || window.process.env.USERPROFILE;
      if (home) return this.normalizePath(home);
    }

    return this.isMac() ? '/Users' : 'C:\\';
  }

  public getDownloadsPath(): string {
    const home = this.getUserHome();
    return this.isMac() ? `${home}/Downloads` : this.normalizePath(`${home}\\Downloads`);
  }

  public getDocumentsPath(): string {
    const home = this.getUserHome();
    return this.isMac() ? `${home}/Documents` : this.normalizePath(`${home}\\Documents`);
  }

  public getVideosPath(): string {
    const home = this.getUserHome();
    return this.isMac() ? `${home}/Movies` : this.normalizePath(`${home}\\Videos`);
  }

  public getPicturesPath(): string {
    const home = this.getUserHome();
    return this.isMac() ? `${home}/Pictures` : this.normalizePath(`${home}\\Pictures`);
  }

  public getUserName(): string {
    try {
      const saved = localStorage.getItem('filebrowser_user_name');
      if (saved && saved.trim()) return saved.trim();
    } catch {}

    const nodeMods = this.getNodeModules();
    if (nodeMods && nodeMods.os) {
      try {
        const u = nodeMods.os.userInfo();
        if (u && u.username) {
          return u.username.charAt(0).toUpperCase() + u.username.slice(1);
        }
      } catch {}
    }

    if (typeof window !== 'undefined' && window.process && window.process.env) {
      const uname = window.process.env.USER || window.process.env.USERNAME;
      if (uname) return uname.charAt(0).toUpperCase() + uname.slice(1);
    }

    return '';
  }

  public getFfmpegPath(): string {
    if (this.cachedFfmpegPath) return this.cachedFfmpegPath;

    const nodeMods = this.getNodeModules();
    if (!nodeMods || !nodeMods.fs || !nodeMods.path) {
      this.cachedFfmpegPath = 'ffmpeg';
      return 'ffmpeg';
    }

    const userHome = this.getUserHome();
    const isMac = this.isMac();

    const candidates = isMac ? [
      '/opt/homebrew/bin/ffmpeg',       // Apple Silicon (M1/M2/M3/M4)
      '/usr/local/bin/ffmpeg',          // Intel Mac Homebrew
      '/opt/local/bin/ffmpeg',          // MacPorts
      nodeMods.path.join(userHome, 'bin', 'ffmpeg'),
      'ffmpeg'
    ] : [
      nodeMods.path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
      nodeMods.path.join(userHome, 'AppData', 'Local', 'Programs', 'ffmpeg', 'bin', 'ffmpeg.exe'),
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'ffmpeg'
    ];

    for (const p of candidates) {
      try {
        if (p === 'ffmpeg' || nodeMods.fs.existsSync(p)) {
          this.cachedFfmpegPath = p;
          return p;
        }
      } catch {}
    }

    this.cachedFfmpegPath = 'ffmpeg';
    return 'ffmpeg';
  }

  private initTempDir() {
    const nodeMods = this.getNodeModules();
    if (nodeMods && nodeMods.os && nodeMods.fs && nodeMods.path) {
      try {
        const temp = nodeMods.os.tmpdir();
        this.tempThumbDir = nodeMods.path.join(temp, 'premiere_browser_thumbs');
        if (!nodeMods.fs.existsSync(this.tempThumbDir)) {
          nodeMods.fs.mkdirSync(this.tempThumbDir, { recursive: true });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  public normalizePath(p: string): string {
    if (!p) return '';
    if (this.isMac()) {
      let normalized = p.replace(/\\/g, '/');
      if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } else {
      let normalized = p.replace(/\//g, '\\');
      if (normalized.length > 3 && normalized.endsWith('\\')) {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    }
  }

  public getMediaType(ext: string): MediaType {
    const cleanExt = ext.toLowerCase().replace('.', '');
    return EXTENSIONS[cleanExt] || 'other';
  }

  public formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  public isCloudPath(targetPath: string): boolean {
    const clean = this.normalizePath(targetPath).toLowerCase();
    return (
      clean.includes('google drive') ||
      clean.includes('googledrive') ||
      clean.includes('onedrive') ||
      clean.includes('dropbox') ||
      clean.includes('icloud') ||
      clean.includes('cloudstorage') ||
      clean.includes('my drive') ||
      clean.includes('cloud') ||
      clean.startsWith('g:\\') ||
      clean === 'g:\\' ||
      clean.startsWith('h:\\') ||
      clean === 'h:\\'
    );
  }

  public getDrives(): DriveItem[] {
    if (this.cachedDrives && this.cachedDrives.length > 0) {
      return this.cachedDrives;
    }

    const nodeMods = this.getNodeModules();
    const discovered: DriveItem[] = [];
    const isMac = this.isMac();

    if (nodeMods && nodeMods.fs) {
      if (isMac) {
        // macOS: Macintosh HD + /Volumes scan
        discovered.push({
          id: 'drive_mac_root',
          name: 'Macintosh HD',
          path: '/',
          type: 'local_drive'
        });

        try {
          if (nodeMods.fs.existsSync('/Volumes')) {
            const vols = nodeMods.fs.readdirSync('/Volumes');
            for (const v of vols) {
              if (!v || v.startsWith('.') || v === 'Macintosh HD') continue;
              const vPath = `/Volumes/${v}`;
              const isCloud = this.isCloudPath(vPath) || v.toLowerCase().includes('google') || v.toLowerCase().includes('cloud');
              discovered.push({
                id: `vol_${v.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                name: v,
                path: vPath,
                type: isCloud ? 'cloud_drive' : 'local_drive'
              });
            }
          }
        } catch {}

        // macOS CloudStorage detection (~/Library/CloudStorage)
        try {
          const userHome = this.getUserHome();
          const cloudStoragePath = nodeMods.path.join(userHome, 'Library', 'CloudStorage');
          if (nodeMods.fs.existsSync(cloudStoragePath)) {
            const cloudFolders = nodeMods.fs.readdirSync(cloudStoragePath);
            for (const cf of cloudFolders) {
              if (cf.startsWith('.')) continue;
              const fullCloudPath = nodeMods.path.join(cloudStoragePath, cf);
              let displayName = cf;
              if (cf.includes('GoogleDrive')) displayName = 'Google Drive';
              else if (cf.includes('OneDrive')) displayName = 'OneDrive';
              else if (cf.includes('Dropbox')) displayName = 'Dropbox';
              else if (cf.includes('Box')) displayName = 'Box';

              discovered.push({
                id: `mac_cloud_${cf.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                name: displayName,
                path: fullCloudPath,
                type: 'cloud_drive'
              });
            }
          }

          // macOS iCloud Drive (~/Library/Mobile Documents/com~apple~CloudDocs)
          const iCloudPath = nodeMods.path.join(userHome, 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
          if (nodeMods.fs.existsSync(iCloudPath)) {
            discovered.push({
              id: 'mac_icloud',
              name: 'iCloud Drive',
              path: iCloudPath,
              type: 'cloud_drive'
            });
          }
        } catch {}

      } else {
        // Windows: Drive letters + OneDrive + Dropbox
        const letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'Z'];
        for (const l of letters) {
          try {
            const drivePath = `${l}:\\`;
            if (nodeMods.fs.existsSync(drivePath)) {
              let isCloud = false;
              let driveName = l === 'C' ? 'Disco Local (C:)' : `Disco (${l}:)`;

              try {
                if (
                  nodeMods.fs.existsSync(nodeMods.path.join(drivePath, 'My Drive')) ||
                  nodeMods.fs.existsSync(nodeMods.path.join(drivePath, '.shortcut-targets-by-id'))
                ) {
                  isCloud = true;
                  driveName = `Google Drive (${l}:)`;
                }
              } catch {}

              discovered.push({
                id: `drive_${l.toLowerCase()}`,
                name: driveName,
                path: drivePath,
                type: isCloud ? 'cloud_drive' : 'local_drive'
              });
            }
          } catch {
            // ignore
          }
        }

        // Check user's OneDrive folder on Windows
        try {
          const oneDrivePath = nodeMods.path.join(this.getUserHome(), 'OneDrive');
          if (nodeMods.fs.existsSync(oneDrivePath)) {
            discovered.push({
              id: 'drive_onedrive',
              name: 'Microsoft OneDrive',
              path: this.normalizePath(oneDrivePath),
              type: 'cloud_drive'
            });
          }
        } catch {}

        // Check user's Dropbox folder on Windows
        try {
          const dropBoxPath = nodeMods.path.join(this.getUserHome(), 'Dropbox');
          if (nodeMods.fs.existsSync(dropBoxPath)) {
            discovered.push({
              id: 'drive_dropbox',
              name: 'Dropbox',
              path: this.normalizePath(dropBoxPath),
              type: 'cloud_drive'
            });
          }
        } catch {}
      }
    }

    if (discovered.length === 0) {
      discovered.push({
        id: isMac ? 'drive_mac_root' : 'drive_c',
        name: isMac ? 'Macintosh HD' : 'Disco Local (C:)',
        path: isMac ? '/' : 'C:\\',
        type: 'local_drive'
      });
    }

    this.cachedDrives = discovered;
    return discovered;
  }

  public getSmartSuggestions(): { name: string; path: string; icon: string; category: 'assets' | 'system' }[] {
    const isMac = this.isMac();
    const downloads = this.getDownloadsPath();
    const videos = this.getVideosPath();
    const music = isMac ? `${this.getUserHome()}/Music` : this.normalizePath(`${this.getUserHome()}\\Music`);
    const docs = this.getDocumentsPath();
    const pics = this.getPicturesPath();
    const desktop = isMac ? `${this.getUserHome()}/Desktop` : this.normalizePath(`${this.getUserHome()}\\Desktop`);

    const suggestions: { name: string; path: string; icon: string; category: 'assets' | 'system' }[] = [
      { name: 'Downloads', path: downloads, icon: 'download', category: 'system' },
      { name: isMac ? 'Filmes / Vídeos' : 'Vídeos', path: videos, icon: 'film', category: 'system' },
      { name: 'Músicas', path: music, icon: 'music', category: 'system' },
      { name: 'Documentos', path: docs, icon: 'folder', category: 'system' },
      { name: 'Imagens / Fotos', path: pics, icon: 'image', category: 'system' },
      { name: isMac ? 'Mesa (Desktop)' : 'Área de Trabalho', path: desktop, icon: 'folder', category: 'system' }
    ];

    return suggestions;
  }

  public getCustomLibraries(): CustomLibrary[] {
    try {
      const saved = localStorage.getItem('filebrowser_custom_libraries');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  }

  public saveCustomLibraries(libs: CustomLibrary[]) {
    localStorage.setItem('filebrowser_custom_libraries', JSON.stringify(libs));
  }

  public addCustomLibrary(lib: Omit<CustomLibrary, 'id'>): CustomLibrary {
    const libs = this.getCustomLibraries();
    const newLib: CustomLibrary = {
      ...lib,
      id: 'lib_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    libs.push(newLib);
    this.saveCustomLibraries(libs);
    return newLib;
  }

  public removeCustomLibrary(id: string) {
    const libs = this.getCustomLibraries().filter(l => l.id !== id);
    this.saveCustomLibraries(libs);
  }

  public getLabelsMap(): Record<string, string> {
    try {
      const saved = localStorage.getItem('filebrowser_item_labels');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  public setItemLabel(path: string, colorId: string | null) {
    const map = this.getLabelsMap();
    if (colorId) {
      map[path] = colorId;
    } else {
      delete map[path];
    }
    localStorage.setItem('filebrowser_item_labels', JSON.stringify(map));
  }

  public async listSubdirectories(dirPath: string): Promise<{ name: string; path: string }[]> {
    const nodeMods = this.getNodeModules();
    const clean = this.normalizePath(dirPath);
    if (!nodeMods || !nodeMods.fs) return [];

    const { fs, path } = nodeMods;
    return new Promise((resolve) => {
      fs.readdir(clean, { withFileTypes: true }, (err: any, entries: any[]) => {
        if (err || !entries) return resolve([]);
        const subs: { name: string; path: string }[] = [];
        for (const entry of entries) {
          const name = typeof entry === 'string' ? entry : entry.name;
          if (!name || name.startsWith('.') || name.startsWith('._') || name.startsWith('$') || name === 'System Volume Information') {
            continue;
          }
          const isDir = typeof entry.isDirectory === 'function' ? entry.isDirectory() : false;
          if (isDir) {
            subs.push({
              name,
              path: path.join(clean, name)
            });
          }
        }
        resolve(subs);
      });
    });
  }

  public async listDirectory(targetPath: string, forceRefresh = false): Promise<FileItem[]> {
    const dirPath = this.normalizePath(targetPath);

    if (!forceRefresh && this.cache.has(dirPath)) {
      const cached = this.cache.get(dirPath)!;
      if (Date.now() - cached.time < 30000) {
        return cached.items;
      }
    }

    const starredSet = this.getStarredPaths();
    const labelsMap = this.getLabelsMap();

    const nodeMods = this.getNodeModules();
    if (nodeMods && nodeMods.fs) {
      try {
        const items = await this.fastNodeScan(nodeMods.fs, nodeMods.path, dirPath, starredSet, labelsMap);
        if (items !== null) {
          this.cache.set(dirPath, { items, time: Date.now() });
          return items;
        }
      } catch (err) {
        console.warn('[FileSystemService] Node scan failed:', err);
      }
    }

    if (typeof window !== 'undefined' && window.cep && window.cep.fs) {
      try {
        const items = this.fastCepScan(dirPath, starredSet, labelsMap);
        if (items !== null) {
          this.cache.set(dirPath, { items, time: Date.now() });
          return items;
        }
      } catch (err) {
        console.warn('[FileSystemService] CEP FS failed:', err);
      }
    }

    const jsxItems = await this.listWithExtendScript(dirPath, starredSet, labelsMap);
    if (jsxItems) {
      this.cache.set(dirPath, { items: jsxItems, time: Date.now() });
      return jsxItems;
    }

    return this.getMockFiles(dirPath, starredSet, labelsMap);
  }

  public async searchRecursive(
    rootPath: string,
    query: string,
    mediaFilter: MediaFilter = 'all',
    options: { maxDepth?: number; maxResults?: number } = {},
    onProgress?: (batch: FileItem[]) => void,
    signal?: AbortSignal
  ): Promise<FileItem[]> {
    const cleanRoot = this.normalizePath(rootPath);
    const maxDepth = options.maxDepth ?? 6;
    const maxResults = options.maxResults ?? 600;
    const cleanQuery = query.trim().toLowerCase();
    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    const starredSet = this.getStarredPaths();
    const labelsMap = this.getLabelsMap();

    const nodeMods = this.getNodeModules();
    if (!nodeMods || !nodeMods.fs || !nodeMods.path) {
      return [];
    }

    const { fs, path } = nodeMods;
    const results: FileItem[] = [];
    const queue: { dir: string; depth: number }[] = [{ dir: cleanRoot, depth: 0 }];

    const BATCH_SIZE = 15;
    let pendingBatch: FileItem[] = [];

    const flushBatch = () => {
      if (pendingBatch.length > 0 && onProgress) {
        onProgress([...pendingBatch]);
        pendingBatch = [];
      }
    };

    while (queue.length > 0 && results.length < maxResults) {
      if (signal?.aborted) break;

      const current = queue.shift()!;
      if (current.depth > maxDepth) continue;

      let entries: any[] = [];
      try {
        entries = await new Promise<any[]>((resolve) => {
          fs.readdir(current.dir, { withFileTypes: true }, (err: any, files: any[]) => {
            if (err || !files) resolve([]);
            else resolve(files);
          });
        });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (signal?.aborted || results.length >= maxResults) break;

        const name = typeof entry === 'string' ? entry : entry.name;
        if (
          !name ||
          name.startsWith('.') ||
          name.startsWith('._') ||
          name.startsWith('$') ||
          name === 'node_modules' ||
          name === 'AppData' ||
          name === 'System Volume Information' ||
          name === 'Recovery' ||
          name === 'Thumbs.db' ||
          name === 'desktop.ini' ||
          name.endsWith('.pek') ||
          name.endsWith('.cfa')
        ) {
          continue;
        }

        const isDir = typeof entry.isDirectory === 'function' ? entry.isDirectory() : false;
        const fullPath = path.join(current.dir, name);

        if (isDir) {
          if (current.depth < maxDepth) {
            queue.push({ dir: fullPath, depth: current.depth + 1 });
          }
        } else {
          // File matching check
          const lowerName = name.toLowerCase();
          const matchesQuery = queryTokens.length === 0 || queryTokens.every(t => lowerName.includes(t));
          if (!matchesQuery) continue;

          const extIndex = name.lastIndexOf('.');
          const ext = extIndex === -1 ? '' : name.slice(extIndex).toLowerCase();
          const mediaType = this.getMediaType(ext);

          if (mediaFilter !== 'all') {
            if (mediaFilter === 'starred' && !starredSet.has(fullPath)) continue;
            if (mediaFilter !== 'starred' && mediaType !== mediaFilter) continue;
          }

          // Calculate relative path from root
          let relativePath = '';
          if (fullPath.startsWith(cleanRoot)) {
            relativePath = fullPath.slice(cleanRoot.length);
            if (relativePath.startsWith('\\') || relativePath.startsWith('/')) {
              relativePath = relativePath.slice(1);
            }
          }

          const item: FileItem = {
            name,
            path: fullPath,
            isDirectory: false,
            size: 0,
            sizeFormatted: '',
            modifiedTime: Date.now(),
            modifiedDateFormatted: '',
            extension: ext,
            mediaType,
            isStarred: starredSet.has(fullPath),
            labelColor: labelsMap[fullPath],
            relativePath
          };

          results.push(item);
          pendingBatch.push(item);

          if (pendingBatch.length >= BATCH_SIZE) {
            flushBatch();
          }
        }
      }
    }

    flushBatch();
    return results;
  }

  private fastNodeScan(fs: any, path: any, dirPath: string, starredSet: Set<string>, labelsMap: Record<string, string>): Promise<FileItem[] | null> {
    return new Promise((resolve) => {
      fs.readdir(dirPath, (err: any, files: string[]) => {
        if (err || !files) return resolve(null);

        const items: FileItem[] = [];

        for (let i = 0; i < files.length; i++) {
          const name = files[i];
          if (
            !name || 
            name.startsWith('.') || 
            name.startsWith('._') || 
            name.startsWith('$') || 
            name.endsWith('.pek') || 
            name.endsWith('.cfa') || 
            name === 'Thumbs.db' || 
            name === 'desktop.ini' ||
            name === '.DS_Store'
          ) {
            continue;
          }

          const fullPath = path.join(dirPath, name);
          const extIndex = name.lastIndexOf('.');
          const isDir = extIndex === -1;
          const ext = isDir ? '' : name.slice(extIndex).toLowerCase();
          const mediaType: MediaType = isDir ? 'folder' : this.getMediaType(ext);

          const item: FileItem = {
            name,
            path: fullPath,
            isDirectory: isDir,
            size: 0,
            sizeFormatted: isDir ? '--' : '',
            modifiedTime: Date.now(),
            modifiedDateFormatted: '',
            extension: ext,
            mediaType,
            isStarred: starredSet.has(fullPath),
            labelColor: labelsMap[fullPath]
          };

          items.push(item);
        }

        resolve(items);

        setTimeout(() => {
          this.hydrateFileStatsAsync(fs, items.slice(0, 120));
        }, 30);
      });
    });
  }

  private async hydrateFileStatsAsync(fs: any, items: FileItem[]) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.isDirectory) {
        fs.stat(item.path, (err: any, stats: any) => {
          if (!err && stats) {
            item.size = stats.size;
            item.sizeFormatted = this.formatBytes(stats.size);
            item.modifiedTime = stats.mtimeMs;
            item.modifiedDateFormatted = new Date(stats.mtimeMs).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });
          }
        });
      }
    }
  }

  public generateVideoThumbnail(videoPath: string): Promise<string | null> {
    if (this.thumbCache.has(videoPath)) {
      return Promise.resolve(this.thumbCache.get(videoPath)!);
    }

    return new Promise((resolve) => {
      this.ffmpegQueue.push({ videoPath, resolve });
      this.processFfmpegQueue();
    });
  }

  private async processFfmpegQueue() {
    if (this.isProcessingQueue || this.ffmpegQueue.length === 0) return;
    this.isProcessingQueue = true;

    const task = this.ffmpegQueue.shift();
    if (!task) {
      this.isProcessingQueue = false;
      return;
    }

    const { videoPath, resolve } = task;
    const nodeMods = this.getNodeModules();

    if (!nodeMods || !nodeMods.child_process || !nodeMods.fs || !nodeMods.path || !this.tempThumbDir) {
      resolve(null);
      this.isProcessingQueue = false;
      this.processFfmpegQueue();
      return;
    }

    try {
      let hash = 0;
      for (let i = 0; i < videoPath.length; i++) {
        hash = ((hash << 5) - hash) + videoPath.charCodeAt(i);
        hash |= 0;
      }
      const outFileName = `thumb_${Math.abs(hash)}.jpg`;
      const outPath = nodeMods.path.join(this.tempThumbDir, outFileName);

      if (nodeMods.fs.existsSync(outPath)) {
        const url = this.getFileUrl(outPath);
        this.thumbCache.set(videoPath, url);
        resolve(url);
        this.isProcessingQueue = false;
        this.processFfmpegQueue();
        return;
      }

      const ffmpeg = this.getFfmpegPath();
      const cleanVideo = this.normalizePath(videoPath);
      const outPattern = outPath.replace(/\.jpg$/, '_%d.jpg');
      const cmd = `"${ffmpeg}" -y -i "${cleanVideo}" -vf "fps=2,scale=240:-1:flags=fast_bilinear" -vframes 5 "${outPattern}"`;

      nodeMods.child_process.exec(cmd, { timeout: 4000 }, (err: any) => {
        const firstFrame = outPath.replace(/\.jpg$/, '_1.jpg');
        if (!err && nodeMods.fs.existsSync(firstFrame)) {
          try {
            nodeMods.fs.copyFileSync(firstFrame, outPath);
          } catch (e) {
            console.error('Failed to copy first frame:', e);
          }
        }

        if (nodeMods.fs.existsSync(outPath) && nodeMods.fs.existsSync(firstFrame)) {
          const url = this.getFileUrl(outPath);
          this.thumbCache.set(videoPath, url);
          resolve(url);
        } else {
          // Fallback to extract at least one frame if fps=2 failed (for ultra-short videos)
          const fallbackCmd = `"${ffmpeg}" -y -ss 00:00:00 -i "${cleanVideo}" -vframes 1 -vf "scale=240:-1:flags=fast_bilinear" -q:v 5 "${outPath}"`;
          nodeMods.child_process.exec(fallbackCmd, { timeout: 2000 }, (fallbackErr: any) => {
            if (!fallbackErr && nodeMods.fs.existsSync(outPath)) {
              // Copy to _1.jpg as well for consistency
              try {
                nodeMods.fs.copyFileSync(outPath, firstFrame);
              } catch {}
              const url = this.getFileUrl(outPath);
              this.thumbCache.set(videoPath, url);
              resolve(url);
            } else {
              resolve(null);
            }
          });
        }
        this.isProcessingQueue = false;
        setTimeout(() => this.processFfmpegQueue(), 20);
      });
    } catch {
      resolve(null);
      this.isProcessingQueue = false;
      this.processFfmpegQueue();
    }
  }

  public async extractMogrtThumb(mogrtPath: string): Promise<string | null> {
    if (this.thumbCache.has(mogrtPath)) {
      return this.thumbCache.get(mogrtPath)!;
    }

    const nodeMods = this.getNodeModules();
    if (!nodeMods || !nodeMods.fs) return null;

    try {
      const buffer = nodeMods.fs.readFileSync(mogrtPath);
      const zip = await JSZip.loadAsync(buffer);
      
      let thumbFile = zip.file('thumb.png') || zip.file('thumbnail.png') || zip.file('preview.png');
      if (!thumbFile) {
        const found = Object.keys(zip.files).find(k => k.toLowerCase().endsWith('.png') || k.toLowerCase().endsWith('.jpg'));
        if (found) thumbFile = zip.file(found);
      }

      if (thumbFile) {
        const base64Data = await thumbFile.async('base64');
        const dataUrl = `data:image/png;base64,${base64Data}`;
        this.thumbCache.set(mogrtPath, dataUrl);
        return dataUrl;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  private fastCepScan(dirPath: string, starredSet: Set<string>, labelsMap: Record<string, string>): FileItem[] | null {
    const cepFs = window.cep.fs;
    const res = cepFs.readdir(dirPath);
    if (res.err !== 0 || !Array.isArray(res.data)) return null;

    const isMac = this.isMac();
    const sep = isMac ? '/' : '\\';
    const items: FileItem[] = [];

    for (const name of res.data) {
      if (!name || name.startsWith('.') || name.startsWith('._') || name.startsWith('$') || name === 'Thumbs.db' || name === '.DS_Store') continue;
      const fullPath = dirPath.endsWith(sep) ? dirPath + name : dirPath + sep + name;
      const isDir = !name.includes('.');
      const ext = isDir ? '' : (name.lastIndexOf('.') > -1 ? name.slice(name.lastIndexOf('.')).toLowerCase() : '');
      const mediaType: MediaType = isDir ? 'folder' : this.getMediaType(ext);

      items.push({
        name,
        path: fullPath,
        isDirectory: isDir,
        size: 0,
        sizeFormatted: isDir ? '--' : '',
        modifiedTime: Date.now(),
        modifiedDateFormatted: '',
        extension: ext,
        mediaType,
        isStarred: starredSet.has(fullPath),
        labelColor: labelsMap[fullPath]
      });
    }
    return items;
  }

  private async listWithExtendScript(dirPath: string, starredSet: Set<string>, labelsMap: Record<string, string>): Promise<FileItem[] | null> {
    try {
      const resStr = await premiereService.evalScript(`getFilesInFolder("${dirPath.replace(/\\/g, '/')}")`);
      if (!resStr) return null;
      const arr = typeof resStr === 'string' ? JSON.parse(resStr) : resStr;
      if (!Array.isArray(arr)) return null;

      return arr.map((f: any) => {
        const ext = f.isDir ? '' : (f.name.lastIndexOf('.') > -1 ? f.name.slice(f.name.lastIndexOf('.')).toLowerCase() : '');
        return {
          name: f.name,
          path: f.fsName,
          isDirectory: f.isDir,
          size: f.length || 0,
          sizeFormatted: f.isDir ? '--' : this.formatBytes(f.length || 0),
          modifiedTime: Date.now(),
          modifiedDateFormatted: '',
          extension: ext,
          mediaType: f.isDir ? 'folder' : this.getMediaType(ext),
          isStarred: starredSet.has(f.fsName),
          labelColor: labelsMap[f.fsName]
        };
      });
    } catch {
      return null;
    }
  }

  public getStarredPaths(): Set<string> {
    try {
      const saved = localStorage.getItem('filebrowser_starred_items');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  }

  public toggleStar(filePath: string): boolean {
    const set = this.getStarredPaths();
    const isStarred = set.has(filePath);
    if (isStarred) {
      set.delete(filePath);
    } else {
      set.add(filePath);
    }
    localStorage.setItem('filebrowser_starred_items', JSON.stringify(Array.from(set)));
    return !isStarred;
  }

  public async getStarredFileItems(): Promise<FileItem[]> {
    const paths = Array.from(this.getStarredPaths());
    const labelsMap = this.getLabelsMap();
    const nodeMods = this.getNodeModules();
    const isMac = this.isMac();
    const items: FileItem[] = [];

    for (const p of paths) {
      const clean = this.normalizePath(p);
      const name = isMac ? (clean.split('/').pop() || clean) : (clean.split('\\').pop() || clean);
      let isDir = false;
      let size = 0;
      let ext = '';

      if (nodeMods && nodeMods.fs) {
        try {
          if (!nodeMods.fs.existsSync(clean)) continue;
          const stats = nodeMods.fs.statSync(clean);
          isDir = stats.isDirectory();
          size = stats.size;
        } catch {
          // ignore
        }
      }
      ext = isDir ? '' : (name.lastIndexOf('.') > -1 ? name.slice(name.lastIndexOf('.')).toLowerCase() : '');
      const mediaType: MediaType = isDir ? 'folder' : this.getMediaType(ext);

      const item: FileItem = {
        name,
        path: clean,
        isDirectory: isDir,
        size,
        sizeFormatted: isDir ? '--' : this.formatBytes(size),
        modifiedTime: Date.now(),
        modifiedDateFormatted: 'Favorito',
        extension: ext,
        mediaType,
        isStarred: true,
        labelColor: labelsMap[clean]
      };

      items.push(item);
    }

    return items;
  }

  public openFolderPicker(initialPath?: string): Promise<string | null> {
    return new Promise((resolve) => {
      const defaultStart = initialPath || this.getDownloadsPath();
      if (typeof window !== 'undefined' && window.cep && window.cep.fs && window.cep.fs.showOpenDialogEx) {
        const result = window.cep.fs.showOpenDialogEx(
          false,
          true,
          'Selecionar Pasta',
          defaultStart,
          []
        );
        if (result.err === 0 && result.data && result.data.length > 0) {
          return resolve(this.normalizePath(result.data[0]));
        }
      }
      const fallback = prompt('Digite o caminho da pasta:', defaultStart);
      resolve(fallback ? this.normalizePath(fallback) : null);
    });
  }

  public revealInExplorer(filePath: string) {
    const nodeMods = this.getNodeModules();
    if (nodeMods && nodeMods.child_process) {
      try {
        const clean = this.normalizePath(filePath);
        if (this.isMac()) {
          nodeMods.child_process.exec(`open -R "${clean}"`);
        } else {
          nodeMods.child_process.exec(`explorer.exe /select,"${clean}"`);
        }
      } catch (e) {
        console.error('Failed to reveal file:', e);
      }
    }
  }

  public getFileUrl(filePath: string): string {
    const clean = filePath.replace(/\\/g, '/');
    if (this.isMac()) {
      return clean.startsWith('/') ? 'file://' + clean : 'file:///' + clean;
    } else {
      return clean.startsWith('/') ? 'file://' + clean : 'file:///' + clean;
    }
  }

  private getMockFiles(dirPath: string, starredSet: Set<string>, labelsMap: Record<string, string>): FileItem[] {
    return [];
  }
}

export const fileSystemService = new FileSystemService();
