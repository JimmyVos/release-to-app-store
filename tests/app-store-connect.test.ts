import { describe, it, expect } from '@jest/globals';
import { runNpxCommand } from './utils/utils';

import { appStoreApi } from '../src/app-store/app-store-connect-api';

const { IOS_KEY, IOS_APP_ID, IOS_VERSION, IOS_BUILD_NUMBER } = process.env;

describe('should connect to Google Play Store', () => {
  it('should have the correct environment variables', () => {
    const env = [IOS_KEY, IOS_APP_ID, IOS_VERSION, IOS_BUILD_NUMBER];
    for (const environmentVariable of env) {
      expect(typeof environmentVariable).toBe('string');
    }
  });
  it('should generate a base64 key', () => {
    const base64TestKey = runNpxCommand(
      `npx release-to-app-store ios-key --issuerId test --keyId test --authKey test`
    );
    expect(base64TestKey).toBe(
      'eyJpc3N1ZXJJZCI6InRlc3QiLCJrZXlJZCI6InRlc3QiLCJhdXRoS2V5IjoidGVzdCJ9'
    );
  });
  it('should make an new release', async () => {
    runNpxCommand(
      `npx release-to-app-store make-ios-release --key ${IOS_KEY} --appId ${IOS_APP_ID} --version ${IOS_VERSION} --build ${IOS_BUILD_NUMBER} --pathToReleaseText tests/utils/updateText.json`
    );
    const appStore = appStoreApi(IOS_KEY || '');
    const versions = await appStore.getAppStoreVersions({ appId: IOS_APP_ID as string });
    expect(versions[0].attributes.versionString).toBe(IOS_VERSION);
  });
});
