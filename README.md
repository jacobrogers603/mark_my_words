---
title: "mark my words design document"
---

# Mark My Words Design Document

## Overall function / Purpose

This web-app will allow users to write notes in md format and have it be automatically converted to HTML and published to their profile as either public or private. Its secondary purpose is to act as a portfolio project that demonstrates that I can create full-stack app using React, TS, Tailwind, and other technologies.

## Pages

### Landing page

The public homepage for the app. 
This has a:
- logo, 
- maybe some art / screenshots of it working, 
- an explanation of what it does, 
- a login / register option,
- a profile search to find other users' public profiles

### Login || register page

A basic login or registration page.

### Profile page

A page that is the user's profile page that has: 
- their table of contents (TOC) of notes & directories
    - The TOC should be editable by drag and drop and maintain order via an internal ID
    - An edit icon to edit the note
    - upload button to upload md documents to the site and drop them at the top of the TOC.
- their bio. 
- profile photo
- task board above their full TOC that contains pinned notes
- options menu as well for settings, if applicable.

The visibility of elements on this page would depend on whether they were marked private or not and if the viewer has access to see them.

### Note Editor page

This page will be where the user writes a new note. It will consist of a:
- background area where they type the note, 
- a tool bar at the top to control formatting (would auto insert md symbols ie ** for bold text)
- A title field (gets auto filled with the first heading 1 it sees, #, if not manually typed in)
- A save & publish button
- A save as draft option
- A public / Private switch button

### Search users page

A page to search all users on the site and generate a list of results of names, if a name is clicked it routes to their profile

### Nav bar (on all pages)

- Home button / icon, will route to landing page if not logged in, else to profile page
- search bar to find your notes
- search users button (will route to search page)


## Technologies

- React
- TS
- Tailwind
- SQL?
- Authentication
- linode
...