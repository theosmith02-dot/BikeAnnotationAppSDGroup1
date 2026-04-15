
# **TRIPS Bike Annotation Software - Senior Design Group 1**
## Team Members:
* **Theo Smith (Electrical Engineering - Computer)**
* **Jack Eyrich (Computer Science Engineerng)**
* **Anthony Roti (Electrical Engineering - Electrical)**
## **Sponsors:**
* **Cara Hamann (Department of Epidemiology)**
* **Tyler Bell (Department of Electrical and Computer Engineering)**

## 🚲 Project Overview
Our high-performance web application is designed for the University of Iowa TRIPS
Lab. The primary objective was to modernize and replace the lab's bulky and outdated
annotation software. This software provides researchers with a streamlined, responsive
interface that synchronizes bicycle-mounted video and GPS data. This allows for
efficient identification and classification of bike safety events and road hazards.

## 🔄 Modernizing the Workflow
The previous C# version had a limited accesibility, low maintainability, and an
outdated UI/UX (very rigid layout, windows widgets, etc). Our solution provides
universal access (via any modern web browser URL), clean modular components using
TypeScript, streamlined maintenance (instant updates via git commit/push).

## 🚀 Key Features and Technical Highlights
* **Web-Based Interface:** Accessible to all students and lab members without requiring
any software installation.
* **Automated Data Processing:** Instant parsing of CSV data extracted from the video,
gps, and created annotations.
* **Local-First Privacy:** All video and data processing occurs in the user browser.
All of the sensitive research data never leaves the local machine.
* **Integration**: The backend logic, using Node.js and Vite, provides a foundation for
future integration with automated AI/ML classification if needed.

## 🛠 Tech Stack
* **Framework:** React 18
* **Language:** TypeScript
* **Mapping:** Leaflet & React-Leaflet
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Hosting:** Vercel (connected to GitHub)

## 📋 Operational Workflow (User Guide)
Follow these steps to conduct and annotation session using the interface:

## 1) Data Ingestion / Session Setup
 - User ID: Enter the name of the annotator
 - Upload the front/rear .mp4 video file and corresponding .gpx (or .trips) file
 - Begin Session: System will automatically synchronize video with gps file

## 2) Annotation & Analysis
- Navigation: Use the playback controls to navigate the trip.
- Hazard Idenfitication: Use the critical event and reckless buttons to properly
classify safety and hazard events.
- Once a button is pressed a modal will appear, pausing the video and requiring
more specific information from the annotator.

## 3) Validation & Export
- Each annotation created will show up in a list generated on the left sidebar.
- Once the annotator has reviewed through these generated events, click "EXPORT SESSION"
- Output:
    ## i. Generate a CSV file and save to a location of your choice
    - This will automatically generate an xcel file with groupings of each annotation and the
    data accordingly
    ## ii. Generate a .trips file if you would like to continue your annotations later
    - This saves all the progress you have made (just start a new session and upload the
    same videos you were working with along with this .trips file and everything will load properly
