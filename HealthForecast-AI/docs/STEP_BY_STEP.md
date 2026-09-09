# Simple Run Guide

1. Extract the ZIP.
2. Open the folder containing `backend`, `frontend`, `data`, and `models` in VS Code.
3. Open a terminal and create/activate `.venv` with Python 3.14.
4. Install `backend/requirements.txt`.
5. Start the backend from `backend` with `uvicorn app.main:app --reload`.
6. Confirm `http://127.0.0.1:8000/docs` opens.
7. Open a second terminal, enter `frontend`, run `npm install`, then `npm run dev`.
8. Open the Vite URL.
9. Enter credentials manually; the login fields start empty.
10. Test the four roles.

The supplied SQLite database is already populated with 101,766 encounters and 101,766 readmission-risk predictions. This prevents the dashboard from appearing blank on first launch.
