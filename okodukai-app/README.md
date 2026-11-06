# 🪙 おこづかい管理アプリ (My Money)

学生がお金の収入と支出をかんたんに管理し、無駄遣いを減らせるWebアプリケーションです。  
白と水色を基調とした爽やかでおしゃれなデザインで、スマートフォンでもパソコンでも快適に利用できます。

---

## ✨ 主な機能

1. **現在の所持金・総残高の表示**
   - 累計の所持金残高を大きく見やすく表示します。
   - 当月の「収入合計」「支出合計」「収支差額」も一目で把握できます。

2. **かんたん収支登録**
   - 「＋ 収入を追加」（お小遣い、アルバイト代、お年玉、臨時収入など）
   - 「ー 支出を追加」（食費、交通費、娯楽・趣味、買い物・服、勉強・本、交際費、日用品など）
   - 金額、日付、カテゴリー、メモを記録できます。
   - +100円、+500円、+1,000円、+5,000円、+1万円などのワンタップクイック入力に対応。

3. **カテゴリー別グラフ表示 (Chart.js)**
   - 今月の支出をドーナツグラフと内訳バーで可視化。
   - どの項目にいくら使ったか、割合（%）が直感的に分かります。

4. **月ごとの収支確認**
   - 「◀」「▶」ボタンで過去の月や未来の収支をスムーズに切り替え可能。
   - 「今月」ボタンでいつでも当月にワンタップで戻れます。

5. **データの編集・削除**
   - 履歴一覧から任意の項目をタップ（または編集アイコン）して、金額やメモをいつでも変更可能。
   - 削除ボタンで不要な履歴を削除できます。

6. **データの自動保存 (localStorage)**
   - ページを再読み込みしたりブラウザを閉じても、データが自動で端末内に保存されます。

7. **便利な学生応援機能**
   - **毎月の支出目標（予算）設定**: 使いすぎ防止のプログレスバー＆アドバイスメッセージ付き。
   - **JSONバックアップ＆復元**: 機種変更や端末間のデータ移行も安心。
   - **サンプルデータ復元機能**: いつでも初期状態を体験できます。

---

## 📁 ファイル構成

```text
okodukai-app/
├── index.html        # アプリの画面構造 (HTML5)
├── style.css         # 白と水色を基調としたスタイリング・アニメーション (CSS3)
├── app.js            # 収支計算、localStorage保存、Chart.js連携 (JavaScript)
├── vercel.json       # Vercelデプロイ用設定ファイル
├── .gitignore        # Git除外設定
└── README.md         # アプリ説明・公開手順マニュアル (本ファイル)
```

---

## 🚀 ローカルでの動作確認方法

特別なサーバー環境の構築は不要です。

### 方法1: ブラウザで直接開く
1. フォルダ内の `index.html` をダブルクリックして、Google Chrome や Safari、Microsoft Edge などのブラウザで開くだけで動作します。

### 方法2: ローカルサーバーで開く (推奨)
VS Code の拡張機能「Live Server」を使用するか、PowerShell / ターミナルで以下を実行します：

```bash
# Pythonがインストールされている場合
python -m http.server 8000
```
ブラウザで `http://localhost:8000` にアクセスしてください。

---

## 🌐 GitHub & Vercelでの公開手順

### STEP 1: GitHubにコードをアップロードする

#### 【コマンドで行う場合】
```bash
cd okodukai-app
git init
git add .
git commit -m "Initial commit: おこづかい管理アプリ"
git branch -M main
# GitHubで作成したリポジトリURLを紐付け
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

#### 【ブラウザから行う場合（コマンド不要）】
1. [GitHub](https://github.com/) にログインし、右上の「＋」→「New repository」をクリック。
2. Repository name に `okodukai-app` などと入力し、「Create repository」をクリック。
3. 作成後の画面で「uploading an existing file」をクリック。
4. このフォルダ内のすべてのファイル（`index.html`, `style.css`, `app.js`, `vercel.json`, `README.md`）をドラッグ＆ドロップして「Commit changes」をクリック。

---

### STEP 2: Vercelで世界中に無料公開する

1. [Vercel](https://vercel.com/) にアクセスし、GitHubアカウントでログイン（Sign Up）します。
2. ダッシュボードの「Add New...」→「Project」をクリックします。
3. 先ほどGitHubに作成した `okodukai-app` リポジトリの横にある「Import」ボタンを押します。
4. 設定画面が開きますが、静的Webサイトのため **設定はそのままでOK** です。
   - Framework Preset: `Other`
   - Root Directory: `./`
5. 「**Deploy**」ボタンをクリックします。
6. 数十秒でデプロイが完了し、`https://your-project.vercel.app` という公開URLが発行されます！
   スマートフォンからそのURLにアクセスして、ホーム画面に追加すればアプリ感覚で使えます。

---

## 🛠️ 技術スタック
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Library**: [Chart.js](https://www.chartjs.org/) (グラフ描画)
- **Icons**: [FontAwesome 6](https://fontawesome.com/) & Emojis
- **Fonts**: Google Fonts (M PLUS Rounded 1c, Poppins)
- **Storage**: Web Storage API (localStorage)
- **Deployment**: GitHub, Vercel
