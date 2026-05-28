# HASA Website Content Guide

This website is designed to be easily updated by editing the JSON files in this folder. You do NOT need to touch the code to update leadership, events, or gallery photos.

## 1. Updating Leadership (`leaders.json`)

To add a new board member or update an existing one, edit `leaders.json`.

**Fields:**
- `id`: Unique identifier (e.g., "president", "tech-chair").
- `name`: Full name.
- `role`: Position title.
- `photo`: Path to image (e.g., "/images/leaders/my-photo.jpg"). **Make sure to upload the photo to `public/images/leaders/` first!**
- `blurb`: Short 1-sentence summary shown on the card.
- `bio`: Longer paragraph shown when expanded.
- `majorYear`: e.g., "Economics '26".
- `responsibilities`: Array of strings (bullet points).
- `email`: Official HASA email or contact.
- `social`: Object with keys like "linkedin", "instagram" (optional).
- `funFact`: Optional string.

## 2. Updating Events (`events.json`)

Events are automatically sorted by date. Past events move to the "Past Events" section automatically.

**Fields:**
- `id`: Unique ID.
- `title`: Event name.
- `start`: ISO date string (YYYY-MM-DDTHH:MM:SS).
- `end`: ISO date string.
- `location`: Venue name.
- `category`: "social", "cultural", "professional", "community".
- `image`: Path to cover image (upload to `public/images/events/`).
- `description`: Short blurb.
- `rsvpUrl`: Link to Google Form or Eventbrite (optional).

## 3. Updating Gallery (`gallery.json`)

Add photos to the gallery grid.

**Fields:**
- `id`: Unique ID.
- `src`: Path to image (upload to `public/images/gallery/`).
- `alt`: Description for accessibility.
- `album`: Name of the event/album (used for filtering).
- `date`: YYYY-MM-DD.

## 4. Adding Images

1.  Go to the `public/images` folder in the project.
2.  Place your image files in the corresponding subfolder (`leaders`, `events`, `gallery`).
3.  Reference the filename exactly in the JSON file (e.g., `/images/leaders/new-president.jpg`).
