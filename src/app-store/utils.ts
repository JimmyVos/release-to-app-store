import jwt from 'jsonwebtoken';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AppStoreCredentials, AppStoreVersion, AppStoreVersionLocalization, Build } from './types';
import { decodeKey } from '../utils';

const baseURL = `https://api.appstoreconnect.apple.com/v1/`;

const getBearerToken = (credentials: AppStoreCredentials): string => {
  const now = Math.round(new Date().getTime() / 1000);

  const payload = {
    iss: credentials.issuerId,
    exp: now + 1200,
    aud: 'appstoreconnect-v1'
  };

  const SIGN_OPTS = {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: credentials.keyId,
      typ: 'JWT'
    }
  };

  return jwt.sign(payload, credentials.authKey, SIGN_OPTS);
};

export const appStoreApiUtils = (
  key: string
): {
  getAppStoreVersions: ({ appId }: { appId: string }) => Promise<AppStoreVersion[]>;
  instance: AxiosInstance;
  createAppStoreVersion: (
    appId: string,
    attributes: Partial<AppStoreVersion['attributes']>
  ) => Promise<AppStoreVersion>;
  updateAppStoreVersion: (
    version: AppStoreVersion,
    attributes: Partial<AppStoreVersion['attributes']>
  ) => Promise<AppStoreVersion>;
  getBuilds: ({ appId, version }: { appId: string; version: string }) => Promise<Build[]>;
  addBuildToRelease: (version: AppStoreVersion, buildId: string) => Promise<AppStoreVersion>;
  addToAppReview: (version: AppStoreVersion) => Promise<void>;
  updateWhatsNewText: (
    version: AppStoreVersion,
    whatsNewText: Record<string, string>
  ) => Promise<void>;
} => {
  const credentials = decodeKey(key) as AppStoreCredentials;

  const instance = axios.create({
    baseURL,
    timeout: 20 * 1000, //20 sec
    headers: {
      'Content-Type': 'application/json',
      crawlAllPages: false,
      inclusions: 'tree'
    }
  });

  instance.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${getBearerToken(credentials)}`;
    return config;
  });

  // try-again, sometimes Apple rejects perfectly good bearer tokens
  let retry = 0;

  instance.interceptors.response.use(
    response => {
      retry = 0;
      return response;
    },
    async error => {
      const originalRequest = error.config;
      retry++;
      if (retry < 5 && error.response.status === 401) {
        originalRequest.headers.Authorization = `Bearer ${getBearerToken(credentials)}`;
        return instance(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  return {
    getAppStoreVersions: async ({ appId }): Promise<AppStoreVersion[]> => {
      return (await instance.get(`apps/${appId}/appStoreVersions`)).data.data;
    },
    instance,
    createAppStoreVersion: async (
      appId: string,
      attributes: Partial<AppStoreVersion['attributes']>
    ): Promise<AppStoreVersion> => {
      return (
        await instance.post('appStoreVersions', {
          attributes: { platform: 'IOS', ...attributes },
          relationships: { app: { data: { type: 'apps', id: appId } } }
        })
      ).data.data;
    },
    updateAppStoreVersion: async (
      version: AppStoreVersion,
      attributes: Partial<AppStoreVersion['attributes']>
    ): Promise<AppStoreVersion> => {
      return (
        await instance.patch(`${version.type}/${version.id}`, {
          data: { type: version.type, id: version.id, attributes }
        })
      ).data.data;
    },

    getBuilds: async ({ appId, version }: { appId: string; version: string }): Promise<Build[]> => {
      return (
        await instance.get(
          `builds?filter[app]=${appId}&filter[preReleaseVersion.version]=${version}`
        )
      ).data.data;
    },

    addBuildToRelease: async (
      version: AppStoreVersion,
      buildId: string
    ): Promise<AppStoreVersion> => {
      return await instance.patch(`appStoreVersions/${version.id}/relationships/build`, {
        data: { type: 'builds', id: buildId }
      });
    },

    addToAppReview: async (version: AppStoreVersion): Promise<void> => {
      return await instance.post('appStoreVersionSubmissions', {
        type: 'appStoreVersionSubmissions',
        relationships: {
          appStoreVersion: {
            data: { type: 'appStoreVersions', id: version.id }
          }
        }
      });
    },
    updateWhatsNewText: async (
      version: AppStoreVersion,
      whatsNewText: Record<string, string>
    ): Promise<void> => {
      const versionLocalizations: Array<AppStoreVersionLocalization> = (
        await instance.get(`appStoreVersions/${version.id}/appStoreVersionLocalizations`)
      ).data.data;

      const getRequests = (
        key: 'whatsNew' | 'description'
      ): Promise<AxiosResponse<unknown, unknown>>[] => {
        const newLocalizationsData = Object.entries(whatsNewText).map(([locale, text]) => ({
          type: 'appStoreVersionLocalizations',
          attributes: { locale, [key]: text }
        }));

        return newLocalizationsData.map(data => {
          const localization = versionLocalizations.find(
            versionLocalization => versionLocalization.attributes.locale === data.attributes.locale
          );

          //update localization
          if (localization) {
            return instance.patch(`${localization.type}/${localization.id}`, {
              data: {
                id: localization.id,
                type: localization.type,
                attributes: { [key]: data.attributes[key] }
              }
            });
          }

          //make new localization
          return instance.post(`appStoreVersionLocalizations`, {
            data: {
              type: 'appStoreVersionLocalizations',
              attributes: data.attributes,
              relationships: {
                appStoreVersion: {
                  data: {
                    type: version.type,
                    id: version.id
                  }
                }
              }
            }
          });
        });
      };
      const requests = await getRequests('whatsNew');

      try {
        await Promise.all(requests);
      } catch (error) {
        if (error.response.status === 409) {
          // if this is the first version
          const requestsForDescription = await getRequests('description');
          await Promise.all(requestsForDescription);
          return;
        }
      }
    }
  };
};
