import { execSync } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';

import env from './utils/env.js';
import getAuth from './utils/get-auth.js';
import killToken from './utils/kill-token.js';
import { downloadInfos } from './resources/launcher-assets.js';
import getManifest from './utils/get-manifest.js';

const outputFolder = 'output';
const appsFolder = `${outputFolder}/apps`;
const manifestsFolder = `${outputFolder}/manifests`;

const main = async () => {
  if (!fs.existsSync(manifestsFolder)) {
    await fsp.mkdir(manifestsFolder, { recursive: true });
  }

  const auth = await getAuth();
  const changes: string[] = [];

  for (let i = 0; i < downloadInfos.length; i += 1) {
    const downloadInfo = downloadInfos[i];

    for (let j = 0; j < downloadInfo.platforms.length; j += 1) {
      const platform = downloadInfo.platforms[j];
      const result = await getManifest(auth, platform, downloadInfo.namespace, downloadInfo.catalogItemId, downloadInfo.appName, downloadInfo.label);

      if (result.success) {
        const baseDir = `${appsFolder}/${downloadInfo.appName}/${platform}`;
        const baseFilePath = `${baseDir}/${result.data.meta.buildVersion}`;
        const metaFileName = `${baseFilePath}.json`;
        const manifestFileName = `${baseFilePath}.manifest`;

        if (!fs.existsSync(baseDir)) {
          await fsp.mkdir(baseDir, { recursive: true });
        }

        // already saved
        if (fs.existsSync(metaFileName)) {
          continue;
        }

        const bin = new Uint8Array(result.data.content);

        await fsp.writeFile(metaFileName, JSON.stringify(result.data.meta, null, 3));
        await fsp.writeFile(manifestFileName, bin);
        await fsp.writeFile(`${manifestsFolder}/${result.data.meta.manifest.id}.json`, JSON.stringify(result.data.meta, null, 3));
        await fsp.writeFile(`${manifestsFolder}/${result.data.meta.manifest.id}.manifest`, bin);

        changes.push(`${downloadInfo.appName}-${platform} ${result.data.meta.buildVersion}`);
      }
    }
  }

  await killToken(auth);

  if (!changes.length) {
    return;
  }

  const commitMessage = `Added ${changes.join(', ')}`

  console.log(commitMessage);

  if (env.GIT_DO_NOT_COMMIT?.toLowerCase() === 'true') {
    return;
  }

  execSync('git add output');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config commit.gpgsign false');
  execSync(`git commit -m "${commitMessage}"`);

  if (env.GIT_DO_NOT_PUSH?.toLowerCase() === 'true') {
    return;
  }

  execSync('git push');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
