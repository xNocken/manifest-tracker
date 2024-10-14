export interface DownloadInfo {
  platforms: string[];
  namespace: string;
  catalogItemId: string;
  appName: string;
  label: string;
}

export const downloadInfos: DownloadInfo[] = [
  {
    platforms: ['Windows'],
    namespace: 'fn',
    catalogItemId: '4fe75bbc5a674f4f9b356b5c90567da5',
    appName: 'Fortnite',
    label: 'Live',
  },
  {
    platforms: ['Windows'],
    namespace: 'fn',
    catalogItemId: '5cb97847cee34581afdbc445400e2f77',
    appName: 'FortniteContentBuilds',
    label: 'Live',
  },
  // {
  //   platforms: ['Windows'],
  //   namespace: 'fn',
  //   catalogItemId: '1e8bda5cfbb641b9a9aea8bd62285f73',
  //   appName: 'Fortnite_Studio',
  //   label: 'Live',
  // },
];
