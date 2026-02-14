import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getTodaysPrompts() {
  const today = new Date().toISOString().split('T')[0]; // "2025-02-14"
  
  try {
    const promptRef = doc(db, 'prompts', today);
    const promptDoc = await getDoc(promptRef);
    
    if (promptDoc.exists()) {
      return promptDoc.data().prompts;
    } else {
      console.log('No prompts for today');
      return [];
    }
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
}