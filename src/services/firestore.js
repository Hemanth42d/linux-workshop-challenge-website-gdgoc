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

export const updateUserScore = async (userId, newScore) => {
  await updateDoc(doc(db, 'users', userId), { score: newScore });
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
  const ref = await addDoc(collection(db, 'submissions'), {
    ...data,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
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

export const subscribeActivityFeed = (callback) => {
  const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ── Game State ──
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
    });
  }
};

// ── Participants count ──
export const subscribeUsers = (callback) => {
  return onSnapshot(collection(db, 'users'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
