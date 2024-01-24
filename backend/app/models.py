from . import db

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100))
    published_year = db.Column(db.String(4))
    isbn = db.Column(db.String(13))
    category = db.Column(db.String(100))
    remarks = db.Column(db.Text)
    image_path = db.Column(db.String(255))  # 画像ファイルのパス

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)