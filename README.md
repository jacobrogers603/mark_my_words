# Mark My Words

An app that will host notes for the user; They will have a dashboard that contains their tree of notes; they can edit notes in an in-browser editor, or upload notes; notes may contain text or images; all notes should be written in markdown; when they publish a note it will be converted to HTML and published to their profile page; if a note (or dir) is marked as public, another user can search for that user's profile and see the note (or dir); editing privileges can be given to different users; if a note (or dir) is marked as private only the creator can see the note (or dir) or anyone else they list 

## Tech stack

- Next Js 14
- Prismadb
- TailwindCSS
- MongoDB
- TypeScript
- Next-auth
- Vercel

## Ideas for pages

### auth - working

An authentication page that allows creation of an account or logging in.

### note tree - todo

A tree of all the notes a user has. Each note (or dir) will have a row that has buttons that allow changing the settings for it ie access settings, editing option, delete option, drag and move option; only one layer will be shown at a time; or do we want to show a full TOC like github does?; at the top of the page will be a button to go to the user's profile page

### profile - todo

Settings for the profile of the user including: profile avatar, email address, change password, delete account, make notes public or private by default, etc

### navbar - todo

have search: will cover the user's own notes (possible options for keyword vs file name vs user); have a button to go to search profiles page


### search results - todo

display the search results for a search, whether it be a search for users, or a search for a note or dir, or a search for a keyword; maybe copy github a bit