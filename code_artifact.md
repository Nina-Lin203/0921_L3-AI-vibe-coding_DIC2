# 系統設計文件 (System Design Document)

本文件定義建立「台灣氣象 GIS 視覺化網頁系統」的系統架構、技術選型、資料流程以及給 **Antigravity** 的具體執行指令。

---

## 1. 專案目標 (Project Goals)
1. 整合中央氣象署 (CWA) Open API 取得即時氣象資料。
2. 設計資料擷取管線 (ETL)，將資料處理後儲存至資料庫。
3. 開發互動式台灣 GIS 地圖網頁，將氣象數據精準疊加至地圖定位點。
4. 設定 Git 版本控制並維護安全性 (避免 API Key 外洩)。
5. 串接 GitHub 與 Vercel 實現自動化 CI/CD 部署。

---

## 2. 系統架構與技術選型 (System Architecture & Tech Stack)

```
[ CWA Open API ] ──(Fetch)──> [ Backend / Script ]
                                     │
                                (Store/Update)
                                     ▼
[ GIS Web App (Frontend) ] <─── [ Database ]
      │
 (Deploy)
      ▼
 [ Vercel Deployment ]
```

* **前端 (Frontend)**: React / Next.js, Tailwind CSS
* **地圖套件 (GIS Library)**: Leaflet.js (配合 react-leaflet) 或 Mapbox GL JS
* **地理圖資 (GeoJSON)**: 台灣縣市/鄉鎮邊界 GeoJSON (TWD97/WGS84)
* **資料庫 (Database)**: PostgreSQL + PostGIS (可選 Supabase / Neon) 或 SQLite (本地測試)
* **部署與 CI/CD**: GitHub + Vercel

---

## 3. 工作流程與架構細節 (Workflow Details)

### 階段一：API 串接與資料庫建立
1. **API 設定**: 註冊 CWA 平台並取得 `Authorization Key`。
2. **Schema 設計**:
   * `stations`: 測站 ID、名稱、經度 (Longitude)、緯度 (Latitude)、縣市。
   * `weather_data`: 測站 ID、時間戳記、氣溫、降雨量、相對濕度、天氣現象描述。
3. **ETL 腳本**: 撰寫排程或 API 路由，將 CWA JSON 資料轉換並寫入資料庫。

### 階段二：GIS 網頁開發
1. **地圖初始化**: 設定台灣中心點位置（例如 lat: 23.97387, lng: 120.982025）與縮放層級。
2. **圖層疊加**:
   * 載入台灣邊界 GeoJSON。
   * 根據測站座標繪製地圖標記 (Markers) 或 熱圖 (Heatmap)。
3. **彈出視窗 (Popup)**: 點擊標記時顯示該地點的即時氣象資訊與圖表。

### 階段三：版本控制與部署
1. 設定 `.gitignore` 排除環境變數檔案 (`.env*`)。
2. 推送至 GitHub 遠端儲存庫。
3. 在 Vercel 設定環境變數並連結 GitHub 觸發自動部署。

---

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