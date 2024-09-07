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

- 参照する側は照会する方法の物理仕様が変わらない限り、メンテナンスフリー
- 毎年の最低賃金改定時の運用
    - 8月の厚生労働書の答申結果が出揃った段階で最低賃金のマスタを追加
    - 都道府県労働局から官報で公示されたら最低賃金のマスタを更新
    - 最低賃金のマスタはリポジトリにコミット
