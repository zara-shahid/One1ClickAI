
# One-Click AI – Supply Chain Decision Engine

## Overview
A web-based supply chain intelligence platform where users upload sales/inventory CSVs, get AI-powered demand forecasts, stockout/overstock alerts, and actionable recommendations — all visualized on an interactive dashboard.

## Features

### 1. Authentication & User Management
- Simple email/password sign-up and login
- Each user sees only their own uploaded data and insights

### 2. CSV Data Upload & Processing
- Drag-and-drop CSV upload interface
- Expected columns: Product Name, Date, Quantity Sold, Unit Price, Current Stock, Reorder Point
- Validation with clear error messages for format issues
- Data is parsed and stored in the database for persistence

### 3. Interactive Dashboard
- **Overview cards**: Total products, at-risk items, total inventory value
- **Sales trend chart**: Line chart showing sales over time by product
- **Inventory health chart**: Bar chart comparing current stock vs. reorder points
- **Risk alerts panel**: Color-coded list of stockout and overstock warnings
- **Forecast chart**: Projected demand over next 30 days with confidence bands

### 4. Demand Forecasting
- Moving average and trend analysis computed on uploaded data
- Visual forecast projections overlaid on historical sales charts
- Per-product forecast breakdown

### 5. AI-Powered Decision Explanations
- Uses Lovable AI (Gemini) to analyze inventory data and generate:
  - Natural language explanations of why a product is at risk
  - Recommended reorder quantities with reasoning
  - Priority rankings for procurement actions
- "One-Click Insight" button that generates a full supply chain briefing

### 6. Alerts & Recommendations Table
- Sortable table of all products with AI-generated status (Healthy / At Risk / Critical)
- Recommended actions per product (reorder now, reduce stock, monitor)
- AI explanation expandable for each recommendation

## Design & UX
- Clean, professional dashboard layout with a dark sidebar navigation
- Color scheme: blues and greens for healthy, amber for warnings, red for critical
- Responsive design for desktop use (primary) with mobile support
- Charts built with Recharts (already installed)

## Tech Architecture
- **Frontend**: React + TypeScript + Tailwind + Recharts
- **Backend**: Lovable Cloud (Supabase) for database, auth, and edge functions
- **AI**: Lovable AI gateway for generating explanations and recommendations
- **Data processing**: Client-side CSV parsing with PapaParse, forecasting logic in edge functions

## Pages
1. **Login/Signup** — Authentication page
2. **Dashboard** — Main overview with charts, alerts, and metrics
3. **Upload** — CSV upload with validation and data preview
4. **Insights** — AI-generated recommendations and explanations per product
5. **History** — Past uploads and their associated analyses
