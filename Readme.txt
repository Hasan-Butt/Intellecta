Intellecta - Smart Study and Gamification Platform
==================================================

Section 1: Step-by-Step Instructions for Compiling and Running the Application
------------------------------------------------------------------------------

### Prerequisites:
1. Java Development Kit (JDK) 17 or higher.
2. Apache Maven (3.8+).
3. Node.js (v18+) and npm.
4. Microsoft SQL Server Management Studio (SSMS) / SQL Server instance running locally.

### Backend Setup (Spring Boot):
1. Open SQL Server and ensure you have a database created (e.g., named "intellecta") by writing there:
   Create a new database named "intellecta":
   CREATE DATABASE intellecta;

2. Navigate to the backend directory:
   cd intellecta-backend

3. Create the file src/main/resources/application-dev.properties and add your
   SQL Server credentials (these are intentionally NOT stored in application.properties):
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=intellecta;encrypt=true;trustServerCertificate=true
   spring.datasource.username=YOUR_SQL_USERNAME
   spring.datasource.password=YOUR_SQL_PASSWORD

4. Build the application and download dependencies using Maven:
   mvn clean install

5. Run the Spring Boot application:
   mvn spring-boot:run
   The backend API will start on http://localhost:8080.

6. Verify the backend is running by visiting:
   GET http://localhost:8080/api/hello
   Expected response: "Connection Successful! Hello from Spring Boot."



### Frontend Setup (React):
1. Open a new terminal and navigate to the frontend directory:
   cd intellecta-frontend
2. Install all Node.js dependencies:
   npm install
3. Start the React development server:
   npm start
   The frontend application will open automatically in your browser at http://localhost:3000.

---

### Running the Full Application:
- Ensure SQL Server is running BEFORE starting the backend.
- Start the backend first (port 8080), then start the frontend (port 3000).
- The frontend Axios instance is pre-configured to point to http://localhost:8080/api.
- The Home Page will be shown and after that it will redirect you to the login page where you can login using the following credentials:

   Admin Credentials:
  - Email: dr.ayesha@intellecta.com
  - Password: admin123

   Student Credentials:
  - Email:  muhammad.hamza@intellecta.com
  - Password: password123

Section 2: Design Patterns Used
------------------------------------------------------------------------------
The Intellecta platform utilizes several standard software design patterns to ensure maintainability, scalability, and clean architecture:

1. **Singleton Design Pattern
2. **Builder Design Pattern
3. **Observer Design Pattern

---

Section 3: List of UCs/Features Not Implemented "End-to-End"
------------------------------------------------------------------------------
While the core functionalities of Intellecta are complete, the following features are either partially implemented or require further integration to be considered fully "end-to-end":

1. **UC-24 Add Custom Motivation Quote:
      Add custom quote in focus mode.
2. **UC-39 Grade Descriptive Answers:
      There are MCQs only.      
---

Section 4: List of Known Bugs (UC/Feature-Wise)
------------------------------------------------------------------------------
1. **Admin Rewards (Custom Badge Image Upload):**
   - *Bug:* The system saves uploaded custom badge images to a hardcoded absolute local directory path (`D:/intellecta/uploads/badges`). If the application is cloned to a machine without a `D:` drive or a Linux/Mac environment, image uploads for new custom badges will fail with an I/O Exception.
2. **Focus Session (Timer Drift):**
   - *Bug:* If the user minimizes the React application tab for an extended period during a Focus Session, modern browser resource throttling can cause the frontend Pomodoro timer to drift slightly out of sync with real-world time. 
3. **Gamification (Rapid Session Exploits):**
   - *Bug:* A user could theoretically start and immediately end study sessions repeatedly to trigger the `TOTAL_SESSIONS` badge logic, as there is currently no strict minimum duration enforcement required to qualify a session as "valid" for the total count.
4. **Leaderboard (Real-Time Sync):**
   - *Bug:* The leaderboard relies on polling or manual page refreshes to update rankings. If another user surpasses the current user's XP while they are viewing the page, the ranks will not update dynamically until the component remounts.
5. **Focus Timer:* As we navigate to other tabs of the web app having our focus timer turned on it resets and doesnot records the session stats. 
