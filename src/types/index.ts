export type MediaType = 'video' | 'audio' | 'image' | 'mogrt' | 'font' | 'project' | 'folder' | 'other';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  sizeFormatted: string;
  modifiedTime: number;
  modifiedDateFormatted: string;
  extension: string;
  mediaType: MediaType;
  thumbnailUrl?: string;
  isStarred?: boolean;
  labelColor?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  path: string;
  type: 'local_drive' | 'cloud_drive';
}

export interface CustomLibrary {
  id: string;
  name: string;
  path: string;
  icon: string;
  color?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type MediaFilter = 'all' | 'starred' | 'video' | 'audio' | 'image' | 'mogrt' | 'font';
export type ThemeMode = 'dark' | 'light';

export interface ContextMenuState {
  x: number;
  y: number;
  item: FileItem;
}
