from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from app import db

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')


@profile_bp.route('/')
@login_required
def view_profile():
    return render_template('profile.html')


@profile_bp.route('/update', methods=['POST'])
@login_required
def update_profile():
    bio = request.form.get('bio', '')
    night_mode = request.form.get('night_mode') == 'on'
    current_user.bio = bio
    current_user.night_mode = night_mode
    db.session.commit()
    flash('Profile updated.', 'success')
    return redirect(url_for('profile.view_profile'))