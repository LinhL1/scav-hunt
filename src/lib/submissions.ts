import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface SubmitPhotoParams {
  userId: string;
  username: string;
  userAvatar: string;
  promptId: string;
  promptText: string;
  promptDate: string;
  photo: File;
  caption: string;
  // Add these from your Gemini validation
  isValid: boolean;
  aiFeedback: string;
  altText: string;
}

export async function submitPhoto(params: SubmitPhotoParams) {
  const { 
    userId, username, userAvatar, promptId, promptText, promptDate, 
    photo, caption, isValid, aiFeedback, altText 
  } = params;

  try {
    // 1. Upload photo to Storage
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomId}.jpg`;
    const storagePath = `submissions/${userId}/${fileName}`;
    
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, photo);
    
    // 2. Get download URL
    const photoUrl = await getDownloadURL(storageRef);
    
    // 3. Create submission in Firestore with Gemini validation results
    const submissionRef = await addDoc(collection(db, 'submissions'), {
      userId,
      username,
      userAvatar,
      promptId,
      promptText,
      promptDate,
      photoUrl,
      caption,
      likes: 0,
      likedBy: [],
      isValid,
      aiFeedback,
      altText,
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return {
      submissionId: submissionRef.id,
      isValid,
      feedback: aiFeedback,
      altText
    };
  } catch (error) {
    console.error('Error submitting photo:', error);
    throw error;
  }
}

// Like/unlike a submission
export async function toggleLike(submissionId: string, userId: string, currentlyLiked: boolean) {
  const submissionRef = doc(db, 'submissions', submissionId);
  
  if (currentlyLiked) {
    await updateDoc(submissionRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    await updateDoc(submissionRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
  }
}