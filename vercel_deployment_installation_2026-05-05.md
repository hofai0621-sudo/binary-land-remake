# Binary Land Remake Vercel 安裝與部署記錄

日期：2026-05-05  
專案：`binary-land-remake`  
正式網址：[https://binary-land-remake.vercel.app](https://binary-land-remake.vercel.app)

雙向連結：

- 部署日記：[binary_land_vercel_deployment_diary_2026-05-05.md](./binary_land_vercel_deployment_diary_2026-05-05.md)
- 專案說明：[README.md](./README.md)
- 通關日記：[binary_land_playtest_diary_2026-05-05.md](./binary_land_playtest_diary_2026-05-05.md)

## 安裝記錄

原始遊戲位於 `/Users/hofaishiu/Documents/games/binary-land-remake/main.py`，是 Pygame 桌面程式。因為 Vercel 不能直接執行桌面視窗遊戲，所以這次在目前資料夾建立了可由 Vercel 靜態託管的 Canvas 網頁版。

新增的部署檔案：

- `index.html`：瀏覽器入口與觸控控制按鈕。
- `styles.css`：頁面、Canvas、觸控控制樣式。
- `src/game.js`：Binary Land Remake 的 Canvas 遊戲邏輯。
- `vercel.json`：Vercel 靜態部署設定。
- `.gitignore`：排除 `.vercel/`、`.env*.local`、`node_modules/` 等本機檔案。

Vercel CLI 在連結專案時產生 `.vercel/` 與 `.env.local`。這兩者是本機部署狀態與環境設定，不應提交到 Git；本次沒有讀取 `.env.local` 的內容。

## 本機預覽

在專案根目錄執行：

```bash
python3 -m http.server 4173
```

然後打開：

```text
http://127.0.0.1:4173
```

本機驗證結果：

- 首頁 `HTTP 200`。
- `src/game.js` `HTTP 200`。
- `node --check src/game.js` 通過。
- 瀏覽器可看到標題畫面並進入 Level 1。
- Console 沒有 JavaScript error。

## Vercel 部署步驟

登入 Vercel CLI：

```bash
npx --yes vercel@latest deploy --prod --yes
```

第一次執行時需要用 device login 授權 Vercel 帳號。

因為資料夾名稱 `New project` 不能當作 Vercel project name，所以建立合法專案名稱：

```bash
npx --yes vercel@latest project add binary-land-remake
```

連結本機資料夾到 Vercel project：

```bash
npx --yes vercel@latest link --yes --project binary-land-remake
```

部署到 production：

```bash
npx --yes vercel@latest deploy --prod --yes
```

部署完成後取得：

```text
Production: https://binary-land-remake-66xwxx5fx-hofai0621-sudos-projects.vercel.app
Alias: https://binary-land-remake.vercel.app
```

## 維護說明

之後修改遊戲後，建議先做本機檢查：

```bash
node --check src/game.js
python3 -m http.server 4173
```

確認本機頁面正常後，再重新部署：

```bash
npx --yes vercel@latest deploy --prod --yes
```

如果只是想查看目前 production 狀態，可打開：

```text
https://binary-land-remake.vercel.app
```

## 注意事項

- 原本 Pygame 檔案 `/Users/hofaishiu/Documents/games/binary-land-remake/main.py` 沒有被修改。
- 網頁版高分使用瀏覽器 `localStorage` 儲存，和 Pygame 版的 `highscore.json` 不共用。
- 這是靜態網站部署，不需要 server runtime 或 build step。
