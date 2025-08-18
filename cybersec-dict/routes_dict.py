import csv
import io
import json
from typing import List

from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from flask_login import login_required, current_user

from app import db
from models import DictionaryEntry


dict_bp = Blueprint('dict', __name__, url_prefix='/dict')


@dict_bp.route('/')
@dict_bp.route('/search')
def list_terms():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    q = DictionaryEntry.query
    if query:
        like = f"%{query}%"
        q = q.filter((DictionaryEntry.term.ilike(like)) | (DictionaryEntry.content.ilike(like)))
    if category:
        q = q.filter(DictionaryEntry.category == category)
    q = q.order_by(DictionaryEntry.term.asc())
    terms = q.limit(200).all()
    categories = [c[0] for c in db.session.query(DictionaryEntry.category).distinct().all() if c[0]]
    return render_template('dict/list.html', terms=terms, q=query, category=category, categories=categories)


@dict_bp.route('/<int:entry_id>')
def detail(entry_id: int):
    entry = DictionaryEntry.query.get_or_404(entry_id)
    is_saved = False
    if current_user.is_authenticated:
        is_saved = current_user.saved_entries.filter_by(id=entry.id).first() is not None
    return render_template('dict/detail.html', entry=entry, is_saved=is_saved)


@dict_bp.route('/save/<int:entry_id>', methods=['POST'])
@login_required
def save_entry(entry_id: int):
    entry = DictionaryEntry.query.get_or_404(entry_id)
    if not current_user.saved_entries.filter_by(id=entry.id).first():
        current_user.saved_entries.append(entry)
        db.session.commit()
        flash('Saved to your words.', 'success')
    return redirect(url_for('dict.detail', entry_id=entry.id))


@dict_bp.route('/unsave/<int:entry_id>', methods=['POST'])
@login_required
def unsave_entry(entry_id: int):
    entry = DictionaryEntry.query.get_or_404(entry_id)
    if current_user.saved_entries.filter_by(id=entry.id).first():
        current_user.saved_entries.remove(entry)
        db.session.commit()
        flash('Removed from your saved words.', 'info')
    return redirect(url_for('dict.detail', entry_id=entry.id))


@dict_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_terms():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or file.filename == '':
            flash('Please choose a file to upload.', 'warning')
            return render_template('dict/upload.html')
        filename = file.filename.lower()
        try:
            imported = 0
            if filename.endswith('.csv'):
                stream = io.StringIO(file.stream.read().decode('utf-8', errors='ignore'))
                reader = csv.DictReader(stream)
                rows = list(reader)
                imported = _import_rows(rows)
            elif filename.endswith('.json'):
                data = json.load(file.stream)
                if isinstance(data, list):
                    imported = _import_rows(data)
                else:
                    flash('JSON must be an array of objects.', 'danger')
                    return render_template('dict/upload.html')
            else:
                flash('Unsupported file type. Use CSV or JSON.', 'danger')
                return render_template('dict/upload.html')
            flash(f'Imported {imported} terms.', 'success')
            return redirect(url_for('dict.list_terms'))
        except Exception as exc:
            current_app.logger.exception('Import failed: %s', exc)
            flash('Failed to import file. Ensure headers: term, content, category.', 'danger')
    return render_template('dict/upload.html')


def _import_rows(rows: List[dict]) -> int:
    imported = 0
    for row in rows:
        term = (row.get('term') or '').strip()
        content = (row.get('content') or '').strip()
        category = (row.get('category') or '').strip() or None
        if not term or not content:
            continue
        existing = DictionaryEntry.query.filter_by(term=term).first()
        if existing:
            existing.content = content
            existing.category = category
        else:
            db.session.add(DictionaryEntry(term=term, content=content, category=category))
        imported += 1
    db.session.commit()
    return imported