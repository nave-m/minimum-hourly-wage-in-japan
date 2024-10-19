// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "packages/grpc/src/gen/*", // 自動生成コードなのでチェックしない
      "packages/restful/src/gen/*", // 自動生成コードなのでチェックしない
    ]
  },
);