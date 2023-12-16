# Release-to-App-Store

The `release-to-app-store` npm package streamlines the process of releasing mobile applications by leveraging the [App Store Connect API](https://developer.apple.com/app-store-connect/api/) and [Google Play Developer API](https://developers.google.com/android-publisher)

<a href="https://www.npmjs.com/package/release-to-app-store">
<img src="https://img.shields.io/npm/v/release-to-app-store?color=brightgreen&label=npm%20package" alt="Current npm package version." />
</a>

## Installation

Install `release-to-app-store` globally using npm, yarn, or pnpm.

```sh
# npm
npm install -g release-to-app-store

# yarn
yarn global add release-to-app-store

# pnpm
pnpm add -g release-to-app-store
```

## Configuration - Setting up API Keys

Before using the commands, make sure to set up the API keys required for authentication. Follow the steps below to configure the necessary keys:

### App Store Connect

To interact with App Store Connect, follow these steps:

1. Obtain the necessary keys - `issuerId`, `keyId`, and `authKey` from [App Store Connect](https://appstoreconnect.apple.com/access/api).
2. Use the `ios-key` command to generate the encoded key.

```bash
authKey="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBfGByqGSMa9AgEGCCqGSM49AwEHBHkwdwIBAgQgNlGT+sd2rq2T9QCNzrr
9h4VCc39kBl7gSf7vb44ZoudCYOgCgYIKoZIzj0DAQehRANCAASVKiEnISk7Nb8K
-----END PRIVATE KEY-----"

#set you key
iosKey=$(npx release-to-app-store ios-key --issuerId 89a6de7b-ef0e-4ge3-e053-5bfac7c11a4d1 --keyId UCK38SDNK --authKey $authKey)

#make an relase and add it to review
npx release-to-app-store make-ios-release --key $iosKey --appId 1586363601 --version 1.0.0 --buildNumber 1 --addToAppReview true
```

### Google Play

To interact with Google Play, follow these steps:

1. Visit the Google Play Console and [create an API key](https://help.radio.co/en/articles/6232140-how-to-get-your-google-play-json-key).
2. Save your Google Play key as a JSON file.
3. Use the `--path` option with the `android-key` command to specify the path to your Google Play key file.

```bash
#set you key
androidKey=$(npx release-to-app-store android-key --path ./google-play-key.json)

#make an relase
npx release-to-app-store make-android-release --key $androidKey --appId test.my.app --version 1.0.0 --buildNumber 1
```

## Available Commands

### `make-ios-release`

#### Options

- `-k, --key <key>`: Key for authentication.
- `-a, --appId <appId>`: App ID.
- `-v, --version <version>`: Version.
- `-b, --build <build>`: Build number.
- `-p, --pathToReleaseText <pathToReleaseText>`
- `-r, --addToAppReview <addToAppReview>`: Add to app review.

### `make-android-release`

#### Options

- `-k, --key <key>`: Key for authentication.
- `-a, --appId <appId>`: App ID.
- `-v, --version <version>`: Version.
- `-b, --build <build>`: Build number.
- `-p, --pathToReleaseText <pathToReleaseText>`

## Example Release Text

example for the `pathToReleaseText` </br>
releaseText.json

```
{
  "en-US": "Bug fixes and enhancements.",
  "nl-NL": "Bug fixes en verbeteringen.",
  "fr-FR": "Corrections de bugs et améliorations.",
  "de-DE": "Fehlerbehebungen und Verbesserungen.",
  "es-ES": "Corrección de errores y mejoras."
}
```

This project is licensed under the MIT License.
