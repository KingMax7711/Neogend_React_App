# 🛡️ Neogend-FRP

A **fictional replica of the Neogend system** used by the French Gendarmerie, designed to enhance roleplay immersion within RP servers.
Neogend-FRP reproduces the interface and key functionalities of the real Neogend, adapted for a gaming and RP environment.

---

## 🚀 Overview

**Neogend-FRP** provides players and administrators with an in-game digital workspace to manage reports, investigations, and official documents — just like real officers do.
It aims to bring **structure, realism, and immersion** to law enforcement roleplay scenarios.

**Main objective:** faithfully reproduce Neogend’s features while maintaining flexibility for RP use.

---

## ⚙️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS + DaisyUI
* **State Management:** Zustand
* **Routing:** React Router
* **Form Handling:** React Hook Form
* **HTTP Client:** Axios
* **Backend:** FastAPI (separate repository)
* **Database:** PostgreSQL
* **Deployment:** Docker Compose

---

## 🔐 User Roles & Access

| Role              | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| **Owner**         | Full control over the application                            |
| **Administrator** | Manages users, validations, and global settings              |
| **Moderator**     | Oversees user activity and assists with administrative tasks |
| **User**          | Access to RP functionalities (reports, documents, etc.)      |

### Account Management

Accounts are created **exclusively by owners or administrators**.
Users complete their personal data upon first login, followed by a validation phase by an admin.

---

## 🧩 Features

* Access to **Neofic files**
* Drafting and managing **official reports (Procès Verbaux)**

> Future features (see [Roadmap](#-roadmap)) will further expand report and investigation capabilities.

---

## 🌐 Deployment

Neogend-FRP is designed for **deployment and hosting** in a production environment.

**Deployment method:** Docker Compose
**Production URL:** [https://neogend-frp.fr](https://neogend-frp.fr)

---

## ⚠️ Environment & Security

This project uses environment variables for API and database configuration.

> These values are **not public** and must **never be shared or committed** to version control.

---

## 🧭 Internal Logic

* **User sessions** are handled with Zustand stores
* **API communication** via Axios requests to the FastAPI backend

---

## 🧱 Roadmap

Planned or upcoming features include:

* Report drafting:

  * Offense reports
  * Custody and detention reports
  * Vehicle impound and immobilization reports
  * Seizure reports
  * License retention reports
* Investigation management within Neogend
* Community suggestions through the dedicated `#suggestion` forum

---

## 🪪 Version & License

**Version:** 1.0 (Initial Release)

**License:** This project and its content are the exclusive property of Maxime Czegledi.
Any use, modification, redistribution, or reproduction — in part or in full — is strictly prohibited without prior written authorization from the author.

© 2025 **Maxime Czegledi**
All rights reserved.

---

## 🤝 Contributing

Contributions are welcome!
You can submit:

* **Pull Requests** for improvements or bug fixes
* **Issues** for bug reports or feature suggestions

---

## 📸 Credits

* **Photos:** © Gendarmerie Nationale (used for illustrative purposes)
* **Frameworks & Libraries:** React, Tailwind CSS, DaisyUI, Zustand, React Router, React Hook Form, Axios

---

## 🧾 Changelog

**v1.0 – Initial Release**

* Base React app with Tailwind/DaisyUI setup
* User session management (Zustand)
* API communication via Axios
* Initial role and authentication system

---

## 🧷 Badges

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-Custom-lightgrey.svg)

---

## 🧩 Notes

This project is **fictional** and **not affiliated** with the official Gendarmerie Nationale.
It is intended **solely for RP and educational purposes**.
