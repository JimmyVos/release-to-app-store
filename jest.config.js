require('dotenv').config();
('use strict');
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  bail: false,
  maxWorkers: 1,
  testTimeout: 90000
};
