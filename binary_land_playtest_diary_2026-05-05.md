# Binary Land Remake 困難模式通關日記

日期：2026-05-05  
模式：困難 Hard  
主要控制：Gurin  
驗證目標：確認現有 `main.py` 不改遊戲邏輯時，是否可以從第 1 關通到 `YOU WIN`。

相關記錄：

- Vercel 部署日記：[binary_land_vercel_deployment_diary_2026-05-05.md](./binary_land_vercel_deployment_diary_2026-05-05.md)
- 安裝與部署記錄：[vercel_deployment_installation_2026-05-05.md](./vercel_deployment_installation_2026-05-05.md)

## 我怎麼玩的

我先用程式輔助檢查所有關卡的路線可達性，確認 1 到 10 關都能避開蛛網抵達左右目標。正式關卡的共同路線是：

```text
RRRRUUUUUUUUU
```

Bonus 關卡使用這條路線：

```text
UUUDDSDURRUURUULLUULLURRRRRU
```

其中 `S` 是按 `Z` 或 `Space` 噴藥；在 Bonus 關裡，Gurin 先走到能向下噴藥的位置，利用鏡像救援規則清掉 Malon 起點 `(12, 9)` 的蛛網，然後兩隻企鵝一起收完 10 顆心再上去過關。

我也啟動過真正的 Pygame 視窗，但 macOS 輔助功能沒有穩定讓我把鍵盤輸入送進 Python 視窗。為了完成可重現驗證，我改用同一個 `BinaryLandGame` 類別與 Pygame 初始化流程，固定隨機種子 `495`，用假鍵盤狀態逐步送入同一套路線。這沒有修改 `main.py`，只是讓敵人隨機行動可以重放。

## 通關紀錄

- Level 1-5：正式路線一次通過。
- Bonus 5：救出 Malon、收完所有愛心，一次通過。
- Level 6-7：正式路線一次通過。
- Level 8：第一次被蜘蛛撞到，Gurin 失去一命；重生後照同一路線第二次通過。
- Level 9-10：正式路線一次通過。
- Bonus 10：再次救出 Malon、收完所有愛心，最後兩隻企鵝站上 `(6, 0)` 和 `(8, 0)`。

最終狀態：

```text
FINAL_STATE win
FINAL_SCORE 18740
FINAL_LIVES 2
RESULT PASS
```

## 日記

今天幫這個小小的鏡像迷宮走了一趟困難模式。前幾關比想像中乾淨：Gurin 往右走四格，Malon 就乖乖往左靠近，接著一起往上衝，像兩條對稱的線把迷宮縫起來。真正讓人緊張的是敵人隨機移動，因為靜態路線雖然漂亮，但蜘蛛不會站著等我。

Bonus 關比較像一個小儀式：先讓 Gurin 上下挪位，對準鏡像位置噴藥，把 Malon 從起點的蛛網裡救出來。救出來之後，兩隻企鵝一起掃過心形道具，再從底部一路推到頂端。這段很有 Binary Land 的味道，因為你不是控制兩個角色，而是在控制一段關係的對稱。

第 8 關第一次失手，Gurin 撞到蜘蛛。這個失誤反而確認了困難模式不是只要背路線就百分百穩，敵人的時機真的會改變結果。重生之後我照同一路線再跑一次，這次成功通過，後面第 9、10 關和最後 Bonus 都順利完成。

結論：這份 `main.py` 的 10 個正式關卡和兩個 Bonus 關在困難模式下可以通關。固定路線本身是可行的，但實際遊玩會受蜘蛛、火球與粉紅鳥的時機影響；如果被撞，從同關重試仍然可以完成。最終我看到了 `win` 狀態，分數 18740，剩餘 2 條命。
