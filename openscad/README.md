# Customizable Christmas Photo Ornament

Editable source: **Customizable Photo Ornament.scad**. All dimensions are millimetres. The front has a ribbon loop, two engraved stars, and your engraved name or message beneath the photograph. A separate sliding back holds the photograph against the front lip. No glue is required; a small piece of removable tape across the top can secure the back for hanging.

## Customize and export

1. Open the SCAD file in OpenSCAD and show **Window → Customizer**.
2. Set `name_tag` to your name or message. Text is engraved 0.6 mm into the front. Long names compress horizontally; reduce `text_size` for a more natural appearance. Leave the name empty for a blank tag.
3. Choose `photo_format`. For another size, choose **Custom** and enter the physical print width and height. `landscape` rotates portrait presets; Wide is already landscape. To rotate Wide into portrait use Custom dimensions 86 × 108.
4. Adjust `border` and `tag_height` to change the outer frame size independently of the photograph. Changing the preset changes both matching parts. Do not scale the finished STL in your slicer: that also scales the photo slot and clearances.
5. Select `part = Frame`, render with **F6**, and export STL. Repeat with `part = Back`. Layout shows both parts on the plate; Assembly is a fit reference, not a printable combined part.

| Preset | Physical print W × H |
|---|---|
| Instax Mini | 54 × 86 mm |
| Instax Square | 72 × 86 mm |
| Instax Wide | 108 × 86 mm |
| 3R | 88.9 × 127 mm / 3.5 × 5 in |
| 4R | 101.6 × 152.4 mm / 4 × 6 in |

The holder accepts the **whole print**, including Instax's white border. The opening hides 2 mm around each edge. Measure your actual print and use Custom if necessary. Instax format reference: https://www.fujifilm.com/us/en/consumer/instax/film

Default Mini frame body: **68.5 × 118.5 mm**, plus the hanging loop, **5.7 mm** deep. 4R body: **116.1 × 184.9 mm**, plus the loop. Larger prints make larger tree ornaments; verify your build plate and branch support.

## Print and assemble

- Suggested starting point: PLA, 0.2 mm layers, 0.4 mm nozzle, 3 walls. Print Frame exactly as exported, front against a smooth build plate. Text is mirrored in the plate view so it reads correctly from the front. The back prints flat separately.
- The rear retaining lips project 1.5 mm inward; check overhang quality in your slicer. This design aims to avoid supports, but printer performance varies. Avoid supports inside the sliding channels unless necessary.
- The default photo allowance is 1.0 mm vertically (0.8 mm photo thickness plus 0.2 mm allowance). For thinner paper, a thin paper shim can remove rattle; for thicker media adjust `photo_thickness`.
- Slide the photo in from the open top, with its image toward the front window. Slide the backing behind it, under the two rear retaining lips. The pull tab remains accessible above the top edge. Add removable tape at the top if the fit is loose, then thread ribbon through the loop.
- Clearances are starting values, not a verified physical fit. If the back binds, increase `back_clearance` slightly and re-export both parts. A first fit sample is recommended before printing a batch.
- Optional: fill the engraved lettering and stars with contrasting paint. The source uses Liberation Sans Bold; choose an installed font in `font_name` if it substitutes unexpectedly.

## Included files and verification

- SCAD: editable parametric geometry and printable-part selectors.
- Preview PNG: front styling and rear assembly concept; illustrative, not a CAD render or photograph.
- No STL is included because OpenSCAD is not installed in this workspace. The source has been reviewed for dimensions and channel layout, but has not been rendered by a CAD kernel or physically printed. Render and inspect both exports before printing.
