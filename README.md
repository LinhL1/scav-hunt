![caption](media/impromptu-media.gif)

# Impromptu

**Impromptu** is a social scavenger hunt app built in a 48-hour team hackathon. It won **Best Use of Gemini API** at HackBeanpot 2026, an award sponsored by MLH, which partners with Google Cloud. The app encourages users to complete daily photo challenges, explore their surroundings, and share their finds with friends, all powered by the Gemini API for real-time validation and feedback. Watch the demo [here](https://www.youtube.com/watch?v=PwlruXmhEeQ)!

## Features
- **Daily Photo Challenges**: Users receive 3 unique prompts each day to capture or upload photos.
- **AI Validation**: Integrated **Gemini API** to check image–prompt alignment and provide live feedback.
- **Social Gallery**: View friends’ submissions and maintain streaks.
- **Responsive UI**: Built with **React**, styled with **Tailwind CSS**, and animated using **Framer Motion**.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion  
- **Backend:** Firebase (database, authentication, storage)  
- **AI Integration:** Gemini API

## Setup Instructions

Clone the repository, install dependencies, configure environment variables, and run the app locally:

```bash
# Clone the repo
git clone https://github.com/LinhL1/Impromptu/
cd Impromptu

# Install dependencies
npm install

# Create a .env file in the project root with your Firebase and Gemini credentials
# Example:
# REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
# REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Run the app locally
npm start
