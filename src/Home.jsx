// Home.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (studentNumber === '' || password === '') {
      alert('학번과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const docRef = doc(db, 'user', studentNumber);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.password === password) {
          // 로그인 성공 시 myPage로 이동하며 학번을 state로 전달
          navigate('/myPage', { state: { studentNumber } });
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } else {
        alert('해당 학번이 존재하지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{marginLeft:'20px',}}>
      <h3>학번을 입력하세요</h3>
      <input
        type="text"
        value={studentNumber}
        onChange={(e) => setStudentNumber(e.target.value)}
      />
      <h3>비밀번호를 입력하세요</h3>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>접속</button>
    </div>
  );
}

export default Home;
