# University Assignment Manager

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=flat&logo=passport&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=flat&logo=sqlite&logoColor=white)

An interactive web application designed to streamline the workflow between teachers and students. It allows instructors to assign tasks (individual or group-based), track submissions, and grade work, while providing students with a dashboard to manage their pending assignments and view performance statistics. 

Developed as a final project for the **Web Applications I** course at **Politecnico di Torino** (2025).

![Project Screenshot](./img/student-performance-stats.png)

## 🚀 Features

### For Teachers
* **Assignment Creation:** Create open-ended questions and assign them to specific students.
* **Group Logic:** Advanced validation prevents assigning students to conflicting groups if they already share a significant workload.
* **Evaluation Dashboard:** View pending submissions and assign grades.
* **Analytics:** Track student performance with weighted averages based on group size and individual contributions.

### For Students
* **Task Management:** View and filter "Open" vs "Closed" assignments.
* **Submission System:** Submit answers directly through the application.
* **Performance Tracking:** View personal statistics and grade history.

## 🛠 Tech Stack

**Frontend:**
* ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React.js** (Vite, Functional Components, Hooks)
* ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white) **React-Bootstrap** (Responsive UI)
* ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white) **React Router** (Navigation)

**Backend:**
* ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB) **Node.js** & **Express**
* ![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=flat&logo=passport&logoColor=white) **Passport.js** (Authentication with Strategy Local & Crypto Scrypt)
* ![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=flat&logo=sqlite&logoColor=white) **SQLite** (Relational Database)


## 📦 Installation & Setup

To run this project locally, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/lucaragaglia/university-assignment-manager.git
    cd university-assignment-manager
    ```

2.  **Server Setup**
    Navigate to the server folder, install dependencies, and start the backend.
    ```bash
    cd server
    npm install
    node index.mjs
    ```
    *The server will run on http://localhost:3001*

3.  **Client Setup**
    Open a new terminal, navigate to the client folder, and start the frontend.
    ```bash
    cd client
    npm install
    npm run dev
    ```
    *The client will run on http://localhost:5173*

## 🔑 Demo Credentials

You can use the following pre-configured accounts to test the application roles:

| Role | Username (ID) | Password |
| :--- | :--- | :--- |
| **Teacher** | `t400` | `psw` |
| **Teacher** | `t401` | `psw` |
| **Student** | `s301` | `psw` |
| **Student** | `s302` | `psw` |

*(Additional students available from s301 to s320)*

## 🗄 Database Structure

The project uses a **SQLite** database with the following relationships:
* **USERS:** Stores both Students and Teachers (distinguished by Role).
* **ASSIGNMENTS:** Contains the questions, answers, scores, and status.
* **GROUPS:** Manages the many-to-many relationship between Students and Assignments.

---
*Developed by Luca Ragaglia*