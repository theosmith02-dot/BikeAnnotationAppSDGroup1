
# **TRIPS Bike Annotation Software - Senior Design Group 1**
## Team Members:
* **Theo Smith (Electrical Engineering - Computer)**
* **Jack Eyrich (Computer Science Engineering)**
* **Anthony Roti (Electrical Engineering - Electrical)**
## **Sponsors:**
* **Cara Hamann (Department of Epidemiology)**
* **Tyler Bell (Department of Electrical and Computer Engineering)**

## Project Overview
Our high-performance web application is designed for the University of Iowa TRIPS
Lab. The primary objective was to modernize and replace the lab's bulky and outdated
annotation software. This software provides researchers with a streamlined, responsive
interface that synchronizes bicycle-mounted video and GPS data. This allows for
efficient identification and classification of bike safety events and road hazards.

## Modernizing the Workflow
The previous C# version had a limited accesibility, low maintainability, and an
outdated UI/UX (very rigid layout, windows widgets, etc). Our solution provides
universal access (via any modern web browser URL), clean modular components using
TypeScript, streamlined maintenance (instant updates via git commit/push).

## Key Features and Technical Highlights
* **Web-Based Interface:** Accessible to all students and lab members without requiring
any software installation.
* **Automated Data Processing:** Instant parsing of CSV data extracted from the video,
gps, and created annotations.
* **Local-First Privacy:** All video and data processing occurs in the user browser.
All of the sensitive research data never leaves the local machine. Media files are processed entirely within the client-side using Object URLS. In addition, this allows processing video and GPS data without an internet connection.
* **Integration**: The backend logic, using Node.js and Vite, provides a foundation for
future integration with automated AI/ML classification if needed.

## Tech Stack
* **Framework:** React 18 + Vite
* **Language:** TypeScript
* **Mapping:** Leaflet & React-Leaflet (OpenStreetMap & Esri World Imagery)
* **Styling:** Tailwind CSS
* **Hosting:** Vercel (connected to GitHub)
* **Icons:** Lucide-React

## Operational Workflow (User Guide)
Follow these steps to conduct and annotation session using the interface:

1) **Data Ingestion / Session Setup**
 - User ID: Enter the name of the annotator
 - Upload the front/rear .mp4 video file and corresponding .gpx (or .trips) file
 - Begin Session: System will automatically synchronize video with gps file

2) **Annotation & Analysis**
- Navigation: Use the playback controls to navigate the trip.
- Hazard Idenfitication: Use the critical event and reckless buttons to properly
classify safety and hazard events.
- Once a button is pressed a modal will appear, pausing the video and requiring
more specific information from the annotator.

3) **Validation & Export**
- Each annotation created will show up in a list generated on the left sidebar.
- Once the annotator has reviewed through these generated events, click "EXPORT SESSION"
- Output:
    * Generate a CSV file and save to a location of your choice
    - This will automatically generate an xcel file with groupings of each annotation and the
    data accordingly
    * Generate a .trips file if you would like to continue your annotations later
    - This saves all the progress you have made (just start a new session and upload the
    same videos you were working with along with this .trips file and everything will load properly

## Getting Started
To use the functioning website visit --> https://bike-annotation-app-sd-group1.vercel.app/

To set up, edit, and build a version of the code -->
1) Clone the repository
* git clone https://github.com/theosmith02-dot/BikeAnnotationAppSDGroup1.git
2) Install dependencies
* npm install
3) Start development server
* npm run dev
4) Build for production
* npm run build

## Folder Structure
Our folder layout is seen below. Follow this to find each file and exactly what function in corresponds to. Think of this as a guide for when edits are made and you need to find which file to edit.
```text
root/
├── public/                
├── src/                   
│   ├── App.tsx            # The main "brain" - sets up the layout and holds everything together
│   ├── main.tsx           # The starting point that tells the browser to run our React code
│   ├── types.ts           # A list of "rules" that makes sure our data doesn't get messy
│   ├── components/        # All the different parts of the screen
│   │   ├── annotations/   # The tools for tagging hazards
│   │   │   ├── ActionCenter.tsx       # The buttons you click while watching the video
│   │   │   └── modals/                # The popups that appear when you tag something
│   │   │       ├── CriticalPointPickerModal.tsx  # For marking the exact event
│   │   │       ├── HazardModal.tsx               # For picking what kind of danger happened
│   │   │       ├── JunctionModal.tsx             # Specifically for intersections
│   │   │       ├── LaneChangeModal.tsx           # For tagging swerving or lane shifts
│   │   │       └── RecklessModal.tsx             # For tagging crazy driving behavior
│   │   ├── layout/        # The "frame" of the app
│   │   │   ├── Header.tsx             # The top bar with the title and branding
│   │   │   └── Sidebar.tsx            # The list on the side showing the tags you've made
│   │   ├── map/           # Everything to do with the map
│   │   │   └── MapView.tsx            # The interactive map that shows the bike's path
│   │   ├── setup/         # Getting the session ready
│   │   │   └── SessionSetupModal.tsx  # The first screen where you upload videos and GPS logs
│   │   ├── ui/            # Reusable bits and pieces
│   │   │   └── ModalElements.tsx      # Standardized styling so all the popups look the same
│   │   └── video/         # The media player
│   │       └── VideoPlayer.tsx        # The custom video player that stays in sync with the map
├── index.html             # The basic HTML shell of the website
├── README.md              # This file!
└── tsconfig.json          # The settings file for the code compiler
