# Cybersecurity Dictionary

A Flask-based web app that provides a cybersecurity dictionary with:

- User authentication (register/login/logout)
- Browse/search terms and detailed pages
- Save favorite words
- Night mode (persisted for logged-in users)
- Profile section with editable bio and theme preference
- File upload to bulk-import dictionary terms (CSV or JSON) by authenticated users

## Quick start

1. Create and activate a virtual environment
```bash
python3 -m venv .venv && source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run the server
```bash
python app.py
```

The app will create a SQLite database (`instance/app.db`) on first run and seed sample cybersecurity terms.

## Bulk import format

- CSV headers: `term,content,category`
- JSON: array of objects with `term`, `content`, `category`

## Notes

- Uploaded files are stored under `uploads/`. Only authenticated users can upload.
- Night mode is stored on the user profile when logged-in; guests fall back to `localStorage` in the browser.