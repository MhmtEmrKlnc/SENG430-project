# Setup and Run Guide

This guide explains how to install dependencies and run the Health-AI ML Visualization Tool locally.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.10+)

## 1. Backend Setup (Django)
Navigate to the backend directory:
`cd ml_tool/ml_tool`

### Installation
Install the required Python packages (including `python-dotenv` for security):
```bash
pip install django django-cors-headers pandas scikit-learn imbalanced-learn openpyxl python-dotenv
```

### Configuration
Since the `.env` file is hidden for security, other developers need to create their own:
1. Copy `.env.example` and rename it to `.env`.
2. (Optional) Update the `SECRET_KEY` in the new `.env` file if deploying to a different environment.

### Running the Server
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000`.

## 2. Frontend Setup (React)
Open a new terminal and navigate to the frontend directory:
`cd Frontend`

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
The tool will be available at `http://localhost:5173`.

---

## Security Note for Developers
- **Environment Variables**: Local secrets are stored in `ml_tool/ml_tool/.env`. This file is ignored by Git for security.
- **Database**: The `db.sqlite3` file is also ignored to keep the repository clean of local test data.