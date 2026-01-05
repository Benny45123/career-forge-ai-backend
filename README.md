# 🚀 CareerForge AI — Backend Engine

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
</p>

---

### 🌐 Live Infrastructure
> **Architecture:** The backend is deployed on **Render**, serving as a high-performance API for the **Vercel** live production frontend.
* **Production Frontend:** `https://careerforge-ai-next.vercel.app/`

---

### ✨ Key Capabilities
* 🧠 **AI Resume Scoring:** Real-time analysis of resumes using Google Gemini.
* 📝 **Cover Letter Automation:** Context-aware generation based on job descriptions.
* 🔐 **Secure Auth:** JWT-based protection using a custom `SECRET_KEY`.
* 🗄️ **Data Persistence:** Optimized schema design in MongoDB for user profiles and history.

---

### ⚙️ Environment Configuration
To run this project locally or in production, ensure the following keys are set:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google Generative AI access key. |
| `SECRET_KEY` | Private key for JWT signing and sessions. |
| `MONGO_URI` | MongoDB Atlas connection string. |
| `PORT` | The port your server listens on (default: 3000). |

---

### 📦 Installation & Local Development

Follow these steps to get your development environment running:

#### 1️⃣ Clone the Repository
```bash
git clone [https://github.com/Benny45123/career-forge-ai-backend.git](https://github.com/Benny45123/career-forge-ai-backend.git)
cd career-forge-ai-backend
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Setup Environment
Create a .env file in the root directory:
```bash
touch .env
# Open .env and add your GEMINI_API_KEY, SECRET_KEY, MONGO_URI, and PORT
```
### 4️⃣ Launch Server
```bash
# For production start
npm start

# For development (with hot-reload if using nodemon)
npm run dev
```
## 🛣️ API Documentation
| Action | Route | Method |
| :--- | :--- | :--- |
| Analyze | /api/analyze-resume | POST |
| Generate | /api/generate-cover-letter | POST |

## 🛡️ Security Protocol
* **CORS Policy:** Restricted to your specific Vercel production domain.

* **Data Safety:** All environment variables are hidden; no keys are committed to the repository.

* **Error Handling:** Centralized middleware for catching and logging API exceptions.
