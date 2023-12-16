export type AppStoreCredentials = {
  issuerId: string;
  keyId: string;
  authKey: string;
};

interface AppStoreVersionRelationshipLinks {
  self: string;
  related: string;
}

interface AppStoreVersionRelationships {
  ageRatingDeclaration: { links: AppStoreVersionRelationshipLinks };
  appStoreVersionLocalizations: { links: AppStoreVersionRelationshipLinks };
  build: { links: AppStoreVersionRelationshipLinks };
  appStoreVersionPhasedRelease: { links: AppStoreVersionRelationshipLinks };
  gameCenterAppVersion: { links: AppStoreVersionRelationshipLinks };
  routingAppCoverage: { links: AppStoreVersionRelationshipLinks };
  appStoreReviewDetail: { links: AppStoreVersionRelationshipLinks };
  appStoreVersionSubmission: { links: AppStoreVersionRelationshipLinks };
  idfaDeclaration: { links: AppStoreVersionRelationshipLinks };
  appClipDefaultExperience: { links: AppStoreVersionRelationshipLinks };
  appStoreVersionExperiments: { links: AppStoreVersionRelationshipLinks };
  appStoreVersionExperimentsV2: { links: AppStoreVersionRelationshipLinks };
  customerReviews: { links: AppStoreVersionRelationshipLinks };
}

interface AppStoreVersionAttributes {
  platform: string;
  versionString: string;
  appStoreState: string;
  copyright: null | string;
  releaseType: string;
  earliestReleaseDate: null | string;
  usesIdfa: null | string;
  downloadable: boolean;
  createdDate: string;
}

interface Links {
  links: {
    self?: string;
    related?: string;
  };
}

interface BuildAttributes {
  version: string;
  uploadedDate: string;
  expirationDate: string;
  expired: boolean;
  minOsVersion: string;
  lsMinimumSystemVersion: string | null;
  computedMinMacOsVersion: string;
  computedMinVisionOsVersion: string;
  iconAssetToken: {
    templateUrl: string;
    width: number;
    height: number;
  };
  processingState: string;
  buildAudienceType: string;
  usesNonExemptEncryption: boolean;
}

interface BuildRelationships {
  preReleaseVersion: Links;
  individualTesters: Links;
  betaGroups: Links;
  betaBuildLocalizations: Links;
  appEncryptionDeclaration: Links;
  betaAppReviewSubmission: Links;
  app: Links;
  buildBetaDetail: Links;
  appStoreVersion: Links;
  icons: Links;
  perfPowerMetrics: Links;
  diagnosticSignatures: Links;
}

export interface AppStoreVersion {
  type: string;
  id: string;
  attributes: AppStoreVersionAttributes;
  relationships: AppStoreVersionRelationships;
  links: Links;
}

export interface AppStoreVersionLocalization {
  type: string;
  id: string;
  attributes: {
    description: string | null;
    locale: string;
    keywords: string[] | null;
    marketingUrl: string | null;
    promotionalText: string | null;
    supportUrl: string | null;
    whatsNew: string | null;
  };
  relationships: {
    appScreenshotSets: unknown;
    appPreviewSets: unknown;
  };
  links: Links;
}

export interface Build {
  type: 'builds';
  id: string;
  attributes: BuildAttributes;
  relationships: BuildRelationships;
  links: {
    self: string;
  };
}

export type IOSReleaseParameters = {
  key: string;
  appId: string;
  version: string;
  build: string;
  addToAppReview: string;
  pathToReleaseText: string;
};
