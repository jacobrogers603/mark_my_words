## To do

## profile

Add Settings for the profile of the user:

- profile avatar change
- change password
- delete account

hover card:

- profile bio
- https://ui.shadcn.com/docs/components/hover-card use for profile

## search

ability to search for notes, words in notes, and other users, search results page to do, no drop down, i don't wanna

## fix server request inefficiencies & security issues

we don't want to fetch the content of the notes on the home page and we don't want notes being sent with data that shouldn't be seen by the user at specific times in the network inspector on the browser 

## encryption

notes and data in general should be encrypted on the client side

## restrict anyone from accessing photos on nanode server with the link

check if they are logged in and have access to view the note

## move the mongo db to my nanode

move from Atlas to nanode

## make image links & templates enter the note text where the cursor was last

## stop propagation of clicking photos when you press the X or i button on the media card

is adding the link to the note when the user press i

## Add currentPathTitles to User model in schema

we have to query the database for the name of every path title, so each layer we go down in terms of nesting for making folders and sub folders we have the ask the server what the ID's name is to display it to the user... this is bad

## deleting a note causes an error in the console despite doing the action correctly
