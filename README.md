🎓 CampusGuide AI — Student Onboarding Assistant

AI-powered onboarding assistant for engineering colleges that answers student queries using official uploaded documents through Retrieval Augmented Generation (RAG).

📌 Problem

Newly admitted students face confusion during onboarding:

Documents required

Fees & deadlines

LMS access

Hostel process

Multiple offices & portals

Colleges repeatedly answer the same questions manually.

💡 Solution

CampusGuide AI is a digital college assistant that provides accurate answers using uploaded institutional documents instead of hardcoded responses.

When admin uploads a notice → AI instantly learns → students get correct answers.

No retraining required.

🤖 Key Features

Natural language chat assistant

Dynamic RAG document retrieval

Admin document upload panel

Personalized student guidance

Source citation in responses

Dark/light professional UI

🧠 How RAG Works

Admin uploads college notice

System processes and indexes document

Student asks question

AI retrieves relevant content

AI generates accurate response

This ensures answers always come from official data.

🏗 Architecture

Frontend → Node Backend → Vector Store → Groq LLM → Response

AI provides reasoning
Documents provide knowledge

▶️ How to Run
Backend
cd server
npm install
npm start

Frontend

Open:

client/index.html

🧪 Demo (For Judges)

Ask: "What is scholarship deadline?" → AI unsure

Admin uploads notice

Ask again → AI answers correctly

Shows source badge → proves RAG

🛠 Tech Stack

HTML, CSS, JavaScript

Node.js, Express

Groq LLaMA 3.3

Custom Vector Store

Retrieval Augmented Generation

CampusGuide AI acts as a digital college help desk powered by real institutional data.
