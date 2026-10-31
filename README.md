# Van Nguyen — research website

Live at **https://vannguyen3007.github.io**

A plain HTML/CSS/JS site for GitHub Pages: no build step and no frameworks.
Edit a file, commit, push, and the site updates in a minute or two.

## Project structure

```
.
├── index.html                 Home page (hero, latest news, research, experience, education, contact)
├── research/
│   ├── radiotherapy.html      CBCT-guided adaptive radiotherapy (current project)
│   ├── perturbation.html      Single-cell perturbation sample size (under review)
│   ├── genomics.html          Black Soldier Fly genomic diversity pipeline
│   ├── svoct.html             GAN-based SvOCT coagulation monitoring
│   ├── bone.html              Bone lesion and tumor detection
│   ├── liver.html             Liver tumor multimodal imaging
│   └── _template.html         Blank project page; copy this for new projects
├── assets/
│   ├── css/main.css           All styles; colors and fonts are at the top
│   ├── js/main.js             Theme toggle, mobile menu, research filter, hero animation
│   └── figures/               Full-size figures (open when clicked)
│       └── thumbs/            Smaller .webp copies shown on the pages
├── cv/Van_Nguyen_CV.pdf       Replace this file to update your CV
├── tools/make_thumbs.py       Regenerates thumbs/ from the full-size figures
└── .nojekyll                  Tells GitHub Pages to serve files as-is
```

## Common edits

| I want to… | Edit |
|---|---|
| Add a news item | `index.html`, section `NEWS`. Add a new `<li>` at the **top** of the list. |
| Update my CV | Replace `cv/Van_Nguyen_CV.pdf` (keep the same file name). |
| Add a job | `index.html`, section `EXPERIENCE`. Copy one `<li>` in the timeline. |
| Change colors or fonts | `assets/css/main.css`, section 1 "Design tokens". |
| Edit a project write-up | The matching file in `research/`. |

## Add a new research project

1. **Figure.** Put the image in `assets/figures/` (e.g. `my-project.png`), then run
   `python3 tools/make_thumbs.py` to create `assets/figures/thumbs/my-project.webp`.
2. **Page.** Copy `research/_template.html` to `research/my-project.html`.
   Delete the first comment line and fill in the title, summary, facts and sections.
   Replace `FIGURE-NAME` with `my-project`. Each `<h2 id="...">` needs a matching
   link in the table of contents (`<nav class="toc">`).
3. **Card on the home page.** In `index.html`, section `RESEARCH`, copy one
   `<article class="project">` block and change the link, image, text and tags.
   Set `data-topics` to one or more of `imaging stats genomics optics`, so the filter buttons work.
   To add a new topic, also add a `<button data-filter="newtopic">` in the filters row.
4. **Links between projects.** Update the previous/next links at the bottom
   of the neighboring project pages (`<nav class="next-prev">`).

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

```bash
git add .
git commit -m "Update site"
git push
```

GitHub Pages serves the `main` branch root (Settings → Pages).

## Design notes

- Dark "reading room" theme by default, with a light theme toggle that is remembered per visitor.
- The hero draws isodose-style contour lines (marching squares over a field of
  drifting Gaussian sources). It pauses when off-screen and shows a still frame
  for visitors who prefer reduced motion. Tune it in `assets/js/main.js`, section 4.
- Figures sit on light "lightbox" plates so slide-style images read well on the dark background.

## Image credits

- `assets/figures/art/bone-cancer.*` and `assets/figures/art/liver-cancer.*` are built on real CT and MRI
  volumes from the TotalSegmentator sample data (Wasserthal J. et al., *Radiology: Artificial Intelligence*, 2023;
  https://github.com/wasserth/TotalSegmentator). Tumors, metastases and tracer uptake are simulated and are
  not patient findings.
- `assets/figures/art/perturbation.svg` is an original illustration.
