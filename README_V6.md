# Academic Website v6

Built on the previously generated v5 website files. The v6 homepage now features full-sized 02 / AI (CT/CBCT radiotherapy) and 03 / GENOMICS (BSF genomic diversity) research panels, original workflow imagery, and a direct link to https://github.com/vannguyen3007/bsf-genomic-diversity-pipeline.

## Deploy on Mac
1. Extract the ZIP into Downloads.
2. In Terminal:

```bash
cd ~/Downloads/vannguyen3007.github.io
cp -R ~/Downloads/vannguyen3007-academic-website-v6/. ./
git add .
git commit -m "Upgrade academic website to v6 with CBCT and genomics"
git push origin main
```

The ZIP has a single top-level folder. Do not replace your `.git` directory. The copy command merges files into your existing Git repository.
