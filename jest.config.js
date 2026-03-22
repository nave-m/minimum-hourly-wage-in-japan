/** @type {import('ts-jest').JestConfigWithTsJest} **/
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};

export default config;