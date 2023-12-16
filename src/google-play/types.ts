export type GooglePlayKey = {
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
};

export type AndroidReleaseParameters = {
  key: string;
  appId: string;
  version: string;
  build: string;
  pathToReleaseText: string;
};