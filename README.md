# 風天 FuuTen — YouTubeジャンル需給分析

AIがYouTubeジャンルの需要と競合を即分析し、参入判断をデータで支援するWebアプリです。
Next.js (App Router / TypeScript) + OpenAI gpt-4o-mini。

---

## セットアップ手順

### 1. 依存パッケージのインストール

このフォルダ（`fuuten`）をターミナルで開いて実行してください：

```
cd Desktop/fuuten
npm install
```

> ⚠️ `node_modules` はまだ入っていません。**必ず `npm install` を実行してください。**

### 2. OpenAI APIキーを設定

`.env.local` ファイルを開き、`OPENAI_API_KEY` の値をあなたのキーに差し替えます：

```
OPENAI_API_KEY=sk-あなたのキー
```

APIキーは https://platform.openai.com/api-keys で取得できます。

### 3. ローカルで起動

```
npm run dev
```

ブラウザで http://localhost:3000 を開き、「英語学習」などのキーワードを入力して
「分析する」を押すと結果が表示されます。

---

## Vercelへのデプロイ（公開）

1. https://vercel.com で無料アカウントを作成
2. `fuuten` フォルダを GitHub にプッシュ
   ```
   git init
   git add .
   git commit -m "init FuuTen"
   git branch -M main
   git remote add origin https://github.com/<あなた>/fuuten.git
   git push -u origin main
   ```
3. Vercel で「New Project」→ `fuuten` リポジトリを選択
4. 「Environment Variables」に追加：
   - キー名: `OPENAI_API_KEY`
   - 値: あなたの OpenAI APIキー
5. 「Deploy」を押すと、数分で `https://fuuten.vercel.app` のような URL が発行されます。

> ✅ `.env.local` は `.gitignore` に含まれているため、APIキーは GitHub に公開されません。

---

## ファイル構成

```
fuuten/
├─ app/
│  ├─ layout.tsx           ルートレイアウト（フォント・メタ情報）
│  ├─ page.tsx             FuuTen の画面（UI・分析処理）
│  ├─ globals.css          リセットCSS
│  └─ api/analyze/route.ts 分析API（OpenAI呼び出し・レート制限）
├─ .env.local              APIキー（Git管理外）
├─ package.json
└─ ...
```

## コスト目安（gpt-4o-mini）

| 月間分析回数 | 概算コスト |
|------------|----------|
| 1,000回    | 約 $0.10 |
| 10,000回   | 約 $1.00 |
| 100,000回  | 約 $10.00 |

1回の分析は約 $0.0001（約0.01円）と非常に安価です。

## 内蔵の安全機構

- **レート制限**: 同一IPあたり 1時間10回まで（`route.ts` の `RATE_LIMIT` で調整可）
- **入力検証**: 空・120文字超のキーワードを拒否
- **APIキー秘匿**: サーバー側でのみ使用し、ブラウザには露出しません
