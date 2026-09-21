## 4. 給 Antigravity 的執行指令 (Instructions for Antigravity)

> **請 Antigravity 依據以下步驟分階段進行開發：**

### 指令 1：建立專案結構與環境變數範例
```bash
# 請執行以下操作：
1. 初始化 React/Next.js 專案並安裝必要套件 (leaflet, react-leaflet, dotenv 等)。
2. 建立 `.env.example` 檔案，包含以下變數名稱：
   - CWA_API_KEY=
   - DATABASE_URL=
3. 設定 `.gitignore`，確保 `.env` 與 `.env.local` 被正確忽略。
```

### 指令 2：撰寫 CWA API 資料擷取與資料庫寫入模組
```bash
# 請執行以下操作：
1. 建立一個 API Fetch 模組，對 CWA API（例如全台自動氣象站資料 F-C0032-001 或 O-A0001-001）發送 Request。
2. 撰寫資料清洗邏輯，提取測站名稱、經緯度、氣溫、降雨量。
3. 建立資料庫連線並設計將上述資料寫入/更新至 DB 的函式。
```

### 指令 3：建構台灣 GIS 網頁元件
```bash
# 請執行以下操作：
1. 建立一個 React 地圖元件，使用 Leaflet 載入 OpenStreetMap 底圖。
2. 載入台灣 GeoJSON 圖資並進行邊界繪製。
3. 從 DB 或 API 讀取氣象資料，並在中天/各地測站經緯度位置渲染 Map Marker。
4. 點擊 Marker 時，跳出包含該地即時氣溫與降雨資訊的 Popup 工具列。
```

### 指令 4：準備 Github 及 Vercel 部署腳本
```bash
# 請執行以下操作：
1. 檢查並更新 `package.json` 中的 `build` 與 `start` 指令。
2. 建立部署說明文件 README.md，列出可以在 Vercel Dashboard 設定的 Environment Variables 清單。
3. 產出一份 Git commit 紀錄建議範本。
```