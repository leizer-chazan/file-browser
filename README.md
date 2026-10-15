# Folio — Local file explorer

A read-only file explorer that runs entirely in your browser. Choose a local folder to browse its tree, inspect file details, and preview images with dimensions and available EXIF metadata. Files are never uploaded or modified.

## Development

```sh
npm install
npm run dev
```

The File System Access API is used where supported. Other browsers use the directory input fallback. Image dimensions are read locally, and EXIF values are shown when present in the image.

## Quality checks

```sh
npm run check
```

This runs TypeScript typechecking, Oxlint, and the unit tests.
