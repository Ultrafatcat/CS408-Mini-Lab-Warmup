# CS408-Mini-Lab-Warmup

* Author: Aila Batista
* Class: CS408
* Semester: Fall 2026

## Overview

This is a small web app that talks to Canvas LMS REST API to track my assignments. Pick any of your active courses and it shows the course's assignments in a table, sorted by due date, with color-coded urgency badges (overdue, due soon, upcoming, submitted).

The app was built using the MEAN framework without the database (Canvas is the data source). An Express backend talks to Canvas and an Angular frontend talks to Express. The Canvas token only lives on the Express server (in ```.env```).

### API Endpoints Used

| Method | Canvas Endpoint | Data retrieved |
|---|---|---|
| GET | `/api/v1/courses?enrollment_state=active` | Your active courses (id and name), used to fill the dropdown |
| GET | `/api/v1/courses/:id/assignments` | Assignments for the chosen course: name, due date, points, link, and your submission status |

Both endpoints are paginated. The server requests `per_page=100` and follows the `rel="next"` URL in the `Link` header until there are no more pages.

## Usage

### Prerequisites
- Node.js (the current LTS version; check yours with node -v) - download from https://nodejs.org. This also installs npm, the package manager used below.
- Git - download from https://git-scm.com.
- A Canvas account at your school.

### 1. Clone the repository
```
git clone https://github.com/Ultrafatcat/CS408-Mini-Lab-Warmup.git
cd CS408-Mini-Lab-Warmup
```

### 2. Install dependencies
This project is two separate apps in one repository, so run npm install twice: once for the Express server (root folder) and once for the Angular client.
```
npm install
cd client
npm install
cd ..
```
```npm install``` reads the ```package.json``` file in the current folder and downloads everything the project needs into a ```node_modules``` folder. It can take a minute or two.

### 3. Create your canvas API token
1. Login to Canvas with your student account
2. Click your profile picture in the left navigation, then click **Settings**.
3. Scroll down to **Approved Integrations** and click + New Access Token.
4. Enter a purpose (for example, Assignment Tracker) and an expiry date, then click **Generate Token**
5. **<ins>Copy the token right away.</ins>** Canvas only shows it once. If you lose it, delete it in Canvas and generate a new one.

> [!WARNING]
> Never commit your token. It gives full access to your Canvas account. If you ever push it by accident, revoke it in Canvas Settings immediately and generate a new one.

### 4. Create your ```.env``` file
Copy the example file to a new file named ```.env``` in the root folder (the same folder as ```server.js```):
```
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```
open ```.env``` and fill in both values:
```
CANVAS_API_TOKEN=your_token_here
CANVAS_BASE_URL=https://your-school.instructure.com
```
- ```CANVAS_API_TOKEN``` is the token you generated above.
- ```CANVAS_BASE_URL``` is your school's Canvas address. Use only the domain (for example ```https://boisestatecanvas.instructure.com```), with no ```/api/v1``` and no trailing slash. You can find it in your browser's address bar while logged in to Canvas.
The ```.env``` file is listed in .gitignore, so it will not be committed.
### 5. Run the app
You need **two terminals**, one for each part.</br>

**Terminal 1** - the Express server (from the root folder):
```
npm start
```
You should see Server running at http://localhost:3000.</br>

**Terminal 2** - the Angular client:
```
cd client
npm start
```
Wait for it to finish building, then open http://localhost:4200 in your browser.

### Using the tracker
1. Choose a course from the dropdown.
2. Click **Load assignments**.
3. Review the table. Badge colors mean:
    - **Red** - overdue and not submitted
    - **Yellow** - due within 48 hours
    - **Blue** - upcoming
    - **Green** - already submitted
    - **Gray** - no due date

## Results 

I had learned the basics of the MEAN stack in a previous assignment, and this project let me practice it again with a real API. I was fascinated by how reactive Angular is since, when the data changes, the page updates on its own, which saves a lot of work. Connecting Express and Angular was interesting, especially because Express acts as a middleman for Canvas's API. I also learned about pagination, which I was mostly unfamiliar with. Canvas only returns one page of results at a time, so I had to follow the ```Link``` header until I had everything. Lastly, I learned how important it is that the token stays on the Express server, because anything in the browser can be seen by anyone.

A lot of the things I found difficult were part of what I felt I learned during this assignment. Connecting Angular and Express was difficult because I had to get my app to read my token, retrieve the data I need, and pass it through to Angular. In some of the functions, I was missing ```await``` which would leave me with a promise instead of real data. I also got confused when I was trying to write the logic for ```canvas.js ```because I was writing code as it would apply in Express. Now I understand that ```canvas.js``` makes requests to Canvas, while the route code in ```server.js``` answers requests from the browser. When I tried to test the pagination I didn't know the proper way to test it and ended up just typing ```&per_page=1``` at the end of the URL in the address bar. That reminded me that my Express server builds its own URL to send to Canvas.

What I would like to improve is how my app lists courses. Right now the dropdown includes a course I am not taking this semester, probably because it still appears on my Canvas dashboard. I want the app to only list courses from the active semester. One way to do this would be to ask Canvas for each course's term information and keep only the courses whose term includes today's date. I think another good idea would be to add another dropdown that lets you select the course term.

## Sources
- Canvas LMS REST API documentation (Courses, Assignments, and pagination): https://canvas.instructure.com/doc/api/
- Angular documentation: https://angular.dev
- Getting started with Angular: https://angularstart.com/modules/angular-getting-started/1/
- Express documentation: https://expressjs.com
- Quick start guide to dotenv: https://www.newline.co/@goatandsheep/a-quick-start-guide-to-dotenv--788c3807
- Bootstrap documentation: https://getbootstrap.com
- MDN Web Docs (fetch, URL): https://developer.mozilla.org
- AI assistance: I used Claude as a tutor throughout this project. It explained concepts, guided me through setup and debugging, reviewed my code, and provided code for parts of the project, including the pagination helper in canvas.js, the assignments route, and the tracker component and template. I tested and adapted that code. It also drafted the setup instructions and API table in this README, and gave feedback on the clarity and grammar of my reflection, which I wrote myself. GitHub Copilot autocompleted some lines in VS Code.
