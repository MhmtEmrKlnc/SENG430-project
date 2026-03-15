# Frontend

## Prerequisites

You need to have **Node.js** installed on your computer to run this application. 
- Download and install Node.js from [nodejs.org](https://nodejs.org/). (The LTS version is recommended).

## Setup & Running the Application

1. Open your terminal (or Command Prompt).
2. Navigate to the frontend directory
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

After running `npm run dev`, you will see a URL in your terminal. Cmd+Click (or Ctrl+Click) on this link, or copy it into your web browser to view the application.

## Project Structure
- `src/App.jsx` - Main application component with routing state for the steps.
- `src/index.css` - Global styles, color variables, and layout constraints.
- `src/pages/` - Contains the major step views (Step 1, Step 2, Step 3).
- `src/components/` - Shared reusable layout pieces like the Header, DomainTabs, Modal, and StepProgress.
