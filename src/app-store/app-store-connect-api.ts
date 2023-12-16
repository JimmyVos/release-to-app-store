import { AppStoreVersion, IOSReleaseParameters } from './types';
import { appStoreApiUtils } from './utils';
import { readJSONFile } from '../utils';

export const appStoreApi = (
  key: string
): {
  getAppStoreVersions: ({ appId }: { appId: string }) => Promise<AppStoreVersion[]>;
  makeRelease: (parameters: IOSReleaseParameters) => Promise<void>;
} => {
  const appStore = appStoreApiUtils(key);
  return {
    getAppStoreVersions: appStore.getAppStoreVersions,
    makeRelease: async (parameters: IOSReleaseParameters): Promise<void> => {
      const appStoreVersions = await appStore.getAppStoreVersions({ appId: parameters.appId });
      const currentVersion = appStoreVersions.find(version =>
        ['PREPARE_FOR_SUBMISSION', 'REJECTED', 'DEVELOPER_REJECTED'].includes(
          version.attributes.appStoreState
        )
      );

      let version: AppStoreVersion;

      if (currentVersion) {
        version = await appStore.updateAppStoreVersion(currentVersion, {
          versionString: parameters.version
        });
      } else {
        version = await appStore.createAppStoreVersion(parameters.appId, {
          versionString: parameters.version
        });
      }

      const builds = await appStore.getBuilds({
        appId: parameters.appId,
        version: parameters.version
      });

      const buildId = builds.find(build => build.attributes.version === parameters.build).id;
      await appStore.addBuildToRelease(version, buildId);

      if (parameters.pathToReleaseText) {
        const whatsNewText = await readJSONFile(parameters.pathToReleaseText);
        await appStore.updateWhatsNewText(version, whatsNewText);
      }

      //test this out on a relase
      if (parameters.addToAppReview === 'true') {
        await appStore.addToAppReview(version);
      }
    }
  };
};
