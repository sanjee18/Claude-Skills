# tools (lokal, nicht Teil der ausgelieferten Decks)

Für `scripts/film_export.cjs` (MP4-Export der `cam`-Szenen):

```
cd tools
npm i playwright-core @ffmpeg-installer/win32-x64     # Windows (auch Windows on ARM, x64-Emulation)
npm i playwright-core ffmpeg-static                   # macOS / Linux
```

playwright-core nutzt den installierten Edge/Chrome (kein Browser-Download). ffmpeg kodiert H.264 (yuv420p, bt709, faststart).
