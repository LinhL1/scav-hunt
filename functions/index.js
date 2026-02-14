const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

admin.initializeApp();

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic.key
});

exports.validateSubmission = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { photoUrl, promptText, submissionId } = data;

  if (!photoUrl || !promptText || !submissionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Fetch the image from Storage and convert to base64
    const bucket = admin.storage().bucket();
    const filePath = photoUrl.replace(`gs://${bucket.name}/`, '');
    const file = bucket.file(filePath);
    
    const [buffer] = await file.download();
    const base64Image = buffer.toString('base64');
    const mimeType = 'image/jpeg';

    // Call Anthropic API to validate the photo
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are validating whether a photo matches a prompt for a photo scavenger hunt game.

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
}`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(responseText);

    // Update the submission in Firestore
    await admin.firestore().collection('submissions').doc(submissionId).update({
      isValid: result.isValid,
      aiFeedback: result.feedback,
      altText: result.altText,
      validatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      isValid: result.isValid,
      feedback: result.feedback,
      altText: result.altText,
    };
  } catch (error) {
    console.error('Error validating submission:', error);
    throw new functions.https.HttpsError('internal', 'Failed to validate submission');
  }
});