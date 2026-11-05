# Editing the website content (GitHub Pages version)

Edit these files directly on github.com (pencil icon → "Commit changes"). The site rebuilds automatically in about a minute.

## reviews.json
Add real reviews you received (Google, WhatsApp, email). Example:

```json
[
  { "name": "Giulia", "rating": 5, "text": "Trovata subito la cover per il mio Samsung!", "date": "2026-11-05", "photo": "giulia.jpg" }
]
```

- `rating`: 1–5. `date`: YYYY-MM-DD. `photo` is optional: upload the image to `content/uploads/` first.
- Set `"published": false` to hide a review without deleting it. Delete the block to remove it.
- Only publish reviews from real customers who agreed to it.

## settings.json
`phoneDisplay`, `email`, `instagram`, `hoursText` (one line per entry, e.g. `Mo-Sa 09:00-19:30`, use `\n` between lines), and an optional banner `announce_it` / `announce_en`.

## products.json
The product categories. `icon` must be one of: smartphone, shield-check, cable, battery-charging, headphones, car, plug-zap, sparkles, store.
