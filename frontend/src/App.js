import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/books')
      .then(response => response.json())
      .then(data => setBooks(data.books))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setEditingBook(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBook({ ...editingBook, [name]: value });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingBook),
      });
      if (response.status === 200) {
        toast.success('書籍情報が更新されました。');
        setSelectedBook({ ...selectedBook, ...editingBook });
        setEditingBook(null);
      } else {
        toast.error('書籍情報の更新に失敗しました。');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('エラーが発生しました。');
    }
  };

  const handleEditClick = () => {
    setEditingBook({ ...selectedBook });
  };

  const handleDelete = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:5000/books/${bookId}`, {
        method: 'DELETE',
      });
      if (response.status === 200) {
        toast.success('書籍が削除されました。');
        setBooks(books.filter(book => book.id !== bookId));
        setSelectedBook(null);
      } else {
        toast.error('書籍の削除に失敗しました。');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('エラーが発生しました。');
    }
  };

  const handleCardClose = () => {
    setSelectedBook(null);
  };

  return (
    <div className="app">
      <h1>Books</h1>
      <div>
        <Link to="/isbn-registration">ISBNで登録</Link>
        <Link to="/manual-registration">手動で登録</Link>
      </div>
      <div className="book-container">
        {books.map(book => (
          <div className="card" key={book.id} onClick={() => handleCardClick(book)}>
            <img src={`http://localhost:5000/uploads/${book.image_path}`} alt="Book Cover" className="book-image" />
            <div className="book-title">{book.title}</div>
          </div>
        ))}
      </div>
      {selectedBook && (
        <div className="selected-book-overlay">
          <div className="selected-book">
            <img src={`http://localhost:5000/uploads/${selectedBook.image_path}`} alt="Book Cover" className="selected-book-image" />
            <div className="selected-book-details">
              <div className="selected-book-title">
                タイトル: {editingBook ? (
                  <input
                    type="text"
                    name="title"
                    value={editingBook.title}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.title
                )}
              </div>
              <div className="selected-book-author">
                著者: {editingBook ? (
                  <input
                    type="text"
                    name="author"
                    value={editingBook.author}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.author
                )}
              </div>
              <div className="selected-book-published-year">
                発行年: {editingBook ? (
                  <input
                    type="text"
                    name="published_year"
                    value={editingBook.published_year}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.published_year
                )}
              </div>
              <div className="selected-book-isbn">
                ISBN: {editingBook ? (
                  <input
                    type="text"
                    name="isbn"
                    value={editingBook.isbn}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.isbn
                )}
              </div>
              <div className="selected-book-category">
                カテゴリ: {editingBook ? (
                  <input
                    type="text"
                    name="category"
                    value={editingBook.category}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.category
                )}
              </div>
              <div className="selected-book-remarks">
                備考: {editingBook ? (
                  <input
                    type="text"
                    name="remarks"
                    value={editingBook.remarks}
                    onChange={handleEditChange}
                  />
                ) : (
                  selectedBook.remarks
                )}
              </div>
              {editingBook ? (
                <button className="ok-button" onClick={handleEditSubmit}>OK</button>
              ) : (
                <div>
                  <button className="edit-button" onClick={handleEditClick}>修正</button>
                  <button className="delete-button" onClick={() => handleDelete(selectedBook.id)}>削除</button>
                  <button className="back-button" onClick={handleCardClose}>戻る</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default App;
