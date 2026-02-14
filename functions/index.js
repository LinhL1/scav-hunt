const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.validateSubmission = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { photoBase64, promptText, submissionId } = data;

  if (!photoBase64 || !promptText || !submissionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: photoBase64,
          mimeType: "image/jpeg"
        }
      },
      `You are validating whether a photo matches a prompt for a photo scavenger hunt game.

Prompt: "${promptText}"

Analyze the image and determine:
1. Does this photo match the prompt? (be generous - creative interpretations are OK)
2. Generate encouraging feedback (2-3 sentences, friendly and warm)
3. Generate an accessibility alt text description (1 sentence)

Respond in this EXACT JSON format:
{
  "isValid": true/false,
  "feedback": "Your encouraging feedback here",
  "altText": "Brief description for screen readers"
}`
    ]);

    const responseText = result.response.text();
    const parsedResult = JSON.parse(responseText);

    // Update the submission in Firestore
    await admin.firestore().collection('submissions').doc(submissionId).update({
      isValid: parsedResult.isValid,
      aiFeedback: parsedResult.feedback,
      altText: parsedResult.altText,
      validatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      isValid: parsedResult.isValid,
      feedback: parsedResult.feedback,
      altText: parsedResult.altText,
    };
  } catch (error) {
    console.error('Error validating submission:', error);
    throw new functions.https.HttpsError('internal', 'Failed to validate submission');
  }
});