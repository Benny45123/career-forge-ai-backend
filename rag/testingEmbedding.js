require('dotenv').config({path:'../.env'});
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  // Use the same model
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001"});
  const text = [
    'BENNYHINN BEZAWADA\n' +
      '    sunnyashish41@gmail.com\n' +
      '     \n' +
      '    6300659698\n' +
      '     \n' +
      '    BENNY HINN BEZAWADA\n' +
      '     \n' +
      '    Benny45123\n' +
      '     \n' +
      '    Profile\n' +
      '    Full-Stack  Developer  and  BTech  Computer  Science  student  with  a  specialization  in  IoT,  Cybersecurity,  and  Blockchain\n' +
      '    Technology. Experienced in building scalable MERN stack applications using RESTful APIs and implementing DevOps practices',
    'such as CI/ CD pipelines with GitHub Actions and self-hosted runners, Docker-based containerization, and version control with\n' +
      '    Git.  Possess  a  strong  foundation  in  Data  Structures  and  Database  Management  Systems,  with  a  focus  on  solving  real-world\n' +
      '    problems through efficient, production-ready solutions.\n' +
      '    Education\n' +
      '    VVIT, BTech in CSE (IOT,CyberSecurity and BCT)\n' +
      '    CGPA : 8.1/ 10.0\n' +
      '    09/2023 – Present\n' +
      '    Guntur',
    '09/2023 – Present\n' +
      '    Guntur\n' +
      '    Andhra Christian College, Intermediate (MPC Stream)\n' +
      '    Percentage: 57.4%(574/ 1000)\n' +
      '    2021 – 2023\n' +
      '    Guntur\n' +
      '    St. Luke’s School, SSC\n' +
      '    Percentage: 83.5% (501 /  600)\n' +
      '    2020 – 2021\n' +
      '    Guntur\n' +
      '    Projects\n' +
      '    CareerForgeAi  -  AI Powered Resume Analyzer and  Cover Letter Generator \n' +
      '    Developed a full-stack web application for analyzing resumes for ATS compatibility and generating AI-based cover letters. The',
    'platform supports PDF uploads, extracts skills and experience, and provides job-specific recommendations. Implemented user\n' +
      '    authentication  with  OTP  verification,  secure  sessions,  and  rate-limiting.  Deployed  the  frontend  on  Vercel  and  the  backend  on\n' +
      '    Render.\n' +
      '    Technologies  Used:  Next.js,  Tailwind  CSS,  React,  Node.js,  Express.js,  MongoDB,  Multer,  Google  Generative  AI(Gemini  LLM',
    'Integration), Vercel(frontend), Render(backend), CI/ CD pipelines, rate-limiting\n' +
      '    CampusConnect  -  Connecting students through stories, ideas, and collaborative learning \n' +
      '    CampusConnect  is  a  full-stack  content-sharing  platform  where  users  can  create,  publish,  and  save  articles  while  interacting\n' +
      '    through claps and social features. Built with React and Tailwind CSS on the frontend, and Node.js, Express.js, and MongoDB with',
    'Redis  caching  on  the  backend.  It  implements  JWT  authentication,  rate  limiting,  Cloudinary  image  uploads,  and  optimized\n' +
      '    content  handling.  CI/ CD  is  automated  using  GitHub  Actions  with  Docker,  deploying  to  AWS  EC2  via  a  self-hosted  runner  for\n' +
      '    seamless continuous deployment.\n' +
      '    Technologies   Used:   AWS-EC2(Cloud-Deploy),   GitHub-Actions(CI/ CD),   Node.js,   Express.js,   Rate-Limiting,   Redis(Caching),',
    'Cloudinary(Cloud Storage), Docker(Containerization), DockerHub, Self-Hosted GitHub Runner, CORS , Vercel(Frontend)\n' +
      '    Technical Skills\n' +
      '    Languages & Frameworks\n' +
      '    C,   Java,   Python,   JavaScript,   TypeScript,   React.js,   Next.js,\n' +
      '    Node.js, Express.js\n' +
      '    Tools & Technologies\n' +
      '    Git (Version Control), GitHub, VS Code, Postman, Cloudinary\n' +
      '    DevOps & Cloud\n' +
      '    Docker,   GitHub   Actions   (CI/ CD),   AWS   EC2   (Self-Hosted\n' +
      '    Runner), Docker Hub, Vercel, Render',
    'Runner), Docker Hub, Vercel, Render\n' +
      '    Core Concepts\n' +
      '    Data Structures and Algorithms, Object-Oriented\n' +
      '    Programming (OOP), Database Management Systems (DBMS),\n' +
      '    Operating  Systems,  Computer  Networks,  REST  API  Design,\n' +
      '    Authentication & Authorization (JWT)\n' +
      '    Databases & Caching\n' +
      '    MongoDB, Mongoose, SQL, Redis\n' +
      '    Certificates\n' +
      '    Python Basics for Data Science - IBM, \n' +
      '    2024 \n' +
      '    Basics of Full Stack Development-\n' +
      '    Simplilearn \n' +
      '    Joy of computing using Python-',
    'Joy of computing using Python-\n' +
      '    NPTEL,2025\n' +
      '    OOPS through Java-Codetantra \n' +
      '    Palo Alto CyberSecurity Virtual \n' +
      '    Internship,2025 \n' +
      '    MongoDB Node.js Developer Path-\n' +
      '    MongoDB,2025 \n' +
      '    Awards\n' +
      '    Gold Medalist – CodeVerse – Oct 2025 , Organized By Spaardha ACM (College-Level Tech Event)\n' +
      '    Solved advanced DSA problems under time constraints and ranked 1st among college participants.\n' +
      '    Participation - Internal Hackathon for SIH - 2025 , Conducted at College Level for SIH 2025',
    'Silver Medal - CodeSwap - Oct 2025 , Organized By IEEE (College-Level Tech Event)\n' +
      '     — Competent\n' +
      '     — Competent\n' +
      '     — Competent\n' +
      '     — Competent\n' +
      '     — Competent\n' +
      '    \n' +
      '    ATS Score : 90'
  ];
  const texts = text.map((t) => {
    return t.split('\n')          // Split into individual lines
            .map(line => line.trim()) // Trim each line individually
            .filter(line => line.length > 0) // Remove empty lines
            .join('\n');          // Put it back together
});
  try {
    console.log("Extracted Texts for Embedding:", texts);
    const result = await model.embedContent(texts);
    console.log("Raw Vector:", result.embedding.values.slice(0, 5));
    console.log("Vector Dimensions:", result.embedding.values.length);
  } catch (err) {
    console.error("API ERROR:", err.message);
  }
}

run();