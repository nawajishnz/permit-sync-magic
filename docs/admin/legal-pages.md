# Legal Pages Administration

This document describes how to manage legal pages (Terms of Service, Privacy Policy, etc.) through the admin panel.

## Overview

The legal pages feature allows administrators to:

1. Create, edit, and delete legal pages with a rich text editor
2. Preview changes before publishing
3. Update content without code changes
4. Format content with headings, lists, links, and other styling options

## Setup

### Database Setup

The feature requires the `legal_pages` table to be set up in the database. If you're using Supabase, the migration will be automatically applied. If you're using a custom setup, run the following SQL script:

```sql
-- Create legal_pages table
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX legal_pages_slug_idx ON legal_pages (slug);
```

### Initial Data

You can set up initial content for your legal pages by running the setup script:

```bash
node scripts/setup-legal-pages.js
```

This will create default content for:
- Terms of Service (slug: `terms-of-service`)
- Privacy Policy (slug: `privacy-policy`) 
- Cookie Policy (slug: `cookie-policy`)
- Refund Policy (slug: `refund-policy`)

## Usage

### Accessing the Admin Interface

1. Log in to the admin panel
2. Navigate to "Legal Pages" in the sidebar

### Creating a New Legal Page

1. Click "Add New Page" button
2. Fill in the Title and Slug (or let it auto-generate from the title)
3. Use the rich text editor to create your content
4. Click "Save Changes"

### Editing a Legal Page

1. Find the page you want to edit in the list
2. Click the edit (pencil) icon
3. Make your changes in the editor
4. Click "Save Changes"

### Previewing a Legal Page

1. Find the page you want to preview
2. Click the eye icon to see how it will appear to users

### Deleting a Legal Page

1. Find the page you want to delete
2. Click the trash icon
3. Confirm deletion in the dialog

## Rich Text Editor

The editor supports the following formatting options:

- **Text Styling**: Bold, Italic
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists, Numbered lists
- **Links**: Insert and edit hyperlinks
- **Quotes**: Blockquotes for citations or emphasis
- **Separators**: Horizontal rules to divide content sections

## URL Structure

Legal pages are accessible at the following URLs:

- Terms of Service: `/terms`
- Privacy Policy: `/privacy`
- Cookie Policy: `/cookies`
- Refund Policy: `/refunds`
- Custom pages: `/${slug}`

## Troubleshooting

### Page Not Loading

If a legal page isn't loading properly:

1. Check that the slug in the database matches the expected URL path
2. Verify the content is properly formatted HTML
3. Look for console errors that might indicate rendering issues

### Editor Issues

If you encounter problems with the rich text editor:

1. Try refreshing the page
2. Check for console errors
3. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## API Reference

The following API endpoints are available:

- `GET /api/legal-pages` - List all legal pages
- `GET /api/legal-pages/:slug` - Get a specific legal page by slug
- `POST /api/legal-pages` - Create a new legal page (admin only)
- `PUT /api/legal-pages/:id` - Update a legal page (admin only)
- `DELETE /api/legal-pages/:id` - Delete a legal page (admin only) 