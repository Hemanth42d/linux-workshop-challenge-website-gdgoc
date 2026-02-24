import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const addUser = async (userData) => {
  const ref = await addDoc(collection(db, 'users'), {
    ...userData,
    score: 0,
    streak: 0,
    joinedAt: new Date().toISOString(),
  });
  return ref.id;
};

export const getUser = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const subscribeLeaderboard = (callback) => {
  const q = query(collection(db, 'users'), orderBy('score', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })));
  });
};

export const updateUserScore = async (userId, newScore, streak) => {
  const data = {};
  if (newScore !== undefined) data.score = newScore;
  if (streak !== undefined) data.streak = streak;
  await updateDoc(doc(db, 'users', userId), data);
};

// ── Questions ──
export const addQuestion = async (data) => {
  const ref = await addDoc(collection(db, 'questions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateQuestion = async (id, data) => {
  await updateDoc(doc(db, 'questions', id), data);
};

export const deleteQuestion = async (id) => {
  await deleteDoc(doc(db, 'questions', id));
};

export const subscribeQuestions = (callback) => {
  const q = query(collection(db, 'questions'), orderBy('round', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const getQuestionsForRound = async (round) => {
  const q = query(collection(db, 'questions'), where('round', '==', round));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ── Submissions ──
export const submitAnswer = async (data) => {
  // Check if this is the first correct submission for this question
  let isFirstSolver = false;
  if (data.isCorrect) {
    const q = query(
      collection(db, 'submissions'),
      where('questionId', '==', data.questionId),
      where('isCorrect', '==', true),
      limit(1)
    );
    const existing = await getDocs(q);
    isFirstSolver = existing.empty;
  }

  const ref = await addDoc(collection(db, 'submissions'), {
    ...data,
    isFirstSolver,
    submittedAt: serverTimestamp(),
  });
  return { id: ref.id, isFirstSolver };
};

export const getUserSubmissionForQuestion = async (userId, questionId) => {
  const q = query(
    collection(db, 'submissions'),
    where('userId', '==', userId),
    where('questionId', '==', questionId)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const subscribeActivityFeed = (callback, feedLimit = 30) => {
  const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'), limit(feedLimit));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

const GAME_STATE_DOC = 'current';

export const getGameState = async () => {
  const snap = await getDoc(doc(db, 'gameState', GAME_STATE_DOC));
  return snap.exists() ? snap.data() : null;
};

export const subscribeGameState = (callback) => {
  return onSnapshot(doc(db, 'gameState', GAME_STATE_DOC), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
};

export const updateGameState = async (data) => {
  await setDoc(doc(db, 'gameState', GAME_STATE_DOC), data, { merge: true });
};

export const initGameState = async () => {
  const existing = await getGameState();
  if (!existing) {
    await setDoc(doc(db, 'gameState', GAME_STATE_DOC), {
      currentRound: 0,
      status: 'waiting',
      roundEndTime: null,
      currentQuestionIndex: 0,
      // Dynamic config
      challengeName: 'Linux Challenge',
      challengeTagline: 'Real-time command challenge platform',
      basePoints: 5,
      maxSpeedBonus: 15,
      hintCost: 3,
      activityFeedLimit: 30,
    });
  }
};

// ── Participants count ──
export const subscribeUsers = (callback) => {
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ── Admin Broadcast ──
export const sendBroadcast = async (message) => {
  await setDoc(doc(db, 'gameState', GAME_STATE_DOC), {
    broadcastMessage: message,
    broadcastAt: Date.now(),
  }, { merge: true });
};

export const clearBroadcast = async () => {
  await setDoc(doc(db, 'gameState', GAME_STATE_DOC), {
    broadcastMessage: null,
    broadcastAt: null,
  }, { merge: true });
};

// ── Hints ──
export const useHint = async (userId, questionId, hintCost) => {
  const cost = hintCost || 3;
  const user = await getUser(userId);
  if (!user) return false;
  const newScore = Math.max(0, (user.score || 0) - cost);
  await updateDoc(doc(db, 'users', userId), { score: newScore });
  return true;
};

// ── Submission Stats (for admin) ──
export const getSubmissionStatsForQuestion = async (questionId) => {
  const q = query(collection(db, 'submissions'), where('questionId', '==', questionId));
  const snap = await getDocs(q);
  const subs = snap.docs.map((d) => d.data());
  const total = subs.length;
  const correct = subs.filter((s) => s.isCorrect).length;
  return { total, correct, incorrect: total - correct };
};

export const subscribeSubmissions = (callback) => {
  const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
