# SmartCal — AI-Powered Intelligent Calendar & Event Manager

SmartCal is a modern, AI-powered intelligent calendar and event management system tailored for students and busy professionals. It automates the extraction and organization of events from unstructured sources including **Web URLs, PDF Circulars, Poster Images, and Plain Text Announcements**.

---

## Visual Design System & Aesthetics
- **Exact Color Palette**:
  - `#F8F3D9` — Light Cream Canvas / App Background
  - `#EBE5C2` — Soft Sand / Bento Grid Surface
  - `#B9B28A` — Muted Gold / Olive Accents & Borders
  - `#504B38` — Deep Espresso / High Contrast Typography
- **Glassmorphism (Glassify)**: Frosted translucent cards (`backdrop-blur-md`, subtle glowing borders, layered elevation).
- **Bento Grid Layout**: Responsive modular bento tiles providing instant glanceability.
- **Zero Emojis**: 100% Vector Lucide icons used throughout the interface.

---

## Tech Stack & Architecture

### Backend
- **Framework**: Java 21+ & Spring Boot 3.3.6 (Maven)
- **Database**: MySQL 8.0 with Spring Data JPA & Hibernate
- **Security**: Spring Security 6, Stateless JWT Tokens (`jjwt`), BCrypt Password Hashing
- **Scraping & Parsing**:
  - `Jsoup` for clean DOM extraction
  - `Apache PDFBox 3.0` for PDF text extraction
  - `OCR Engine` for image/poster text extraction
- **AI Extraction Engine**: Groq (Llama 3.3 70B) & Gemini Flash with built-in heuristic NLP fallback
- **DSA Modules**:
  - `HashMap<LocalDate, List<Event>>` date indexing for O(1) collision queries
  - `PriorityQueue<EventDeadlineItem>` for deadline prioritization
  - `Queue<Notification>` for scheduled alert dispatching
  - Interval math: `StartA < EndB && StartB < EndA` for conflict detection

### Frontend
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS configured with custom SmartCal tokens & Glassmorphic utilities
- **Animations**: Framer Motion
- **Icons**: `lucide-react` (clean vector SVGs, 0 emojis)
- **Routing**: `react-router-dom` v6
- **HTTP Client**: Axios with Bearer JWT interceptors

---

## Running Locally

### 1. Backend (Spring Boot)
```bash
cd Backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`.
Health endpoint: `GET http://localhost:8080/api/health`.

### 2. Frontend (React + Vite)
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build
```

---

## Deployment Guide

### Deploying Frontend to Vercel
1. Link the `Frontend` directory to Vercel.
2. Set Environment Variable: `VITE_API_URL=https://your-backend-render-service.onrender.com/api`.
3. `vercel.json` is included for client-side SPA routing.

### Deploying Backend to Render
1. Create a **Web Service** on Render pointing to your repository.
2. Choose **Docker** environment and point Dockerfile path to `docker/Dockerfile.backend` (or build context `Backend`).
3. Set Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<database>`
   - `SPRING_DATASOURCE_USERNAME`: `<db-user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db-password>`
   - `JWT_SECRET`: `<secure-random-256-bit-key>`
   - `GROQ_API_KEY` (Optional): `<your-groq-key>`
   - `PORT`: `8080`
