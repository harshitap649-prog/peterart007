# Storage Persistence Note

## Current Issue
Images uploaded to the website are stored in `public/artworks/` directory. On Render's free tier, the file system is **ephemeral**, meaning:

- Files written to the server's file system will be **lost** when:
  - The server restarts
  - The service is redeployed
  - The container is recreated

## Why This Happens
Render's free tier uses containerized deployments where the file system is temporary. Only files committed to Git are persistent.

## Solutions

### Option 1: Use Cloud Storage (Recommended for Production)
Integrate with a cloud storage service:
- **Firebase Storage** (already configured in your project)
- **AWS S3**
- **Cloudinary**
- **Google Cloud Storage**

### Option 2: Upgrade Render Plan
Render's paid plans offer persistent disk storage that survives restarts.

### Option 3: Use External Image URLs
Instead of uploading files, use external image URLs (like the logo image you're currently using).

## Current Workaround
- The `data/artworks.json` file (committed to Git) will persist and contains artwork metadata
- Image files in `public/artworks/` will be lost on server restart
- Error handling has been added to show placeholder images when files are missing

## Next Steps
To fix this properly, consider migrating image uploads to Firebase Storage or another cloud storage service.

