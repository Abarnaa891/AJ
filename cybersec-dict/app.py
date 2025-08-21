import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# Global extensions
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'



from flask import Flask
from extensions import db, login_manager

def create_app():
    app = Flask(__name__)

    # App config
    app.config['SECRET_KEY'] = 'super-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 🔑 This is where we bind the extensions
    db.init_app(app)
    login_manager.init_app(app)

    return app

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{os.path.join(app.instance_path, 'app.db')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    login_manager.init_app(app)

    # Import models so create_all can see them
    from models import User, DictionaryEntry, saved_words

    with app.app_context():
        db.create_all()
        seed_terms_if_needed()

    # Register blueprints
    from routes_auth import auth_bp
    from routes_dict import dict_bp
    from routes_profile import profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dict_bp)
    app.register_blueprint(profile_bp)

    # Home route
    from flask import render_template

    @app.route('/')
    def index():
        return render_template('index.html')

    return app


@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))


def seed_terms_if_needed():
    from models import DictionaryEntry
    if DictionaryEntry.query.count() > 0:
        return
    sample_terms = [
        {
            'term': 'Confidentiality',
            'content': 'Ensures information is accessible only to those authorized to have access.',
            'category': 'Core Principles'
        },
        {
            'term': 'Integrity',
            'content': 'Maintaining and assuring the accuracy and completeness of data over its entire lifecycle.',
            'category': 'Core Principles'
        },
        {
            'term': 'Availability',
            'content': 'Ensuring authorized users have reliable and timely access to information and systems when needed.',
            'category': 'Core Principles'
        },
        {
            'term': 'Authentication',
            'content': 'Verifying the identity of a user, process, or device, often as a prerequisite to allowing access to resources.',
            'category': 'Identity & Access Management'
        },
        {
            'term': 'Authorization',
            'content': 'Granting or denying specific permissions to an authenticated identity to access resources.',
            'category': 'Identity & Access Management'
        },
        {
            'term': 'Accounting (Auditing)',
            'content': 'Tracking user and system activities for accountability through logs and audit trails.',
            'category': 'Identity & Access Management'
        },
        {
            'term': 'Multi-Factor Authentication (MFA)',
            'content': 'Authentication that requires two or more verification factors: something you know, have, or are.',
            'category': 'Identity & Access Management'
        },
        {
            'term': 'Principle of Least Privilege',
            'content': 'Users and systems should have the minimum access necessary to perform their tasks.',
            'category': 'Security Architecture'
        },
        {
            'term': 'Zero Trust',
            'content': 'Security model that assumes breach and verifies explicitly, uses least privilege, and assumes no implicit trust.',
            'category': 'Security Architecture'
        },
        {
            'term': 'Encryption',
            'content': 'Process of converting information into ciphertext to prevent unauthorized access.',
            'category': 'Cryptography'
        },
        {
            'term': 'Symmetric Encryption',
            'content': 'Encryption using the same key for encryption and decryption (e.g., AES).',
            'category': 'Cryptography'
        },
        {
            'term': 'Asymmetric Encryption',
            'content': 'Encryption using a key pair (public/private), enabling key exchange and digital signatures (e.g., RSA, ECC).',
            'category': 'Cryptography'
        },
        {
            'term': 'Hash Function',
            'content': 'One-way function that maps data to a fixed-size digest (e.g., SHA-256). Used for integrity verification.',
            'category': 'Cryptography'
        },
        {
            'term': 'Digital Signature',
            'content': 'Cryptographic mechanism for authenticity, integrity, and non-repudiation using asymmetric keys.',
            'category': 'Cryptography'
        },
        {
            'term': 'Phishing',
            'content': 'Social engineering attacks that trick users into revealing sensitive information or installing malware.',
            'category': 'Threats'
        },
        {
            'term': 'Malware',
            'content': 'Software designed to disrupt, damage, or gain unauthorized access to systems (e.g., viruses, worms, ransomware).',
            'category': 'Threats'
        },
        {
            'term': 'Ransomware',
            'content': 'Malware that encrypts victim data and demands payment for decryption.',
            'category': 'Threats'
        },
        {
            'term': 'SQL Injection',
            'content': 'Injection attack that manipulates SQL queries to access or corrupt database data.',
            'category': 'Application Security'
        },
        {
            'term': 'Cross-Site Scripting (XSS)',
            'content': 'Injecting malicious scripts into trustworthy websites viewed by other users.',
            'category': 'Application Security'
        },
        {
            'term': 'Cross-Site Request Forgery (CSRF)',
            'content': 'Forces a user to execute unwanted actions on a web application in which they are authenticated.',
            'category': 'Application Security'
        },
        {
            'term': 'Vulnerability',
            'content': 'A weakness in a system that can be exploited by threats.',
            'category': 'Risk Management'
        },
        {
            'term': 'Exploit',
            'content': 'Code or technique that takes advantage of a vulnerability to compromise a system.',
            'category': 'Risk Management'
        },
        {
            'term': 'Risk',
            'content': 'The potential for loss or damage when a threat exploits a vulnerability, considering likelihood and impact.',
            'category': 'Risk Management'
        },
        {
            'term': 'Patch Management',
            'content': 'Process of acquiring, testing, and installing patches to mitigate vulnerabilities.',
            'category': 'Operations'
        },
        {
            'term': 'Security Information and Event Management (SIEM)',
            'content': 'Solutions that provide real-time analysis of security alerts generated by network hardware and applications.',
            'category': 'Monitoring'
        },
        {
            'term': 'Intrusion Detection System (IDS)',
            'content': 'Monitors network/system activities for malicious actions or policy violations.',
            'category': 'Monitoring'
        },
        {
            'term': 'Intrusion Prevention System (IPS)',
            'content': 'Proactively blocks or prevents detected threats, often inline with network traffic.',
            'category': 'Monitoring'
        },
        {
            'term': 'Defense in Depth',
            'content': 'Layered security controls across technology, processes, and people to reduce risk.',
            'category': 'Security Architecture'
        },
        {
            'term': 'Network Segmentation',
            'content': 'Dividing networks into subnetworks to improve performance and security isolation.',
            'category': 'Network Security'
        },
        {
            'term': 'Firewall',
            'content': 'Controls network traffic based on predetermined security rules.',
            'category': 'Network Security'
        },
        {
            'term': 'VPN',
            'content': 'Virtual Private Network that creates an encrypted tunnel over an untrusted network.',
            'category': 'Network Security'
        },
    ]
    for item in sample_terms:
        entry = DictionaryEntry(term=item['term'], content=item['content'], category=item['category'])
        db.session.add(entry)
    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)