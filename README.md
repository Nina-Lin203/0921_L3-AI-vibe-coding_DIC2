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
