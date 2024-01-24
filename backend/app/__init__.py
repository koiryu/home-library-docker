from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging

UPLOAD_FOLDER = '/uploads'
db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='uploads')
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MBの制限を設定（例）
    app.logger.setLevel(logging.DEBUG)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////var/data/db.sqlite'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        from .models import Book, User
        db.create_all()

    from .routes import main
    app.register_blueprint(main)

    return app
