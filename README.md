# Keepsake · Christmas Ornament Studio

Browser-based parametric Christmas ornament designer with customizable names, photo sizes, live 3D previews, STL downloads, and aligned multipart 3MF exports for Bambu Studio.

## Run locally

No build or package installation is required. From the repository root:

```sh
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765/`. Serve over HTTP so the bundled Manifold WASM runtime can load. CAD generation and downloads run in the browser.

## Included models

- Original rectangular photo frame with sliding backing.
- Wreath & bow with shallow embossed text and a three-tab twist-lock backing.
- Arched photobooth frame with one to four photo windows.
- Classic keepsake and scalloped oval photo frames with sculpted bows.
- Personalized Christmas tree with raised star, miniature bows and optional snow bands.
- Hollow cursive name bauble with snowflake accents.
- Evergreen name-band bauble with three trees, upper stars and raised lettering.
- Personalized Filipino parol ornament.
- Holly bauble with cursive name, leaves, berries and a decorative cap.

Photo presets include Instax Mini, Square and Wide, 3R, 4R, and photobooth strips. Custom dimensions and landscape orientation are supported. The wreath uses a circular crop; other shaped frames include SVG trim guides.

## Printing and colors

Use the color 3MF download for named, aligned color parts. Import as one object with multiple parts and assign filaments in Bambu Studio's Objects panel. STL contains a single material. Download the matching backing separately for photo frames. Print the exported frame back down with the embossed face upward; inspect supports beneath photo lips and protruding details.

The wreath's ribbon color starts at the top of the green frame face (model Z=2 mm). Its lower bow foundation remains frame-colored to reduce color changes. The lettering defaults to a shallow 0.8 mm emboss. Wreath 3MF downloads use the `top-bow-v4` suffix.

For the wreath, align the backing's three tabs, press in, then turn 16 degrees to lock. Both frame and backing must use the current twist-lock design; older loose-disc frames have no catches. Clearances are starting values: verify physical fit before printing a batch. Geometry checks do not replace a physical print test.

## Source layout

- `dist/`: complete static website, model generators, preview, export code and model thumbnails.
- `dist/vendor/`: bundled JSCAD, Three.js, Manifold JS/WASM, Pacifico font and their licenses.
- `scripts/prepare-cursive.py`: regenerates cursive glyph outlines; requires Python FontTools.
- `verify*.cjs`: ornament geometry, export and preview regression checks.
- `openscad/`: original standalone parametric photo-frame source and its instructions; this earlier design differs from the browser models.

This repository contains only the ornament application and its dependencies. Site hosting credentials and deployment identity are excluded.

## Verification

Use Node.js to run individual checks from the repository root:

```sh
node verify-preview.cjs
node verify-bow-colors.cjs
node verify-wreath-lock.cjs
```

Other scripts preserve model-specific regression coverage and historical height/appearance expectations. Some export examples to temporary files or sibling output folders; inspect scripts before running the entire collection. The latest wreath text and ribbon-color changes supersede older assertions that expect all lettering above the bow or the entire bow foundation in the ribbon color.

Mesh checks cover closed edges, finite coordinates, positive volume, color-volume coverage and alignment. The 3MF includes named volumes and default colors, without printer or temperature profiles. Actual purge volume depends on slicer settings, layer height and filament assignments.

Third-party license notices are retained in `dist/vendor/`. No license is granted here for the original application code beyond applicable repository-owner permissions.
