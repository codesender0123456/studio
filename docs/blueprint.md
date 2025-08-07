# **App Name**: ResultVerse

## Core Features:

- Student Login: Displays a login form for students to enter their roll number.
- Data Fetching: Fetches student data from a Google Sheet based on the provided roll number using the gviz API.
- Marksheet Generation: Generates a dynamic marksheet with student details, subject marks, and results, styled to match the dark theme and futuristic aesthetic.
- PDF Export: Enables students to download their marksheet as a high-quality PDF using jsPDF and html2canvas libraries.
- Admin Authentication: Secures the admin view behind a login form, accessible via the '?admin' URL parameter, with a default password.
- Data Entry Form: Provides an admin panel to add new student data to the Google Sheet, using a Google Apps Script endpoint to handle POST requests.
- Student Table: Displays all student data in a sortable, filterable, and searchable table in the admin view.

## Style Guidelines:

- Primary background color: Dark navy (#0D0D1A) to establish the dark mode base.
- Secondary card color: Deeper navy (#1A1A2E) for contrast and layering.
- Accent color: Electric cyan (#00FFDD) for interactive elements and the glowing effect.
- Font: 'Space Grotesk' sans-serif for headers, and 'Inter' sans-serif for body, lending a modern, technical feel. 
- Use minimalistic, glowing icons that complement the futuristic theme.
- Employ a responsive layout with fluid grid structures and flexible components to ensure compatibility across devices.
- Implement a subtle particle animation on the background using HTML canvas, creating an interactive and engaging user experience; subtle hover animations with a glowing effect on buttons and cards