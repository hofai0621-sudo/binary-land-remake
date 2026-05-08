# Lumapair 原創化與商業化計劃

本文是把目前遊戲改造成可公開銷售版本的工作計劃與執行紀錄。它不是法律意見；正式收費上架前，仍應由熟悉遊戲、商標與網路產品的律師做最後 clearance。

## 1. 目標

1. 移除可識別舊作來源的公開元素：舊作名稱、remake 字眼、企鵝主角、角色名、愛心救援敘事、蛛網/蜘蛛/粉紅鳥/鯨魚卡等具體表達。
2. 保留「雙角色同步鏡像移動」作為抽象玩法核心，但改變世界觀、視覺語言、道具系統、陷阱規則、UI 文案和商業包裝。
3. 修正陷阱公平性：正式關卡的陷阱和主要危險要左右成對；角色被困後必須有玩家可理解、可操作的掙脫機制。
4. 確保部署包只包含銷售用遊戲，不公開歷史日記、內部記錄、舊作參照或開發備忘。

## 2. 法務依據與風險邊界

- 美國 Copyright Office 的 games 說明指出，遊戲 idea、title、玩法 method 本身通常不受 copyright 保護，但規則文字、棋盤/畫面圖像等具體表達可能受保護：https://www.copyright.gov/register/tx-games.html
- Copyright Office 將 video games 視作可登記的 audiovisual works 類型之一，畫面、動畫、聲音、文字和程式碼都可能構成需要審核的作品元素：https://www.copyright.gov/registration/index.html
- USPTO 說明 trademark 保護的是能識別商品/服務來源的名稱、短語、符號或設計；商業遊戲名稱、logo、系列名稱和角色品牌要做商標檢索：https://www.uspto.gov/trademarks/basics/what-trademark
- USPTO 也提醒，申請前要搜尋相似商標，因為相似名稱加上相關商品/服務可能造成 likelihood of confusion：https://www.uspto.gov/trademarks/basics/why-search-similar-trademarks

實務結論：不能承諾「絕對零風險」，但可以把風險降到商業上合理可控：獨立品牌、獨立視覺、獨立敘事、清晰創作紀錄、商標檢索、律師審閱。

## 3. 已執行的原創化改動

- 品牌改名：公開名稱改為 `Lumapair`，副標改為「光訊號雙生迷宮 / Twin Signal Puzzle」。
- 主角改造：公開角色名改為 `Nova` 和 `Vega`；畫面造型改為抽象光訊號員，不再使用企鵝輪廓、白肚、鳥嘴或腳掌。
- 世界觀改造：愛情救援敘事改為雙訊號同步校準；終點從籠中愛心改為 relay core。
- 陷阱改造：蛛網改為靜滯場 snare，視覺改為五角能量場；文案移除蛛網和殺蟲劑。
- 敵人改造：蜘蛛改為巡邏器 drone；火球改為能量浪湧 surge；粉紅鳥改為相位轉換器 phase switcher。
- 道具改造：蛋糕、雨傘、豎琴、卡片、鯨魚卡改為 battery、shield、metronome、scanner、prism。
- 關卡公平性：正式關卡的 snares、drones、surges、switchers 均以左右 mirrored pairs 生成。
- 掙脫機制：角色踩中 snare 後不再永久卡死；方向鍵累積 1 點，`Z`/`Space` 累積 2 點，滿 4 點自動掙脫並移除所在 snare。
- Bonus 關改造：Bonus 不再預設單方被困，改為收集所有同步核心再抵達目標。
- 部署控管：新增 `.vercelignore`，排除 markdown 文件、`AGENTS.md` 和 `.claude/`，避免內部/歷史文件被當作靜態資源部署。

## 4. 商業化前必做清單

1. 品牌 clearance
   - 搜尋 `Lumapair`、近似拼法、近似讀音、中文名稱「光訊號雙生迷宮」。
   - 搜尋 USPTO、主要銷售地區商標資料庫、App Store、Google Play、Steam、itch.io、域名、社交媒體帳號。
   - 如要長期售賣，申請文字商標和 logo 商標；如果只是一款單一作品名稱，需由律師判斷商標策略。

2. 視覺與素材 audit
   - 保證所有圖像由本專案 Canvas 程式直接繪製，沒有外部圖片或未授權素材。
   - 若之後加入音樂、音效、字體、logo、宣傳圖，必須記錄來源、授權條款、發票或合約。
   - 建立 `/assets/licenses/` 或等同資料夾，保存所有授權證據。

3. 玩法差異化
   - 新增至少 2 至 3 個只屬於 `Lumapair` 的機制，例如可充能的 snare、可切換 mirror anchor、限時 relay gate、不同脈衝模式。
   - 調整關卡節奏，不以舊作關卡/路線作為銷售版本核心賣點。
   - 建立原創關卡編輯資料格式，讓日後新增關卡有明確設計流程。

4. 技術與品質
   - 為每關建立 solvability test，檢查左右角色可達終點、snare 不造成永久 soft lock、Bonus 核心全可收集。
   - 建立 browser smoke test，至少測 desktop 1280x720、mobile 390x844。
   - 加入 crash-free telemetry 或最少 console-error 檢查。

5. 商店與法律文件
   - 建立 Terms of Service、Privacy Policy、Refund Policy。
   - 如收集 analytics、錯誤回報或付款資料，明確列出資料類型和第三方服務。
   - 做年齡分級和內容描述；目前版本應走 family-friendly puzzle 方向。

6. 發佈與營運
   - 把 Vercel project、production alias、repo name 從舊名稱換成 `lumapair` 或最終品牌。
   - 部署前跑 `rg` 掃描舊作詞彙；任何 public bundle 不應包含舊名稱、remake 字眼或舊角色名。
   - 建立 changelog，只記錄 `Lumapair` 品牌後的公開版本歷史。

## 5. 下一階段建議

1. 做一次完整商標 knock-out search，確認 `Lumapair` 是否可用。
2. 改 Vercel project 與正式網址，避免仍用舊 project name。
3. 寫自動測試：關卡生成平衡、snare 可掙脫、全關可解。
4. 製作原創 logo、主視覺和商店截圖。
5. 找律師做最終 IP review，再開始收費上架。
