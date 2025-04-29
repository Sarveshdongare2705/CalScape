Carbon Footprint App - Optimizing Sustainability

Overview
The Carbon Footprint App is a mobile application designed to promote sustainable living by helping users track, analyze, and reduce their carbon footprint. Built during my summer internship at VESIT CMPN, this app empowers users to monitor their monthly activities, visualize their environmental impact, and adopt greener habits through engaging features and actionable insights.
Features

Carbon Footprint Survey: Users can input their monthly activities through a survey to calculate their carbon footprint.
Reduction & Analytics: Provides footprint calculation and reduction suggestions, displayed graphically for easy understanding.
Engagement Modules:
Daily quizzes to educate and engage users.
Leaderboard and league system to foster friendly competition.


Queries Section: Allows users to resolve doubts efficiently.
Personalized Suggestions: Generates tailored suggestions based on user data and appliance surveys via Flask APIs.
News Integration: Displays top environmental news using the NEWS API.
Notifications: Sends timely updates and reminders using Firebase Cloud Messaging (FCM).

Technologies Used

React Native: For cross-platform mobile app development.
Firebase: For backend services, including authentication, database, and notifications.
Python Flask: For building APIs to handle suggestions and data processing.
FCM (Firebase Cloud Messaging): For push notifications.
Figma: For designing the app's UI/UX.

Implementation Snapshot

Getting Started
Prerequisites

Node.js and npm installed.
React Native CLI set up.
Android Studio for Android development/emulation.
Firebase account and project set up.
Python and Flask for running the backend APIs.

Installation

Clone the Repository:
git clone https://github.com/your-username/carbon-footprint-app.git
cd carbon-footprint-app


Install Dependencies:
npm install


Set Up Firebase:

Create a Firebase project and add your Android app to it.
Download the google-services.json file and place it in the android/app directory.
Configure Firebase in your app (update firebaseConfig in the source code).


Set Up Flask Backend:
cd backend
pip install -r requirements.txt
python app.py



Running the App on Android

Ensure an Android emulator is running or a physical device is connected.
Start the Metro Bundler:npx react-native start


In a new terminal, run the app:npx react-native run-android



Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and includes relevant tests.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments

VESIT CMPN for providing the internship opportunity.
The open-source community for tools and libraries that made this project possible.

