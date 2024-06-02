## To do

## Pri I

**Things that the user would notice during normal use, breaking or just embarrassing**

## Pri II

**Things that the user may not notice, or are more under the hood, but are still important**

- sign out should redirect to auth page in all scenarios  
- Pressing close w/o saving while editing a public note brings you back to the private directoryItems page instead of the public profile page

## Pri III 

**Things that are unimportant, small, or are future desired features**

- Line numbering and clicking to highlight the line
- Add highlighting of all terms when double clicking like in vsc
- Ability to move notes in the hierarchy via settings
- Add more css styling to the rendered note, ie tables, do to lists, code blocks etc
- Add account settings to user-settings page accordion: change password, change email, delete account, profile bio
- Add profile bio to public profile page
- ability to search for notes, words in notes, and other users, results appear on search results page
- Hover card on profile images in search results page or in public profile page: [shadcn hover card](https://ui.shadcn.com/docs/components/hover-card)
- make image links & templates enter the note text where the cursor was last
- Make a public landing page 
- make forgot password option on auth page
- Add share link button to directoryItem comp when it is public, also add it in the note viewer when it is public
- Add ability to move a note or dir to a different location in the hierarchy in the settings for that note
- Add more animal portraits and fix squishing on public profile 
- uploading should reset image links to the new note id so they work assuming the image is still in the user's media library
- Add currentPathTitles to User model in schema: we have to query the database for the name of every path title, so each layer we go down in terms of nesting for making folders and sub folders we have the ask the server what the ID's name is to display it to the user... this is bad

