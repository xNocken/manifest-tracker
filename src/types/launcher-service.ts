export interface LauncherAssetData {
  elements: LauncherAssetElement[]
}

export interface LauncherAssetElement {
  appName: string
  labelName: string
  buildVersion: string
  hash: string
  useSignedUrl: boolean
  metadata: Record<string, unknown>
  manifests: Manifest[]
}

export interface Manifest {
  uri: string
  queryParams: QueryParam[]
}

export interface QueryParam {
  name: string
  value: string
}
