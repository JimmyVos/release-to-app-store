#!/usr/bin/env node

import { Command } from 'commander';
import PKG from '../../package.json';

import { googlePlayApi } from '../google-play/google-play-api';
import { appStoreApi } from '../app-store/app-store-connect-api';
import { encodedKey, readJSONFile } from '../utils';

const program = new Command();

program.name(PKG.name).description(PKG.description).version(PKG.version);

program
  .command('android-key')
  .requiredOption('-p, --path <path>', 'path to google play key')
  .action(async ({ path }) => {
    const credentials = await readJSONFile(path);
    console.log(encodedKey(credentials));
  });

program
  .command('ios-key')
  .requiredOption('-i, --issuerId <issuerId>')
  .requiredOption('-k, --keyId <keyId>')
  .requiredOption('-a, --authKey <authKey>')
  .action(cmd => {
    console.log(encodedKey(cmd));
  });

program
  .command('make-ios-release')
  .requiredOption('-k, --key <key>')
  .requiredOption('-a, --appId <appId>')
  .requiredOption('-v, --version <version>')
  .requiredOption('-b, --build <build>')
  .option('-r, --addToAppReview <addToAppReview>')
  .requiredOption('-p, --pathToReleaseText <pathToReleaseText>')
  .action(async cmd => {
    const appStore = await appStoreApi(cmd.key);
    const release = await appStore.makeRelease(cmd);
    console.log(release);
  });

program
  .command('make-android-release')
  .requiredOption('-k, --key <key>')
  .requiredOption('-a, --appId <appId>')
  .requiredOption('-v, --version <version>')
  .requiredOption('-b, --build <build>')
  .option('-p, --pathToReleaseText <pathToReleaseText>')
  .action(async cmd => {
    const googlePlay = await googlePlayApi(cmd.key);
    const release = await googlePlay.makeRelease(cmd);
    console.log(release);
  });

program.parse(process.argv);
