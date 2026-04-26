export interface FileRecord {
  id: string
  name: string
  mimeType: string
  size: number | null
  md5Checksum: string | null
  createdTime: string
  modifiedTime: string
  owners: { displayName: string; emailAddress: string }[]
  parents: string[]
  webViewLink: string
  thumbnailLink: string | null
  fullFileExtension: string | null
  trashed: boolean
}

export type ConfidenceLevel = 'exact' | 'likely' | 'version'

export interface DuplicateGroup {
  key: string
  confidence: ConfidenceLevel
  files: FileRecord[]
  totalWastedBytes: number
  selectedForDeletion: Set<string>
  keepFileId: string | null
}

export interface ScanResult {
  totalFilesScanned: number
  excludedFiles: number
  duplicateGroups: DuplicateGroup[]
  scannedAt: Date
}
