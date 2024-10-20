// Admin.jsx

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);

  // 비밀번호 확인 함수
  useEffect(() => {
    const checkPassword = () => {
      const password = prompt('관리자 비밀번호를 입력하세요:');
      if (password === 'your_admin_password') {
        setAuthenticated(true);
      } else {
        alert('비밀번호가 틀렸습니다.');
        window.location.href = '/'; // 홈 페이지로 리다이렉트
      }
    };

    checkPassword();
  }, []);

  // 로그 저장 함수
  const logAction = async (action) => {
    try {
      const logData = {
        action: action,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      };
      await addDoc(collection(db, 'adminLogs'), logData);
    } catch (error) {
      console.error('로그 저장 중 오류 발생:', error);
    }
  };

  // 사용자 초기화 함수
  const initializeUsers = async () => {
    // 비밀번호 목록 생성
    const passwords = {
      '01': 'bmo01',
      '02': 'duel02',
      '03': 'koo03',
      '04': 'jpop04',
      '05': 'kehahaha05',
      '06': 'ang06',
      '07': 'nigger07',
      '08': 'ssg08',
      '09': 'nam09',
      '10': 'banana10',
      '11': 'supermoon11',
      '12': 'hypertext12',
      '13': 'ttl13',
      '14': 'nomanssky14',
      '15': 'robot15',
      '16': 'song16',
      '17': 'amen17',
      '18': 'yun18',
      '19': 'dlrl19',
      '20': 'dlrl20',
      '21': 'js21',
      '22': 'noise22',
      '23': 'movie23',
      '24': 'yeeha24',
      '25': 'godchangsub25',
      '26': 'mechanic26',
      '27': 'cheese27',
      '28': 'woo28',
      '29': 'protein29',
      '30': 'ducksurgery30',
      '31': 'wutan31',
    };

    for (let num = 2401; num <= 2431; num++) {
      const studentNumber = num.toString();
      const lastTwoDigits = num % 100;
      const lastTwoStr = lastTwoDigits.toString().padStart(2, '0');

      // 비밀번호 설정
      const password = passwords[lastTwoStr];

      const userData = {
        money: 50000,
        color: 'none',
        bet: 0,
        isBet: false,
        password: password,
      };

      try {
        await setDoc(doc(db, 'user', studentNumber), userData);
        console.log(`${studentNumber}번 사용자가 초기화되었습니다.`);
      } catch (error) {
        console.error(`${studentNumber}번 사용자 초기화 중 오류 발생:`, error);
      }
    }
    alert('모든 사용자가 초기화되었습니다.');
    await logAction('사용자 초기화');
  };

  // 모든 사용자 정보 가져오기 함수
  const fetchAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'user'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 상금 분배 함수
  const distributePrizes = async () => {
    const winningColor = prompt('승리한 색상을 입력하세요 (red, yellow, green, blue):');
  
    if (!winningColor) {
      alert('승리한 색상을 입력해야 합니다.');
      return;
    }
  
    const validColors = ['red', 'yellow', 'green', 'blue'];
    if (!validColors.includes(winningColor.toLowerCase())) {
      alert('유효한 색상을 입력하세요 (red, yellow, green, blue).');
      return;
    }
  
    try {
      // 모든 사용자 정보 가져오기
      const querySnapshot = await getDocs(collection(db, 'user'));
      const userList = [];
      let totalBet = 0;
      let totalWinningBet = 0;
  
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        userList.push(userData);
        totalBet += userData.bet;
  
        if (userData.color === winningColor && userData.isBet) {
          totalWinningBet += userData.bet;
        }
      });
  
      if (totalWinningBet === 0) {
        alert('승리한 색상에 베팅한 사용자가 없습니다.');
        // 배당률 저장 (배당률 0으로 설정)
        await setDoc(doc(db, 'settings', 'latestPayoutRate'), {
          payoutRate: 0,
          timestamp: serverTimestamp(),
        });
  
        // 베팅 초기화
        for (const user of userList) {
          if (user.isBet) {
            const userRef = doc(db, 'user', user.id);
            await updateDoc(userRef, {
              bet: 0,
              color: 'none',
              isBet: false,
            });
          }
        }
        await logAction(`상금 분배 - 승리한 색상: ${winningColor} (승자 없음)`);
        return;
      }
  
      // 배당률 계산
      const payoutRate = totalBet / totalWinningBet;
  
      // 배당률 저장
      await setDoc(doc(db, 'settings', 'latestPayoutRate'), {
        payoutRate: payoutRate,
        timestamp: serverTimestamp(),
      });
  
      // 각 승리한 사용자에게 상금 분배
      for (const user of userList) {
        const userRef = doc(db, 'user', user.id);
  
        if (user.color === winningColor && user.isBet) {
          // 사용자 비율 계산
          const userShare = (user.bet / totalWinningBet) * totalBet;
  
          // 사용자 돈 업데이트
          await updateDoc(userRef, {
            money: increment(userShare),
            // 베팅 초기화
            bet: 0,
            color: 'none',
            isBet: false,
          });
  
          console.log(`${user.id}번 사용자에게 ${userShare.toFixed(2)}원이 지급되었습니다.`);
        } else if (user.isBet) {
          // 베팅 초기화
          await updateDoc(userRef, {
            bet: 0,
            color: 'none',
            isBet: false,
          });
        }
      }
  
      alert('상금 분배가 완료되었습니다.');
      await logAction(`상금 분배 - 승리한 색상: ${winningColor}, 배당률: ${payoutRate.toFixed(2)}`);
      // 사용자 목록 업데이트
      fetchAllUsers();
    } catch (error) {
      console.error('상금 분배 중 오류 발생:', error);
      alert('상금 분배 중 오류가 발생했습니다.');
    }
  };
  

  // 모든 사용자들의 isBet을 false로 변경하는 함수
  const resetIsBetForAll = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'user'));
      for (const docSnap of querySnapshot.docs) {
        const userRef = doc(db, 'user', docSnap.id);
        await updateDoc(userRef, {
          isBet: false,
        });
      }
      alert('모든 사용자의 isBet이 false로 설정되었습니다.');
      await logAction('모든 사용자 isBet 초기화');
      fetchAllUsers();
    } catch (error) {
      console.error('isBet 초기화 중 오류 발생:', error);
      alert('isBet 초기화 중 오류가 발생했습니다.');
    }
  };

  // 모든 사용자들에게 지정한 금액을 지급하는 함수
  const giveMoneyToAll = async () => {
    const amountStr = prompt('지급할 금액을 입력하세요:');
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount)) {
      alert('유효한 금액을 입력하세요.');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'user'));
      for (const docSnap of querySnapshot.docs) {
        const userRef = doc(db, 'user', docSnap.id);
        await updateDoc(userRef, {
          money: increment(amount),
        });
      }
      alert(`모든 사용자에게 ${amount}원이 지급되었습니다.`);
      await logAction(`모든 사용자에게 ${amount}원 지급`);
      fetchAllUsers();
    } catch (error) {
      console.error('돈 지급 중 오류 발생:', error);
      alert('돈 지급 중 오류가 발생했습니다.');
    }
  };

  // 통계 정보 가져오기 함수
  const fetchStatistics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'user'));
      const statsData = {
        totalBet: 0,
        totalUsers: 0,
        colorStats: {},
      };

      const validColors = ['red', 'yellow', 'green', 'blue'];

      validColors.forEach((color) => {
        statsData.colorStats[color] = {
          totalBet: 0,
          userCount: 0,
        };
      });

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        statsData.totalBet += userData.bet;
        statsData.totalUsers += 1;

        if (validColors.includes(userData.color) && userData.isBet) {
          statsData.colorStats[userData.color].totalBet += userData.bet;
          statsData.colorStats[userData.color].userCount += 1;
        }
      });

      setStats(statsData);
      await logAction('통계 정보 조회');
    } catch (error) {
      console.error('통계 정보를 가져오는 중 오류 발생:', error);
      alert('통계 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 특정 사용자의 특정 필드를 변경하는 함수
  const updateUserField = async () => {
    const userId = prompt('사용자의 학번을 입력하세요:');
    const key = prompt('변경할 필드명을 입력하세요:');
    const value = prompt('설정할 값을 입력하세요:');

    if (!userId || !key) {
      alert('학번과 필드명을 모두 입력해야 합니다.');
      return;
    }

    let parsedValue = value;

    // 숫자 변환 시도
    if (!isNaN(value)) {
      parsedValue = parseFloat(value);
    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      parsedValue = value.toLowerCase() === 'true';
    }

    try {
      const userRef = doc(db, 'user', userId);
      await updateDoc(userRef, {
        [key]: parsedValue,
      });
      alert(`${userId}번 사용자의 ${key} 값이 업데이트되었습니다.`);
      await logAction(`사용자 ${userId}의 ${key} 값 변경`);
      fetchAllUsers();
    } catch (error) {
      console.error('사용자 정보 업데이트 중 오류 발생:', error);
      alert('사용자 정보 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 로그 가져오기 함수
  const fetchLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'adminLogs'));
      const logsList = [];
      querySnapshot.forEach((doc) => {
        logsList.push({ id: doc.id, ...doc.data() });
      });
      // 시간순 정렬
      logsList.sort((a, b) => b.timestamp - a.timestamp);
      setLogs(logsList);
    } catch (error) {
      console.error('로그 정보를 가져오는 중 오류 발생:', error);
      alert('로그 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  if (!authenticated) {
    return null; // 인증되지 않은 경우 아무것도 렌더링하지 않음
  }

  return (
    <div>
      <h1>Admin Page</h1>
      <button onClick={initializeUsers}>사용자 초기화</button>
      <button onClick={fetchAllUsers}>모든 사용자 보기</button>
      <button onClick={distributePrizes}>상금 분배</button>
      <button onClick={resetIsBetForAll}>isBet 초기화</button>
      <button onClick={giveMoneyToAll}>모든 사용자에게 금액 지급</button>
      <button onClick={fetchStatistics}>통계 정보 보기</button>
      <button onClick={updateUserField}>특정 사용자 필드 변경</button>
      <button onClick={fetchLogs}>로그 보기</button>

      {/* 사용자 정보 테이블 */}
      {users.length > 0 && (
        <div>
          <h2>사용자 정보</h2>
          <table border="1">
            <thead>
              <tr>
                <th>학번</th>
                <th>Money</th>
                <th>Color</th>
                <th>Bet</th>
                <th>isBet</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.money}</td>
                  <td>{user.color}</td>
                  <td>{user.bet}</td>
                  <td>{user.isBet ? 'True' : 'False'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 통계 정보 표시 */}
      {stats && (
        <div>
          <h2>통계 정보</h2>
          <p>총 베팅 금액: {stats.totalBet}원</p>
          <p>총 사용자 수: {stats.totalUsers}명</p>
          <table border="1">
            <thead>
              <tr>
                <th>색상</th>
                <th>베팅 금액 합계</th>
                <th>베팅 인원 수</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(stats.colorStats).map((color) => (
                <tr key={color}>
                  <td>{color}</td>
                  <td>{stats.colorStats[color].totalBet}원</td>
                  <td>{stats.colorStats[color].userCount}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 로그 정보 표시 */}
      {logs.length > 0 && (
        <div>
          <h2>로그 정보</h2>
          <table border="1">
            <thead>
              <tr>
                <th>시간</th>
                <th>액션</th>
                <th>기기 정보</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp?.toDate().toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.userAgent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
