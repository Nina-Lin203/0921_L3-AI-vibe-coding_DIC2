# 台灣氣象 GIS 視覺化系統 (Taiwan Weather GIS)

[![Deploy to GitHub Pages](https://github.com/Nina-Lin203/0921_L3-AI-vibe-coding_DIC2/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nina-Lin203/0921_L3-AI-vibe-coding_DIC2/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)](https://leafletjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

> 🌐 **線上即時體驗網址**：**[https://Nina-Lin203.github.io/0921_L3-AI-vibe-coding_DIC2/](https://Nina-Lin203.github.io/0921_L3-AI-vibe-coding_DIC2/)**

本專案為現代化台灣即時氣象地理資訊系統 (GIS)，串接**交通部中央氣象署 (CWA) Open API**，將全台 **870+ 座自動氣象測站** 的即時氣溫、降雨量、風速、相對濕度與氣壓數據，以互動式地圖與視覺化儀表板方式呈現。

---

## 📸 核心功能特色 (Features)

* **🗺️ 互動式 GIS 地圖與向量圖資**
  * 支援台灣 22 縣市邊界向量圖資（GeoJSON）精準疊加。
  * 內建 3 種無浮水印專業圖層隨選即切：
    * 🌙 **暗色科技（預設）**：採用 Esri Dark Gray Canvas，高對比且極具現代科技感。
    * 🗺️ **標準街景**：採用 OpenStreetMap (OSM) 官方標準圖資。
    * 🛰️ **衛星空照**：採用 Esri World Imagery 高解析度衛星地形空照圖。

* **🌡️ 多維度觀測數據切換**
  * **氣溫分佈**：依即時氣溫呈現冷暖漸層色階標記（低溫藍綠、舒適黃橙、高溫朱紅）。
  * **時降雨量**：即時降水毫米數視覺化。
  * **風速風向**：即時風力動態呈現。

* **📊 即時極端天氣指標卡**
  * 自動統計全台即時「最高氣溫」、「最低氣溫」、「最大時雨量」、「最大風速」測站與觀測值，點擊指標卡即可自動平移縮放至該測站。

* **🔍 測站快速搜尋與縣市過濾**
  * 支援依縣市篩選測站，並提供測站名稱、站號與鄉鎮區關鍵字即時搜尋。

* **⚡ 雙模資料架構（雲端無伺服器 / 本機 ETL 雙支援）**
  * **GitHub Pages 模式**：前端在瀏覽器端直連氣象署 Open API（CORS 支援），無須後端伺服器即可全球秒開。
  * **本機 SQLite 模式**：內建 Node.js ETL 腳本與 SQLite 資料庫，可離線儲存與歷史追蹤。

---

## 🏗️ 系統架構 (Architecture)

```
[ 中央氣象署 CWA Open API ] (O-A0001-001 自動氣象站觀測)
                 │
                 ├── (本機 ETL 腳本: sync-weather.mjs) ──> [ SQLite 資料庫: weather.db ]
                 │                                                │
                 └── (瀏覽器直連 Direct Fetch)                      │
                                 │                                │
                                 ▼                                ▼
                    [ 台灣氣象 GIS 視覺化儀表板 (Next.js / Leaflet) ]
                                 │
                   (GitHub Actions 自動建置 CI/CD)
                                 ▼
                     [ GitHub Pages 線上發布 ]
```

---

## 🛠️ 技術選型 (Tech Stack)

| 領域 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **前端框架** | Next.js 16 (App Router), React 19 | 支援靜態匯出 (Static Export) 與現代 React 架構 |
| **程式語言** | TypeScript 5 | 具備完整強型別定義與檢核 |
| **地圖與 GIS** | Leaflet 1.9, React-Leaflet, TopoJSON | 向量邊界繪製、自訂色彩 Marker、互動 Popup |
| **地圖圖資** | Esri Canvas, OpenStreetMap, Esri Imagery | 開源且完全無浮水印的專業 GIS 圖磚 |
| **樣式設計** | Tailwind CSS 4, Lucide React Icons | 暗色玻璃擬態 (Glassmorphism) 風格 |
| **本地資料庫** | Better-SQLite3 12 (WAL 模式) | 高效能輕量本地資料儲存與 ETL 管線 |
| **部屬與 CI/CD**| GitHub Actions, GitHub Pages | 自動化測試、靜態打包並推送至 GitHub Pages |

---

## 🚀 本地開發與啟動 (Getting Started)

### 1. 複製專案與安裝套件

```bash
git clone https://github.com/Nina-Lin203/0921_L3-AI-vibe-coding_DIC2.git
cd 0921_L3-AI-vibe-coding_DIC2
npm install
```

### 2. 環境變數設定

複製環境變數範本檔：
```bash
cp .env.example .env
```

開啟 `.env` 並填入您的中央氣象署 API 金鑰（可至 [中央氣象署開放資料平台](https://opendata.cwa.gov.tw/) 免費申請）：
```env
CWA_API_KEY=您的授權碼
NEXT_PUBLIC_CWA_API_KEY=您的授權碼
```

### 3. (可選) 手動執行資料同步腳本

```bash
npm run sync
```
*腳本將向 CWA 抓取 870+ 測站資料並儲存至本機 `data/weather.db`。*

### 4. 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器開啟 **[http://localhost:3000](http://localhost:3000)** 即可預覽網站。

---

## 📦 專案結構 (Directory Structure)

```
0921_L3-AI-vibe-coding_DIC2/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD 自動部屬工作流程
├── public/
│   └── data/
│       └── taiwan_counties.geojson  # 台灣 22 縣市邊界向量圖資
├── scripts/
│   └── sync-weather.mjs        # 本地 CWA ETL 資料清洗與 SQLite 同步腳本
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根版面與 SEO 中繼資料
│   │   └── page.tsx            # 首頁核心容器 (靜態匯出)
│   ├── components/
│   │   ├── ControlPanel.tsx    # 觀測模式切換、縣市篩選與搜尋面板
│   │   ├── Header.tsx          # 頂部導覽列與即時同步按鈕
│   │   ├── MapWrapper.tsx      # Leaflet 動態客戶端載入器
│   │   ├── StatsCards.tsx      # 極端氣候指標統計卡
│   │   ├── TaiwanWeatherMap.tsx# 核心 Leaflet GIS 地圖與底圖切換
│   │   └── WeatherDashboard.tsx# 儀表板狀態管理與即時資料流
│   ├── lib/
│   │   ├── cleaner.ts          # 氣象觀測數值異常值過濾與資料正規化
│   │   ├── cwaApi.ts           # 中央氣象署 API 呼叫模組
│   │   ├── db.ts               # SQLite 資料庫連線與查詢
│   │   └── demoData.ts         # 離線/靜態模式示範資料種子
│   └── types/
│       └── weather.ts          # TypeScript 介面定義
├── next.config.ts              # Next.js 靜態匯出與 BasePath 設定
├── package.json
└── README.md
```

---

## 📄 版權與資料來源宣告 (Attribution)

- **氣象資料**：[交通部中央氣象署開放資料平台 (CWA Open Data)](https://opendata.cwa.gov.tw/)，符合政府資料開放授權條款。
- **地理圖資**：
  - [OpenStreetMap (OSM)](https://www.openstreetmap.org/copyright) contributors (ODbL 授權)
  - [Esri ArcGIS Online Services](https://www.esri.com/) (World Dark Gray Canvas / World Imagery)
  - 台灣縣市邊界 GeoJSON 由內政部國土測繪中心開放資料轉換。

---

## 👩‍💻 作者 (Author)

- **Nina Lin** - [GitHub Profile](https://github.com/Nina-Lin203)
