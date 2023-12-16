import { AndroidReleaseParameters, GooglePlayKey } from './types';
import { decodeKey, readJSONFile } from '../utils';
import { androidpublisher_v3, google } from 'googleapis';
import { GaxiosPromise } from 'googleapis/build/src/apis/androidpublisher';

const baseURL = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/`;

export const googlePlayApi = async (
  key: string
): Promise<{
  makeRelease: (parameters: AndroidReleaseParameters) => Promise<void>;
  getReleases: (appId: string) => GaxiosPromise<androidpublisher_v3.Schema$TracksListResponse>;
}> => {
  const credentials = decodeKey(key) as GooglePlayKey;
  const publisher = google.androidpublisher('v3');

  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/androidpublisher'],
    null,
    credentials.private_key_id
  );

  await jwtClient.authorize(error => {
    if (error) {
      console.log(error);
    }
  });

  google.options({ auth: jwtClient });

  return {
    makeRelease: async (parameters: AndroidReleaseParameters): Promise<void> => {
      const edit = await jwtClient.request<{ id: string }>({
        url: `${baseURL}${parameters.appId}/edits`,
        method: 'POST'
      });
      const editId = edit.data.id;

      let releaseNotes = [];

      if (parameters.pathToReleaseText) {
        const whatsNewText = await readJSONFile(parameters.pathToReleaseText);
        releaseNotes = Object.entries(whatsNewText).map(([key, value]) => ({
          language: key,
          text: value
        }));
      }

      await publisher.edits.tracks.patch({
        editId: editId,
        packageName: parameters.appId,
        track: 'production',
        requestBody: {
          releases: [
            {
              name: parameters.version,
              versionCodes: [parameters.build],
              status: 'draft',
              releaseNotes
            }
          ],
          track: 'production'
        }
      });

      await publisher.edits.commit({
        editId: editId,
        packageName: parameters.appId
      });
    },
    getReleases: async (
      appId: string
    ): GaxiosPromise<androidpublisher_v3.Schema$TracksListResponse> => {
      const edit = await jwtClient.request<{ id: string }>({
        url: `${baseURL}${appId}/edits`,
        method: 'POST'
      });
      const editId = edit.data.id;

      return publisher.edits.tracks.list({ packageName: appId, editId });
    }
  };
};
