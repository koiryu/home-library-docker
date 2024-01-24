import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ManualRegistration() {
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    author: '',
    published_year: '',
    category: '',
    remarks: '',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const selectedFile = files[0];
      if (selectedFile) {
        // 画像ファイルのサイズを確認（キロバイト単位）とコンソールに表示
        const fileSizeInKB = selectedFile.size / 1024;
        console.log(`画像ファイルのサイズ: ${fileSizeInKB} KB`);
        if (fileSizeInKB > 0) {
          setBook({ ...book, image: selectedFile });
        } else {
          toast.error('無効な画像ファイルです', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      }
    } else {
      setBook({ ...book, [name]: value });
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(book).forEach(key => {
      if (key === "image" && book[key]) {
        formData.append(key, book[key]); // 画像をFormDataに追加
        formData.append("image_path", book[key].name); // 画像ファイル名を設定
        const fileSizeInKB = book[key].size / 1024;
        console.log(`画像ファイルのサイズ: ${fileSizeInKB} KB`);
      } else if (key !== "image") {
        formData.append(key, book[key]);
      }
    });
  
    fetch('http://localhost:5000/book-registration', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.success('書籍が正常に登録されました', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: true,
          });
          navigate('/');
        } else {
          toast.error('書籍の登録に失敗しました', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      })
      .catch(error => {
        console.error('APIリクエストエラー:', error);
        toast.error('APIリクエストエラーが発生しました', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
  };
  

  return (
    <div>
      <h2>手動で登録</h2>
      <input type="text" name="title" value={book.title} onChange={handleInputChange} placeholder="Title" />
      <input type="text" name="author" value={book.author} onChange={handleInputChange} placeholder="Author" />
      <input type="text" name="published_year" value={book.published_year} onChange={handleInputChange} placeholder="Published Year" />
      <input type="text" name="category" value={book.category} onChange={handleInputChange} placeholder="Category" />
      <input type="text" name="remarks" value={book.remarks} onChange={handleInputChange} placeholder="Remarks" />
      <input type="file" name="image" onChange={handleInputChange} />
      <button onClick={handleSubmit}>登録</button>
      <button onClick={() => navigate('/')}>戻る</button>
    </div>
  );
}

export default ManualRegistration;
