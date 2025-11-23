# 🌍 Trip Pick - AI-Powered Travel Assistant

Trip Pick is an intelligent travel planning application that uses multi-agent AI orchestration to create comprehensive, personalized trip itineraries in minutes. Built with React and Django, it leverages LangGraph to coordinate specialized AI agents that handle everything from flight searches to packing lists.

## 🎯 What Makes Trip Pick Special

Instead of spending hours researching flights, hotels, weather, and activities across multiple websites, Trip Pick does it all for you. Our system uses **7 specialized AI agents** working in parallel to gather information and create a complete travel plan tailored to your preferences.

### The Agents

- ✈️ **Flight Agent** - Searches real-time flight options via Amadeus API with pricing and schedules
- 🏨 **Hotel Agent** - Recommends accommodations based on location, budget, and amenities
- 🌤️ **Weather Agent** - Provides 7-day weather forecasts for your destination
- 🎯 **Activities Agent** - Suggests personalized daily activities using AI recommendations
- 🎒 **Packing Agent** - Creates smart packing lists based on weather and trip duration
- 🌱 **CO2 Agent** - Estimates carbon footprint for eco-conscious travel decisions
- 🍽️ **Culture Agent** - Offers local cuisine tips and cultural insights

## 🏗️ Architecture Overview

**Frontend**: React 18 with Vite for fast development, Tailwind CSS for modern styling, and React Router for navigation.

**Backend**: Django REST Framework provides secure JWT authentication and API endpoints. LangGraph orchestrates the multi-agent workflow with shared state management.

**AI & APIs**: Google Gemini for intelligent recommendations, Amadeus for travel data, Open-Meteo for weather forecasts.

**Database**: SQLite for development (production-ready for PostgreSQL migration).

## ✨ Key Features

### 🤖 Intelligent Planning
- **Under 2 minutes**: Complete itineraries generated using parallel agent execution
- **Personalized**: Tailored to your budget, travel style, and preferences
- **Comprehensive**: Flights, hotels, weather, activities, packing lists, and cultural insights in one place

### 🔐 User Management
- Secure JWT-based authentication
- Email verification for new accounts
- Save and manage multiple trip itineraries
- Access your plans from anywhere

### 📧 Beautiful Outputs
- Professional HTML email itineraries
- Easy sharing with travel companions
- Detailed day-by-day breakdowns
- Real-time data from trusted sources

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

### Backend Setup

```powershell
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Set up database
python manage.py makemigrations
python manage.py migrate

# Start the server
python manage.py runserver
```

Backend will be available at: `http://127.0.0.1:8000`

### Frontend Setup

```powershell
cd "trip_planner frontend"

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## ⚙️ Configuration

### Backend Environment (`backend/.env`)

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True

# API Keys (Required)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### Frontend Environment (`trip_planner frontend/.env`)

```env
VITE_API_BASE=http://127.0.0.1:8000
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Getting API Keys

- **Amadeus API**: [Sign up here](https://developers.amadeus.com/)
- **Google Gemini**: [Get API key](https://ai.google.dev/)
- **Google Places**: [Get API key](https://developers.google.com/maps/documentation/places/web-service/get-api-key)

## 📡 API Endpoints

### Authentication
- `POST /api/accounts/register/` - Create new account
- `POST /api/accounts/login/` - Sign in and get JWT tokens
- `POST /api/accounts/token/refresh/` - Refresh access token

### Trip Planning
### Trip Planning
- `POST /api/planner/generate/` - Generate new itinerary from preferences
- `POST /api/planner/save/` - Save itinerary to user account
- `POST /api/planner/approve/` - Approve and email itinerary
- `GET /api/planner/history/` - Get user's saved trips
- `DELETE /api/planner/delete/<id>/` - Delete saved itinerary

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icon library

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API toolkit
- **LangGraph** - Agent orchestration
- **Simple JWT** - Authentication
- **SQLite** - Database (dev)

### AI & External Services
- **Google Gemini AI** - Natural language processing
- **Amadeus API** - Flight and hotel data
- **Open-Meteo** - Weather forecasts
- **Google Places** - Location autocomplete

## 🐛 Troubleshooting

### CORS Errors
Ensure `http://localhost:5173` is in `CORS_ALLOWED_ORIGINS` in `backend/backend/settings.py` (already configured).

### Missing Environment Variables
Check that `backend/.env` exists and contains required API keys. For development, some keys are optional with safe fallbacks.

### Frontend Cannot Reach Backend
Verify `VITE_API_BASE` in frontend `.env` points to `http://127.0.0.1:8000` (correct hostname/port).

### Database Migration Issues
Run `python manage.py makemigrations` followed by `python manage.py migrate --run-syncdb`.

## 👥 Team

Built with ❤️ by Fusemachines AI Fellowship Team:

- **Manjila Pandey** - Backend Architecture & AI Orchestration
- **Nibida Ghimire** - Frontend Development & UI/UX Design
- **Riyaj Nepal** - AI Agent Development & Testing
- **Sadhana Sapkota** - Database Design & Documentation

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with focused commits
4. Add or update tests when changing behavior
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please follow the existing code style and keep commits small and descriptive.

## 🚀 Future Enhancements

- Real-time price tracking and alerts
- Mobile app (React Native)
- Multi-language support
- Group trip planning features
- Direct booking integration
- PostgreSQL migration for production
- Docker containerization
- CI/CD pipeline

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


---

**Questions or Issues?** Open an issue on GitHub or reach out to the team!

**Repository**: [github.com/fuseai-fellowship/Agentic-AI-Travel-Assistant](https://github.com/fuseai-fellowship/Agentic-AI-Travel-Assistant)
