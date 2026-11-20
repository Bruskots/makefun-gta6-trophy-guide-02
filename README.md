# makefun-gta6-trophy-guide-02

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Bruskots/makefun-gta6-trophy-guide-02/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Bruskots/makefun-gta6-trophy-guide-02/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade, a guide written for this entry that cites its sources, a roadmap to the platinum, and a flag for the one trophy that can be missed. Progress is saved in the browser, with export and import, filters by kind and grade, a search box, and a spoiler setting that hides story trophies until they are earned. The game launched on 19 November 2026, so where no guide has verified a method yet, this guide says so honestly instead of guessing.

## Run it

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 in a desktop browser. No build step, no network: every file the app loads is a file under `app/`.

## Layout

- `app/index.html` — the guide's page
- `app/app.js` — checklist, filters, spoiler setting and detail pane
- `app/store.js` — saved progress (localStorage), export and import
- `app/roadmap.js` — the roadmap to the platinum and the missable flags
- `app/style.css` — the look
- `app/data/trophies.json` — the official 55 trophies with guides and cited sources
- `screenshots/` — renders of the guide in a browser
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=tjz0qq4m&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
