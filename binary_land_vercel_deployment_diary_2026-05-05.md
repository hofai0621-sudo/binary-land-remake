# Binary Land Remake Vercel 部署日記

日期：2026-05-05  
正式網址：[https://binary-land-remake.vercel.app](https://binary-land-remake.vercel.app)

雙向連結：

- 安裝與部署記錄：[vercel_deployment_installation_2026-05-05.md](./vercel_deployment_installation_2026-05-05.md)
- 通關日記：[binary_land_playtest_diary_2026-05-05.md](./binary_land_playtest_diary_2026-05-05.md)
- 專案說明：[README.md](./README.md)

## 今天做了什麼

今天把原本只能在桌面跑的 Pygame 版 Binary Land Remake，搬成可以在瀏覽器玩的 Canvas 版本，並部署到 Vercel。原本的 `main.py` 沒有動；新的網頁版放在目前專案資料夾，用 `index.html`、`styles.css` 和 `src/game.js` 組成。

一開始最重要的判斷是：Vercel 很適合靜態網站，但不適合直接跑 Pygame 視窗。於是做法不是硬把 Python 放上去，而是把遊戲重新整理成瀏覽器能理解的形態。關卡、鏡像移動、噴藥、蛛網、蜘蛛、火球、粉紅鳥、Bonus Stage 和高分邏輯都搬到了 Canvas 裡。

## 部署過程

本地先檢查 `src/game.js` 的語法，再用 `python3 -m http.server 4173` 開靜態伺服器預覽。標題畫面出現後，又按 Start 進 Level 1，看見計分板、迷宮、兩隻企鵝和敵人都正確畫出來，console 也沒有 error。

第一次跑 Vercel CLI 時，本機沒有登入憑證，所以使用 Vercel device login。登入成功後又遇到一個小問題：資料夾名稱 `New project` 不能直接當 project name，因為 Vercel project name 需要小寫且不能有空格。最後建立 `binary-land-remake` 這個 project，連結本機資料夾，再推到 production。

最後 Vercel 給了正式 alias：

```text
https://binary-land-remake.vercel.app
```

我再打開 production 網址確認，頁面可以載入、Canvas 存在、標題畫面正常、console 沒有錯誤。到這裡，這個小小鏡像迷宮就真的從本機桌面走到網路上了。

## 心情紀錄

這次搬家的感覺很像把一台小型街機拆開，重新焊成可以放進瀏覽器的版本。Pygame 版比較像一個安靜的桌面玩具；Vercel 版則像把它放到一扇窗前，任何人點開網址都能看到兩隻企鵝站在起點。

最可愛的地方是，遊戲本身的核心沒有變：仍然是同一套左右鏡像的關係，仍然要一起抵達愛心兩側。只是這一次，關卡不只通關了，也被部署了。

## 下一步

後續可以再補上更精緻的 pixel art sprites、音效、手機版觸控手感調整，以及一個更完整的關卡選單。現在的版本已經可以公開遊玩，之後每次更新只要照安裝記錄裡的流程重新部署即可。
