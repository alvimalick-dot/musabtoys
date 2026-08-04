# Excel Product Image Upload Guide

Use one row per product. Put all photos for that product in its single `images` column.

The **first image is the main card image**. All images appear in the product-detail gallery after a customer opens the product.

| name | sku | price | stock | description | images |
| --- | --- | ---: | ---: | --- | --- |
| Remote Control Car | RC-001 | 4500 | 10 | Fast rechargeable RC car. | RC-001-01.jpg \| RC-001-02.jpg \| RC-001-03.jpg |

## Image Cell Format

Use this exact format in the `images` cell:

```text
RC-001-01.jpg | RC-001-02.jpg | RC-001-03.jpg
```

Use `|` between image paths. It is the safest separator for both Excel and CSV files.

## Best Image Naming Convention

Name images from the SKU, then add a two-digit number:

```text
RC-001-01.jpg
RC-001-02.jpg
RC-001-03.jpg
```

Another example:

```text
DOLL-25-01.jpg
DOLL-25-02.jpg
DOLL-25-03.jpg
```

Always use `01`, `02`, `03` rather than `1`, `2`, `3`. This keeps the gallery order correct when you later add image 10.

The order in Excel controls the gallery order:

```text
RC-001-01.jpg | RC-001-02.jpg | RC-001-03.jpg
```

- `01` is the shop-card and main product image.
- `02` is the second gallery image.
- `03` is the third gallery image.

## Where to Put Local Image Files

Before importing Excel:

1. Copy all product images into `public/images/`.
2. Ensure each filename exactly matches the value in Excel.
3. Go to Admin -> Excel upload and upload the sheet.

Example files:

```text
public/images/RC-001-01.jpg
public/images/RC-001-02.jpg
public/images/RC-001-03.jpg
```

Excel value:

```text
RC-001-01.jpg | RC-001-02.jpg | RC-001-03.jpg
```

## Best Image Size and Appearance

For the best result on product cards and product pages:

- Use square images: **1200 x 1200 pixels**.
- Use **JPG** or **WebP** files.
- Keep the product centred with some empty space around it.
- Use a consistent background across a product's photos.
- Do not put important text close to the edges; card images use a square crop.

Make the first image the clearest front/product shot because it appears on the shop page.

## Using Online Image Links

You can also use HTTPS image URLs in the Excel `images` cell:

```text
https://example.com/rc-001-main.jpg | https://example.com/rc-001-side.jpg | https://example.com/rc-001-back.jpg
```

Only use `https://` links. Do not use `http://` links.

## Automatic SKU Image Matching

If your image files use the SKU naming convention, the `images` cell can be empty:

```text
SKU: RC-001
```

Files:

```text
RC-001-01.jpg
RC-001-02.jpg
RC-001-03.jpg
```

The importer will automatically find files beginning with `RC-001-`. Explicitly listing the images in Excel is still recommended because it gives you full control over their order.

## Re-importing Products

Use the same SKU to update an existing product.

- If the row includes image paths, those images become the product gallery.
- If the `images` cell is empty, existing product images are kept.
- A new SKU creates a new product.

## Quick Checklist

1. Put images in `public/images/`.
2. Name them `SKU-01.jpg`, `SKU-02.jpg`, `SKU-03.jpg`.
3. Put the same names in the Excel `images` column, separated by `|`.
4. Ensure the first image is the best main photo.
5. Upload the Excel file from Admin -> Excel upload.
