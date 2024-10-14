import path from 'path';
import type { AuthData } from '../types/account-service.js';
import { LauncherAssetData } from '../types/launcher-service.js';

export default async (auth: AuthData, platform: string, namespace: string, catalogItemId: string, appName: string, label: string) => {
  const res = await fetch(
    `https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/public/assets/v2/platform/${platform}/namespace/${namespace}/catalogItem/${catalogItemId}/app/${appName}/label/${label}`,
    {
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
      },
    },
  );

  const contentType = res.headers.get('content-type');
  const debugId = `${namespace}:${catalogItemId}:${appName}:${platform}:${label}`;

  if (!res.ok || !contentType?.startsWith('application/json')) {
    console.log(`failed fetching manifest for ${debugId}`, res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <LauncherAssetData>(await res.json());
  const element = data?.elements?.[0];

  if (!element) {
    console.log(`failed to find asset element for ${debugId}`, res.status, res.statusText, data);

    return {
      success: false as const,
    };
  }

  const manifestEntry = element.manifests.find((e) => e.uri.includes('akamaized.net')) || element.manifests[0];

  if (!manifestEntry) {
    console.log(`failed to find manifest entry for ${debugId}`, res.status, res.statusText, element);

    return {
      success: false as const,
    };
  }

  const manifestId = path.parse(manifestEntry.uri).name;

  if (manifestId === 'fake') {
    console.log(`server responded with fake manifest for ${debugId}`, res.status, res.statusText, element);

    return {
      success: false as const,
    };
  }

  const manifestUrl = `${manifestEntry.uri}?${manifestEntry.queryParams.map((x) => `${x.name}=${x.value}`).join('&')}`;
  const manifestResponse = await fetch(manifestUrl);

  if (!manifestResponse.ok) {
    console.log(`failed to download manifest for ${debugId}`, res.status, res.statusText, await manifestResponse.text());

    return {
      success: false as const,
    };
  }

  const manifestLastModified = manifestResponse.headers.get('last-modified');

  const meta = {
    appName: element.appName || null,
    labelName: element.labelName || null,
    buildVersion: element.buildVersion || null,
    hash: element.hash || null,
    manifest: {
      id: manifestId || null,
      lastModified: manifestLastModified && new Date(manifestLastModified) || null,
      source: new URL(manifestUrl).hostname || null,
    },
    metadata: Object.fromEntries(
      Object.entries(element.metadata || {})
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  };

  return {
    success: true as const,
    data: {
      meta,
      content: await manifestResponse.arrayBuffer(),
    },
  };
};
