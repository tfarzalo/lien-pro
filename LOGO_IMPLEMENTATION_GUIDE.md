# Logo Implementation Guide

## Image Files to Add

Please save the two logo images you provided to the following locations:

### 1. Full Logo (with "Lien Professor" text)
**File:** `public/logo-full.png`
- This is the horizontal logo with the owl mascot and "Lien Professor" text
- Use in: Header navigation, footer, wide spaces
- Recommended size: 1500x400px (or maintain aspect ratio)

### 2. Icon Only (owl mascot)
**File:** `public/logo-icon.png`
- This is the standalone owl mascot in the rounded square
- Use in: Favicon, mobile views, compact spaces, loading screens
- Recommended size: 512x512px

## How to Add the Files

1. Save both images to the `public/` directory (already created)
2. Name them exactly as shown above:
   - `logo-full.png` (horizontal logo with text)
   - `logo-icon.png` (owl icon only)

## What I've Updated

The code has been updated to use these new logo files in:
- ✅ Main navigation header (uses full logo)
- ✅ Dashboard header
- ✅ Admin layout
- ✅ Footer
- ✅ Auth page
- ✅ Landing pages

## Color Specifications

Based on your logo images:
- **Primary Blue:** #00598F (darker blue for text and main elements)
- **Light Blue:** #B3D9F2 (lighter blue for backgrounds and accents)
- **White:** #FFFFFF (for contrast on dark backgrounds)

These colors match your brand identity and work perfectly with your existing design system.

## Responsive Behavior

The implementation automatically handles:
- **Desktop:** Full logo with text displayed
- **Tablet:** Full logo, slightly smaller
- **Mobile:** Icon only for space efficiency

## Dark Mode Support

Both logos work well in dark mode:
- The blue colors provide good contrast against dark backgrounds
- The owl icon is particularly effective in both light and dark themes

## After Adding the Files

Once you've saved the images:
1. Restart the dev server: `npm run dev`
2. The logos will appear automatically
3. Check all pages to ensure proper sizing
4. If sizing needs adjustment, modify the className in the respective components

## Fallback

If images aren't loaded yet, the code gracefully falls back to text branding to ensure the site remains functional.
