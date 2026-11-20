// Leonida Ledger — the roadmap to the platinum and the missable flags.
// Both are built from the official trophy descriptions and the published
// guides cited in the data file. Stage numbers match each trophy's
// "roadmap" field in app/data/trophies.json.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story — and watch for the one missable',
    body: 'Finish all five chapters and the named story missions. Along the way, do the Chapter 1 balcony meditation for Positive Mental Attitude — the only trophy that can be missed — and start the side questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret as they unlock. Keep a manual save at the start and end of every chapter.',
  },
  {
    stage: 2,
    title: 'Partner trophies and side questlines',
    body: 'Once Coffee Break in Chapter 2 lets Jason and Lucia free-roam together, do the partner trophies: lose a 4-star wanted level together, rob three shops in a row together, reach maximum strength with both, and finish the stranger strands. Bret’s hunting and the 500 criminal-profile actions fill up here too.',
  },
  {
    stage: 3,
    title: 'Activities and collectibles',
    body: 'The long grind: 250 stunts, gold medals at all 42 Shooting Range challenges, drone races at all 14 locations, 20 race wins, 18 meditation spots, 100 WAiNK scans, 3 card sets, 100 discovered vehicles, the full map unfogged, 50 of the 80 challenges, and one arcade game finished. Most of these count toward the 100% checklist as well.',
  },
  {
    stage: 4,
    title: 'Robberies, money and the odd ones out',
    body: 'Rob 5 bank vaults and an armored truck, hit one illegal operation for each of the 9 gangs, rob a jewelry store undetected, steal a tank and a docked plane, and take down 5 enemies in one Combat Focus. Launder $250,000 in Marked Bills, spend $100,000, buy all 8 garages, register 10 vehicles — and chase the UFO easter egg and the other one-off trophies.',
  },
  {
    stage: 5,
    title: '100% completion, then the platinum',
    body: 'Open Progress, then Stats, then 100% Completion after the story and finish whatever is left. A Long Road (gold) is the last hard trophy; the platinum, Vice Got a Price!, pops the moment it and every other trophy are earned.',
  },
];

// Render the five roadmap stages, each with the trophies assigned to it.
export function renderRoadmap(trophies, mount) {
  mount.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.stage);
    const earned = members.filter((t) => t._earned).length;
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    const number = document.createElement('span');
    number.textContent = 'Stage ' + stage.stage + ' — ';
    heading.append(number, document.createTextNode(stage.title));
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = earned + ' / ' + members.length + ' earned';
    heading.append(count);
    const body = document.createElement('p');
    body.textContent = stage.body;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    // Story trophies stay hidden here too while the spoiler setting is on.
    names.textContent = members
      .map((t) => (t._spoilerHidden ? 'Hidden story trophy' : t.name))
      .join(' · ');
    item.append(heading, body, names);
    mount.append(item);
  }
}

// Render the missable section: every trophy flagged missable, plus the
// warning that the rest of the list cannot be missed.
export function renderMissables(trophies, mount) {
  mount.innerHTML = '';
  const flagged = trophies.filter((t) => t.missable);
  if (flagged.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'No trophy is flagged missable in the current data.';
    mount.append(note);
    return;
  }
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = '⚠ ' + trophy.name;
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const sources = document.createElement('p');
    sources.textContent = 'Source: ' + trophy.sources.map((s) => s.name).join('; ') + '.';
    card.append(heading, desc, guide, sources);
    mount.append(card);
  }
  const reassurance = document.createElement('p');
  reassurance.className = 'section-intro';
  reassurance.textContent =
    'Every other trophy can be earned after the story in free-roam. ' +
    'PowerPyx confirms that all trophy-related quest givers return after the story, ' +
    'and that nothing toward 100% completion is missable.';
  mount.append(reassurance);
}
