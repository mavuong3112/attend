<h1 align="center">📸 Smart Attendance System using Face Recognition</h1>

<p align="center">
  🔐 AI-powered solution to automate attendance in schools and companies using facial recognition.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10+-blue?logo=python">
  <img src="https://img.shields.io/badge/frontend-react-61DAFB?logo=react">
  <img src="https://img.shields.io/badge/backend-flask-black?logo=flask">
  <img src="https://img.shields.io/badge/opencv-AI%20Vision-orange?logo=opencv">
</p>

---

## 📘 About the Project

The **Smart Attendance System** leverages **face recognition technology** to automate and secure attendance-taking in educational and organizational environments.  
It provides a seamless, contactless, and real-time solution that overcomes the limitations of traditional and fingerprint-based systems.

> ✅ Eliminates proxy attendance  
> ✅ Fast & hygienic check-in  
> ✅ Accurate and real-time logging  
> ✅ Educational application of AI + Web Tech

---

## 🧠 Key Features

- 👤 Register users with facial data
- 📷 Real-time face scanning and recognition
- 🕒 Log attendance with timestamps
- 📊 Attendance result feedback
- 🔐 Validation & error handling
- 🌐 Modern full-stack architecture (React + Flask)

---

## ⚙️ Tech Stack

| Layer       | Technologies                          |
|-------------|---------------------------------------|
| Frontend    | ReactJS, JavaScript, HTML/CSS         |
| Backend     | Flask, Flask-CORS                     |
| AI Engine   | OpenCV (LBPH Face Recognizer)         |
| Data Format | base64-encoded images                 |
| Storage     | Local filesystem, JSON (can extend DB)|
| Tools       | VS Code, PyCharm                      |

---
- frontend react typescript
- Use NODE_OPTIONS=--openssl-legacy-provider npm start
- Port 3000
- backend model open cv2 python
- Port 1748
- database postgresql
- Port 5432
local host only


<img width="1440" alt="image" src="https://github.com/user-attachments/assets/41a71399-ff4b-44ef-868d-1f938a307c2a" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/841e41ed-5b6d-4552-8cf4-7f853163ad51" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/d9168b93-a699-452c-baf1-049fcdb6621e" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/94718c3a-e2db-416f-968d-218ebf37415d" />
## 🧩 System Architecture

```plaintext
+-------------+         POST         +-------------+         Predict
|   ReactJS   |  /collect, /train → |    Flask     | →──────→ Face Model (LBPH)
|   Frontend  | ←───────────────    |   Backend    | ←──────← Images (.jpg)
+-------------+     Response         +-------------+     Save .csv/.json logs


