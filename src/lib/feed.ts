import { db } from './firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

export async function getTodaysFeed(promptDate: string) {
  const q = query(
    collection(db, 'submissions'),
    where('promptDate', '==', promptDate),
    where('isValid', '==', true),
    orderBy('submittedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Real-time listener for feed
export function subscribeFeed(promptDate: string, callback: (submissions: any[]) => void) {
  const q = query(
    collection(db, 'submissions'),
    where('promptDate', '==', promptDate),
    where('isValid', '==', true),
    orderBy('submittedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(submissions);
  });
}