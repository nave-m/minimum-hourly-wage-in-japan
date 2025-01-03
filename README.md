# 動機

HRTechのWebサービスで最低賃金のバリデーションをするための最低賃金データをフロントエンドやバックエンドで重複して保持していると、
毎年の最低賃金の更新の時期には各サブシステムで最低賃金データの更新の手間がかかる。
(都道府県ごとに官報公示日がバラバラなので、8月末から9月末ぐらいにかけて何度もデプロイすることになる。)

各サブシステムは最低賃金APIから最低賃金を取得し、最低賃金データの更新は最低賃金APIのデータソースでだけ実施すれば済むようにしたい。

# 利用想定・機能要件

- 誰が : HRTech事業者のシステムが
- いつ : 求人の時給を設定しようとするとき
- なんのために使うのか : 求人を出す日付の最低時給を知る
    - 日付を指定して照会できる
    - 都道府県を指定して照会できる
    - 近い将来に改定が確定している・改定の予定がある場合はその情報も合わせて取得できる

対象外の機能要件

- 日本でない国
- 特定（産業別）最低賃金
    - https://saiteichingin.mhlw.go.jp/table/page_indlist_nationallist.html
- 深夜割増賃金の計算機能
    - 割増率は事業者側で任意に設定するものであり、対象外
- 休日割増賃金の計算機能
    - 割増率は事業者側で任意に設定するものであり、対象外
    - 休日は事業者側で任意に設定するものであり、対象外
- 最低賃金の改定履歴機能
    - 現在と未来の最低賃金だけに関心領域を狭める
    - 過去の最低賃金厚生労働省が統計を提供している

# 運用想定

- 毎年の最低賃金改定時期にデータを追加・更新する
    - 8月の厚生労働書の答申結果が出揃った段階で最低賃金のマスタを追加
    - 都道府県労働局から官報で公示されたら最低賃金のマスタを更新
    - 最低賃金のマスタはリポジトリにコミット

# 最低賃金API

現状では、RESTful と gRPC の2つの通信仕様に対応

## Restful API

[API仕様](./packages/restful/doc/openapi.yaml)

サーバの起動

```
npm install
npm run build:restful
npm run restful
```

環境変数 

- RESTFUL_API_PORT : リクエストを受け付けるポート番号 (省略した場合は3000)

ログフォーマット

```typescript
type AccessLogFormat = {
    level: 'info';
    service: 'minimum-hourly-wage-in-japan-restful-api';
    message: 'access-log';
    timestamp: string; // ISO8601
    request: {
        path: string;
        method: string;
        headers: object;
        query?: object;
    };
    response: {
        statusCode: number;
        body?: object;
    };
};
```

- ヘルスチェックは`GET /api/v1/health`が200応答であるか確認
- ログは標準出力にJSON形式で出力されます。
- TLSが必要な場合は別途リバースプロキシを用意してください。

## gRPC API

[API仕様](./packages/grpc/doc/proto/jp/wage/api/v1/minimum_hourly_wage_api.proto)

サーバの起動

```
npm install
npm run build:grpc
npm run grpc
```

環境変数 

- GRPC_API_PORT : リクエストを受け付けるポート番号 (省略した場合は3000)

ログフォーマット

```typescript
type AccessLogFormat = {
    level: 'info';
    service: 'minimum-hourly-wage-in-japan-grpc-api';
    message: 'access-log';
    timestamp: string; // ISO8601
    request: {
        path: string;
        message?: object;
    };
    response: {
        status: {
            code: number;
            details: string;     // e.g. OK INVALID_ARGUMENT INTERNAL
            metadata?: object;
            badrequest?: object; // INVALID_ARGUMENT応答の場合、google.rpc.BadRequestをオブジェクトにして出力
        };
        message?: object;
    };
};
```

- ヘルスチェックは[gRPCのHealthサービス](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)を実装してあります
    - リクエスト HealthCheckRequest.serviceに`MinimumHourlyWage`を指定
    - レスポンス HealthCheckResponse.statusが`SERVING`であるか確認
- ログは標準出力にJSON形式で出力されます。
- TLSが必要な場合は別途リバースプロキシを用意してください。

# 開発者向け ディレクトリ構成

npm workspacesを使ったモノレポ構成。

クリーンアーキテクチャに倣ってます。

- packages/core
    - 外部ライブラリやデータソースに依存しない純粋なリソース定義
- packages/usecase
    - Service : データアクセスのI/F
    - Interactor : InputをOutputに変換するI/Fで、すべてのユースケースはこれを実装する
- packages/local
    - Serviceに対するインメモリでの実装
        - 現状では外部データソース(RDBなど)を使っていないため    
- packages/winston
    - LoggingServiceの実装
- packages/restful
    - 外部物理仕様(RESTfulAPI)に対する実装
        - フレームワークはExpress
    - RestfulAdapter : Interactorと1:1で実装する
    - index.ts : サーバ起動のエントリポイント
    - gen/schema.d.ts OpenAPIのyamlから生成したレスポンスなどの型定義
        - openapi.yamlを変更したら `npm -w packages/restful run codegen` で生成しなおす
- packages/grpc
    - 外部物理仕様(gRPC)に対する実装
        - フレームワークはgrpc-js
    - ServerUraryCallAdapter : Interactorと1:1で実装する
    - index.ts : サーバ起動のエントリポイント
    - gen/ protoファイルから生成したコード
        - protoファイルを変更したら `make protogen` で生成しなおす

# 補足 最低賃金改定時のデータ更新

[最低賃金の定義](./packages/local/src/InMemoryDataSource.ts)を更新して、APIをデプロイする

改定情報の提供元

- [インターネット版官報](https://kanpou.npb.go.jp/)
    - 直近90日間は無料で閲覧できる
    - 毎年8月末から9月にかけての改定時期にどの都道府県が公示したかを確認
    - 官報には発効日が掲載されないため、後述の厚生労働省のまとめもしくは各都道府県の労働局の報道発表資料を参照
- [地域別最低賃金の全国一覧](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html)
    - 厚生労働省の最低賃金のまとめ
    - 2023年の8月末から9月末にかけては官報公示がされるとこのページが更新されていた
    - 2024年の改定でも同様の対応がされるかは不明