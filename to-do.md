## To do

## Pri I

**Things that the user would notice during normal use, breaking or just embarrassing**

## Pri II

**Things that the user may not notice, or are more under the hood, but are still important**

- Photo encryption & restrict anyone from accessing photos on nanode server with the link
- sign out should redirect to auth page in all scenarios  
- If you type mark-my-words.net/<directoryName> you go there despite authentication: It will assume it is a public directory and that it is the root note and take you there
- deleting a note causes an error in the console despite doing the action correctly
- Pressing close w/o saving while editing a public note brings you back to the private directoryItems page instead of the public profile page

## Pri III 

**Things that are unimportant, small, or are future desired features**

- Add account settings to user-settings page accordion: change password, change email, delete account, profile bio
- Add profile bio to public profile page
- ability to search for notes, words in notes, and other users, results appear on search results page
- Hover card on profile images in search results page or in public profile page: [shadcn hover card](https://ui.shadcn.com/docs/components/hover-card)
- make image links & templates enter the note text where the cursor was last
- Make a public landing page 
- make forgot password option on auth page
- Add share link button to directoryItem comp when it is public, also add it in the note viewer when it is public
- Add currentPathTitles to User model in schema: we have to query the database for the name of every path title, so each layer we go down in terms of nesting for making folders and sub folders we have the ask the server what the ID's name is to display it to the user... this is bad

