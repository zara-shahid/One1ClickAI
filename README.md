# One-Click AI – Supply Chain Decision Engine 🚀

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)

A web-based supply chain intelligence platform that transforms raw sales and inventory data into actionable business insights instantly. Make complex supply chain decisions with a single click, reducing decision time from hours to seconds.


## 🎯 Problem Statement

Modern supply chains face critical inefficiencies:

- **Manual Processes**: Heavy reliance on spreadsheets, emails, and ad-hoc calculations
- **Stock Issues**: Frequent stockouts or overstock due to inaccurate demand forecasts
- **Slow Decision-Making**: Fragmented data and slow analysis delay procurement actions
- **Limited Visibility**: Managers lack actionable insights on inventory health and supplier risks

These challenges result in lost revenue, wasted resources, and reduced operational efficiency.

## 💡 Solution

One-Click AI combines agentic AI reasoning, interactive dashboards, and real-time forecasting to provide:

- **Instant Intelligence**: Transform CSV uploads into actionable insights in seconds
- **AI-Powered Recommendations**: Natural language explanations of risks and procurement priorities
- **Predictive Analytics**: 30-day demand forecasting with risk assessment
- **Unified Dashboard**: All-in-one interface eliminating fragmented processes

## ✨ Core Features

### 📊 CSV Upload & Processing
- Upload sales and inventory data in standard CSV format
- Required columns: Product Name, Date, Quantity Sold, Unit Price, Current Stock, Reorder Point
- Automatic data validation, parsing, and secure storage

### 📈 Interactive Dashboard
- **Overview Cards**: Total products, at-risk items, inventory value
- **Visualization**: Sales trends and inventory health charts
- **Forecasting**: 30-day demand prediction with confidence intervals
- **Risk Alerts**: Color-coded status indicators (Healthy / At Risk / Critical)

### 🤖 AI-Powered Insights
- Natural language explanations powered by Lovable AI (Gemini)
- **One-Click Insight**: Complete procurement briefing with priority rankings
- Context-aware recommendations based on historical trends

### 🎯 Alerts & Recommendations
- Sortable table with product-level status tracking
- Expandable AI explanations for each recommendation
- Priority-based action items for procurement teams

### 📜 History Tracking
- Monitor past uploads and analyses
- Identify long-term trends and patterns
- Track decision outcomes over time

## 🎨 Unique Selling Proposition

✅ **Agentic AI Integration**: Direct reasoning embedded in the dashboard  
✅ **Instant Actionability**: Generate insights in seconds, not hours  
✅ **Risk Prioritization**: AI-ranked procurement actions based on urgency  
✅ **Unified Experience**: Single platform replacing multiple fragmented tools  
✅ **User-Friendly**: Designed for non-technical inventory managers and procurement teams  

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive data visualization
- **PapaParse** - CSV parsing library

### Backend & Infrastructure
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication & authorization
  - Edge functions for data processing
  - Real-time subscriptions

### AI & Intelligence
- **Lovable AI (Gemini)** - Decision explanations and risk assessment
- Custom forecasting algorithms in edge functions

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/one-click-ai.git
cd one-click-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**
```bash
# Run database migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📦 CSV Format

Your CSV file should include the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Product Name | Name of the product | "Widget A" |
| Date | Transaction date | "2024-01-15" |
| Quantity Sold | Units sold | 150 |
| Unit Price | Price per unit | 29.99 |
| Current Stock | Available inventory | 500 |
| Reorder Point | Minimum stock level | 200 |

**Sample CSV:**
```csv
Product Name,Date,Quantity Sold,Unit Price,Current Stock,Reorder Point
Widget A,2024-01-15,150,29.99,500,200
Widget B,2024-01-15,85,49.99,120,150
Widget C,2024-01-16,200,19.99,180,250
```


## 🎯 Target Audience

- **Small to Medium Enterprises (SMEs)**: Optimize inventory without enterprise-level complexity
- **Inventory Managers**: Real-time visibility into stock levels and risks
- **Procurement Teams**: Priority-based action items for efficient ordering
- **Supply Chain Analysts**: Data-driven insights for strategic planning

## 📊 Impact & Results

- ⚡ **95% Faster**: Reduce decision-making time from hours to seconds
- 🎯 **Proactive**: Detect stockouts and overstock before they occur
- 💰 **Cost Savings**: Optimize procurement with AI-driven insights
- 📈 **Accuracy**: Improve operational efficiency with predictive analytics
- 🔄 **Scalable**: Handle growing product catalogs effortlessly

## 🛣️ Roadmap

- [ ] Multi-supplier comparison and recommendations
- [ ] Automated purchase order generation
- [ ] Mobile app for on-the-go insights
- [ ] Integration with ERP systems (SAP, Oracle)
- [ ] Advanced ML models for seasonal demand prediction
- [ ] Multi-warehouse inventory optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Zara Shahid** - Project Lead & Full-Stack Developer  
**Sam** - Ai Engineer 
[GitHub](https://github.com/zara-shahid) | [LinkedIn](https://linkedin.com/in/zarashahid123)

## 🙏 Acknowledgments

- Built with [Lovable AI](https://lovable.dev) for rapid prototyping
- Powered by [Supabase](https://supabase.com) for backend infrastructure
- Inspired by real-world supply chain challenges faced by SMEs

## 📞 Support

For questions, issues, or feature requests:
- 📧 Email: zarashahid444@gmail.com
- 💬 GitHub Issues: [Create an issue](https://github.com/zara-shahid/One1ClickAI/issues)
- 📖 Documentation: [Wiki](https://github.com/zara-shahid/One1ClickAI/wiki)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Zara & Sam

</div>
