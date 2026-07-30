# Product photos (for Excel import)

Put product pictures in this folder, then commit & push to GitHub.

## How to use with Excel

1. Drop photos here, e.g.:
   - `public/images/HW-001.jpg`
   - `public/images/kitchen-set.png`

2. In your Excel sheet, add a column named **Image** / **Images** / **Photo** and put either:
   - Just the file name: `HW-001.jpg`
   - Or the path: `images/HW-001.jpg`

3. Upload the Excel in Admin → Excel upload.

## Auto-match by Product ID (no Image column needed)

If the photo file name matches the ProductID / SKU, it links automatically:

| ProductID | Photo file              |
|-----------|-------------------------|
| HW-001    | `HW-001.jpg`            |
| HW-001    | `HW-001-1.jpg` (extra)  |
| KT-99     | `KT-99.png`             |

Supported types: `.jpg` `.jpeg` `.png` `.webp` `.gif`

Multiple photos in one Excel cell (comma or `|` separated):

```
HW-001.jpg, HW-001-side.jpg
```
