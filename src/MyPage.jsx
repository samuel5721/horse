// MyPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function MyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentNumber = location.state?.studentNumber;

  const [money, setMoney] = useState(0);
  const [selectedColor, setSelectedColor] = useState('red');
  const [betAmount, setBetAmount] = useState('');
  const [isBet, setIsBet] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);

  useEffect(() => {
    // 학번이 없으면 홈으로 리다이렉트
    if (!studentNumber) {
      alert('잘못된 접근입니다.');
      navigate('/');
    } else {
      // 사용자 데이터 가져오기
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'user', studentNumber);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setMoney(data.money);
            setIsBet(data.isBet || false);

            if (data.isBet) {
              // 현재 베팅 정보 저장
              setCurrentBet({
                color: data.color,
                bet: data.bet,
              });
            }
          } else {
            alert('사용자 정보를 가져올 수 없습니다.');
            navigate('/');
          }
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
          alert('데이터를 가져오는 중 오류가 발생했습니다.');
          navigate('/');
        }
      };

      fetchUserData();
    }
  }, [studentNumber, navigate]);

  const handleSubmit = async () => {
    if (betAmount === '') {
      alert('베팅 금액을 입력해주세요.');
      return;
    }

    const bet = parseInt(betAmount, 10) * 10000;

    if (isNaN(bet) || bet <= 0) {
      alert('유효한 베팅 금액을 입력해주세요.');
      return;
    }

    if (bet > money) {
      alert('보유 금액이 부족합니다.');
      return;
    }

    try {
      // 사용자 데이터 업데이트
      const docRef = doc(db, 'user', studentNumber);
      await updateDoc(docRef, {
        money: money - bet,
        color: selectedColor,
        bet: bet,
        isBet: true,
      });

      // 로컬 상태 업데이트
      setMoney((prevMoney) => prevMoney - bet);
      setBetAmount('');
      setIsBet(true);
      setCurrentBet({
        color: selectedColor,
        bet: bet,
      });

      alert('베팅이 완료되었습니다.');
    } catch (error) {
      console.error('베팅 처리 중 오류:', error);
      alert('베팅 처리 중 오류가 발생했습니다.');
    }
  };

  if (!studentNumber) {
    return <div>wrong page</div>; // 또는 로딩 스피너 등을 표시할 수 있습니다.
  }

  return (
    <div>
      <h1>{studentNumber}님, 환영합니다!</h1>
      <h2>Your Money: {money}원</h2>

      {isBet ? (
        // 베팅 현황 표시
        <div>
          <h3>현재 베팅 정보</h3>
          <p>베팅한 색상: {currentBet?.color}</p>
          <p>베팅 금액: {currentBet?.bet}원</p>
        </div>
      ) : (
        // 베팅 폼 표시
        <div>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <option value="red">빨강</option>
            <option value="yellow">노랑</option>
            <option value="green">초록</option>
            <option value="blue">파랑</option>
          </select>
          <p>이 이긴다에</p>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <p>만원</p>
          <button onClick={handleSubmit}>제출</button>
        </div>
      )}
    </div>
  );
}

export default MyPage;
