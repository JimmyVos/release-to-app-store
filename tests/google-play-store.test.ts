import { describe, it, expect } from '@jest/globals';
import { runNpxCommand } from './utils/utils';
import { googlePlayApi } from '../src/google-play/google-play-api';

const { ANDROID_APP_ID, ANDROID_VERSION, ANDROID_BUILD_NUMBER, ANDROID_KEY } = process.env;

describe('should connect to Google Play Store', () => {
  it('should have the correct environment variables', () => {
    const env = [ANDROID_APP_ID, ANDROID_VERSION, ANDROID_BUILD_NUMBER, ANDROID_KEY];
    for (const environmentVariable of env) {
      expect(typeof environmentVariable).toBe('string');
    }
  });

  it('should generate a base64 key', () => {
    const base64TestKey = runNpxCommand(
      `npx release-to-app-store android-key --path tests/utils/google-play-key.json`
    );
    expect(base64TestKey).toBe(
      'eyJ0eXBlIjoiIiwicHJvamVjdF9pZCI6IiIsInByaXZhdGVfa2V5X2lkIjoiIiwicHJpdmF0ZV9rZXkiOiIiLCJjbGllbnRfZW1haWwiOiIiLCJjbGllbnRfaWQiOiIiLCJhdXRoX3VyaSI6IiIsInRva2VuX3VyaSI6IiIsImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6IiIsImNsaWVudF94NTA5X2NlcnRfdXJsIjoiIn0='
    );
  });

  it('should make an new release', async () => {
    runNpxCommand(
      `npx release-to-app-store make-android-release --key ${ANDROID_KEY} --appId ${ANDROID_APP_ID} --version ${ANDROID_VERSION} --build ${ANDROID_BUILD_NUMBER} --pathToReleaseText tests/utils/updateText.json`
    );

    const googlePlay = await googlePlayApi(ANDROID_KEY || '');
    const releases = await googlePlay.getReleases(ANDROID_APP_ID as string);

    const productiontrack = releases.data.tracks?.find(({ track }) => track === 'production');
    expect(productiontrack?.releases?.[0].name).toBe(ANDROID_VERSION);
  });
});
