# 📘 Examination Management System (EMS)

A scalable, secure, and role-based web application designed to manage the end-to-end lifecycle of college examination papers — from submission to approval to time-restricted access. EMS streamlines exam paper workflows for institutions using **React.js**, **Supabase**, and **Google Drive**.

---

## 🔧 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Styled Components
- **Form & State Management**: React Hook Form, React Query
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **File Storage**: Google Drive API with institutional account
- **Routing**: React Router DOM (Declarative routing with role-based redirection)

---

## 🎯 Project Goals

- Replace unstructured and manual exam workflows (Google Forms, email)
- Provide structured, secure document handling per academic scheme
- Role-based access control for upload, approval, locking, and downloading
- Time-restricted, one-time download access for confidential exam material
- Scalable cloud-based storage with automated folder creation and mapping

---

## 🔐 Roles and Permissions

| Role          | Capabilities                                                     |
| ------------- | ---------------------------------------------------------------- |
| **Faculty**   | Upload papers and schemes; view/edit own submissions before lock |
| **CoE**       | Approve, reject, forward to BoE; lock final versions             |
| **BoE**       | Scrutinize by department; approve or request corrections         |
| **Principal** | Download locked papers within 30 minutes of exam                 |

---

## 🔄 Workflow Overview

1. **Faculty** uploads QP & SoV after selecting scheme, semester, dept, subject
2. **CoE** approves or rejects the submission
3. **BoE** scrutinizes papers by department, and can approve/request corrections
4. **CoE** locks the paper after BoE’s review
5. **Principal** gets access 30 minutes before the exam and can download once

---

## ✅ Key Features

- Dynamic form generation using `react-hook-form`
- Supabase authentication with role-based access
- Real-time UI updates with React Query
- Google Drive integration for file uploads and tracking
- Responsive UI with support for dark mode
- Status tracking (`Submitted`, `Pending-CoE`, `Locked`, etc.)

---

## ⚙️ Setup Instructions

1. Clone the repository  
   `git clone https://github.com/yourusername/ems.git`

2. Install dependencies  
   `npm install`

3. Set up environment variables in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_DRIVE_FOLDER_ID=your_root_drive_folder_id
```

4. Run the app
   `npm run dev`
