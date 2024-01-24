import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // react-toastifyからtoastをインポート
import 'react-toastify/dist/ReactToastify.css'; // CSSをインポート

function ISBNRegistration() {
  const navigate = useNavigate();
  const [isbn, setIsbn] = useState('');

  const handleISBNChange = (e) => {
    setIsbn(e.target.value);
  };

  const handleSubmit = () => {
    fetch(`http://localhost:5000/book-registration/${isbn}`, {
      method: 'POST',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('書籍の登録に失敗しました');
        }
        return response.json();
      })
      .then(data => {
        // 成功メッセージを表示
        toast.success('書籍が正常に登録されました', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
        });
  
        // 登録が完了したらトップページに戻る
        navigate('/');
      })
      .catch(error => {
        console.error('APIリクエストエラー:', error);
        // エラーメッセージを表示
        toast.error(error.message || 'APIリクエストエラーが発生しました', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
  };
  

  return (
    <div>
      <h2>ISBNで登録</h2>
      <input type="text" name="isbn" value={isbn} onChange={handleISBNChange} placeholder="ISBN" />
      <button onClick={handleSubmit}>登録</button>
      <button onClick={() => navigate('/')}>戻る</button>
    </div>
  );
}

export default ISBNRegistration;
