# Adult appearance reference record

The owner designated two inline reference images as the adult pet on 24 October 2026 (Perth time): a neutral face and a crying face.

## Current integration status

After reviewing the eight-image overview, the owner requested that both later stages be added to the game. The five adult appearances in that overview are now used by `stages.js` and `sketch.js`: original normal and crying PNGs, the outlined unimpressed and angry designs, and the approved open-eye happy design. The original source images remain unchanged. Earlier review notes below describe the design history, not the current integration status.

Normal is the default; low mood below 50 (but at least 30) uses angry, and low energy below 30 uses unimpressed. Feeding, petting, playing and affectionate approaches use happy. Critical mood or smelly waste uses crying. Sleep reuses unimpressed with the existing Z animation. The shared hungry pose still takes priority below 30 hunger.

## Confirmed appearance

- Round cream body with small side bumps, a visible black outer contour, and the owner's simple flat drawing style. Preserve the black contour around both side bumps and along the bottom. The outline can be hard to see when a transparent PNG is displayed on black; inspect originals on a light or gray background.
- A large pale-yellow star attached to the head, outlined in warm ochre.
- A smaller yellow star beside the right cheek/side, at the cheek's height.
- Flat pale-pink cheeks and compact black pen facial features.
- Neutral expression: small tilted black oval eyes and a little w-shaped mouth.
- Crying expression: small blue tears under the eyes and a small downward mouth.
- Happy expression: follow the owner's latest happy-face reference, with open tilted black oval eyes and a tiny omega-shaped upper mouth joined to a narrow, vertically elongated U-shaped pink open mouth. Do not substitute closed crescent eyes, a wide grin, or a small semicircle tongue. Keep the adult's cheek star; the single-star happy reference specifies the face, not a stage change.
- Adult faces do not use the elderly eye-corner creases.

## Rejected expression sheet

[adult-user-expression-options.png](adult-user-expression-options.png) was rejected by the owner because it changed the body proportions and drawing style. Do not use it as an appearance reference or integrate it into the game.

| Label | Expression |
| --- | --- |
| A | Unimpressed, following the owner's half-lidded doodle reference. |
| B | Angry, with a bright red comic anger mark. |
| C | Happy, with the baby-style happy mouth. |

The requested expressions remain unimpressed, angry (with a red anger mark), and happy. Edit only facial features using the owner's original PNG as the reference. Preserve the original round silhouette, black body contour, side bumps, cream fill, pink cheeks and both stars. Do not add watercolor texture, change the body into a wider dome, or enlarge the features.

## Rejected second expression sheet

[adult-original-expression-review.png](adult-original-expression-review.png) was also rejected: the black outer body contour was omitted. The generation instructions incorrectly requested no black body outline. Do not use this sheet or repeat that instruction. The owner's subsequent gray-background reference explicitly shows the required black body contour. No gameplay assets have been replaced.

## Outlined expression proposal

[adult-outlined-expression-review.png](adult-outlined-expression-review.png) restores the visible black body contour, including the side bumps and bottom. From left to right: unimpressed, angry with a red anger mark, and happy. The transparent PNG was inspected on a white browser background to verify the outline is visible. At that point it was awaiting the owner's review; it is not a pixel-identical edit of the originals. The first two faces are now integrated, following approval of the overview; its rejected happy face remains unused.

The owner rejected the happy face in this sheet: its closed crescent eyes and short mouth do not match the supplied happy reference. Do not use that happy face for integration. This feedback does not establish approval of the other two designs.

## Approved open-eye happy design

[adult-happy-open-eyes.png](adult-happy-open-eyes.png) was approved by the owner ("OK了就这样") on 24 October 2026, Perth time. It uses open tilted black oval eyes, a small omega-shaped upper lip and a narrow vertical pink U-shaped open mouth. It retains the adult's right-cheek star and black body outline. It is now the adult happy face in the game. The previous three-expression sheet remains unchanged for comparison.

## Current appearance overview

[appearance-gallery.html](appearance-gallery.html) displays the five integrated adult designs and the three approved elderly expressions. It displays the existing source images through cropped viewports without repainting or changing the originals. [appearance-overview.png](appearance-overview.png) is a browser screenshot of that gallery.

## Original file archive

The owner subsequently supplied `归档.zip`. Both original 2732 × 2048 RGBA PNG files are now archived byte-for-byte:

- [Normal original](../assets/adult-original/normal.png), originally `未命名作品-1 5.png`.
- [Crying original](../assets/adult-original/crying.png), originally `未命名作品-2 2.png`.
- [Archive manifest](../assets/adult-original/manifest.json) records original filenames, byte counts and SHA-256 hashes.

These original PNGs are the authoritative adult artwork. Keep them unchanged. Generated expression proposals are separate files, require the owner's review, and must not be described as exact copies of the original artwork.
