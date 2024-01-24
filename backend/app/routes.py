from flask import request, jsonify, Blueprint, current_app, send_from_directory
from .models import Book, db
from werkzeug.utils import secure_filename
import os
import requests
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

main = Blueprint('main', __name__)

@main.route('/books', methods=['GET'])
def get_books():
    book_list = Book.query.all()
    books = []
    for book in book_list:
        books.append({
            "id": book.id, 
            "title": book.title,
            "author": book.author,
            "published_year": book.published_year,
            "isbn": book.isbn,
            "category": book.category,
            "remarks": book.remarks,
            "image_path": book.image_path
        })
    return jsonify({"books": books})

@main.route('/books', methods=['POST'])
def add_book():
    title = request.form['title']
    author = request.form['author']
    published_year = request.form['published_year']
    isbn = request.form['isbn']
    category = request.form['category']
    remarks = request.form['remarks']

    if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
        os.makedirs(current_app.config['UPLOAD_FOLDER'])

    if 'image' in request.files:
        image = request.files['image']
        print('Received file:', image.filename)
        filename = secure_filename(image.filename)
        image.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        image_path = filename
    else:
        image_path = None

    new_book = Book(title=title, author=author, published_year=published_year, isbn=isbn, category=category, remarks=remarks, image_path=image_path)
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"id": new_book.id, "title": new_book.title, "author": new_book.author, "published_year": new_book.published_year, "isbn": new_book.isbn, "category": new_book.category, "remarks": new_book.remarks, "image_path": new_book.image_path}), 201

@main.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted successfully"}), 200

@main.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book_data = request.json
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
    book.title = book_data['title']
    book.author = book_data['author']
    book.published_year = book_data['published_year']
    book.isbn = book_data['isbn']
    book.category = book_data['category']
    book.remarks = book_data.get('remarks', book.remarks)
    db.session.commit()
    return jsonify({"message": "Book updated successfully"}), 200

@main.route('/book-info/<isbn>', methods=['GET'])
def get_book_info(isbn):
    google_books_api_url = f'https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}'
    response = requests.get(google_books_api_url)
    data = response.json()

    if data.get('totalItems', 0) > 0:
        book_info = data['items'][0]['volumeInfo']
        return jsonify({
            'title': book_info.get('title', ''),
            'author': ', '.join(book_info.get('authors', [])),
            'published_year': book_info.get('publishedDate', ''),
            'isbn': isbn,
            'category': ', '.join(book_info.get('categories', [])),
            'remarks': book_info.get('description', '')
        })
    else:
        return jsonify({}), 404

@main.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@main.route('/book-registration/<isbn>', methods=['POST'])
@main.route('/book-registration', methods=['POST'])  # ISBNが不要な場合
def register_book_by_isbn(isbn=None):
    if isbn:
        # ISBNを使って書籍情報を取得し、必要な情報を抽出
        google_books_api_url = f'https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}'
        response = requests.get(google_books_api_url)
        data = response.json()
        if data.get('totalItems', 0) > 0:
            book_info = data['items'][0]['volumeInfo']
            title = book_info.get('title', '')
            author = ', '.join(book_info.get('authors', []))
            published_year = book_info.get('publishedDate', '')
            category = ', '.join(book_info.get('categories', []))
            remarks = book_info.get('description', '')
            if "imageLinks" in book_info:
                image_url = book_info["imageLinks"].get("thumbnail")
                current_app.logger.debug(f"image_url: {image_url}")
                res = requests.get(image_url)
                if res.status_code == 200:
                    file = res.content
                    unique_id = str(uuid.uuid4())
                    filename = f"{unique_id}.png"
                else:
                    file = None
                    filename = None
            from_isbn = True
        else:
            return jsonify({"message": "Book not found"}), 404
    else:
        # ISBNが不要な場合は、リクエストから情報を取得
        title = request.form['title']
        author = request.form['author']
        published_year = request.form['published_year']
        category = request.form['category']
        remarks = request.form.get('remarks', '')
        from_isbn = False

        # 画像ファイルがあればフラグを立てる
        if 'image' in request.files:
        # if 'image' in request.files:
            file = request.files['image']
            filename = secure_filename(file.filename)
            # exist_img = True
        else:
            file = None
            filename = None
            # exist_img = False

    # 共通の関数を呼び出して書籍を登録
    try:
        new_book = register_book(title, author, published_year, category, remarks, file, filename, from_isbn)
        return jsonify({"success": True, "book_id": new_book.id}), 201  # 登録成功時のレスポンス
    except Exception as e:
        current_app.logger.debug(f"エラーメッセージ: {e}")
        return jsonify({"success": False, "message": str(e)}), 500  # エラー時のレスポンス

# マニュアル登録の関数を共通の関数として定義
def register_book(title, author, published_year, category, remarks, file, filename, from_isbn):
    if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
        os.makedirs(current_app.config['UPLOAD_FOLDER'])
    
    image_path = None

    # 画像を保存
    # 手動で登録の場合
    if from_isbn == False:
        if file:
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            image_path = filename
    # ISBNで登録の場合
    else:
        if file:
            with open(os.path.join(current_app.config['UPLOAD_FOLDER'], filename), 'wb') as f:
                f.write(file)
            image_path = filename
    

    new_book = Book(title=title, author=author, published_year=published_year, category=category, remarks=remarks, image_path=image_path)
    db.session.add(new_book)
    db.session.commit()
    return new_book
