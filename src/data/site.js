/**
 * Everything about the show that more than one component needs.
 *
 * These were previously repeated across index.html — the Spotify URL appeared
 * four times, which is four chances to update three of them.
 */
export const site = {
  name: 'Grey Duck Running',
  tagline: 'A podcast for the mediocre runner',
  url: 'https://greyduckrunning.com',
  description:
    'A podcast for the mediocre runner. Christian and Lauren cover Midwest ' +
    'endurance events — running, biking, hiking and more.',
  hosts: ['Christian', 'Lauren'],
};

export const links = {
  spotify: 'https://open.spotify.com/show/033LBDWqdgBps2G7CM41d2',
  instagram: 'https://www.instagram.com/greyduckrunning',
  strava: 'https://www.strava.com/clubs/2297694',
  rss: '/feed.xml',
};

/** Shown in the footer, in this order. */
export const social = [
  { key: 'spotify', icon: 'spotify', label: 'Listen on Spotify', href: links.spotify },
  { key: 'instagram', icon: 'instagram', label: 'Instagram', href: links.instagram },
  { key: 'strava', icon: 'strava', label: 'Join the Strava club', href: links.strava },
];

/** The two header actions. Deliberately not "Listen" — the player is on the page. */
export const actions = [
  { brand: 'spotify', icon: 'spotify', text: 'Subscribe', label: 'Subscribe on Spotify', href: links.spotify },
  { brand: 'strava', icon: 'strava', text: 'Join the Club', label: 'Join the Strava club', href: links.strava },
];

export const coverage = [
  { title: 'Running Races', body: '5Ks, half and full marathons, and trail races around the region.' },
  { title: 'Bike Events', body: 'Gravel rides and long-distance events like Ride Across Wisconsin.' },
  { title: 'Hiking', body: 'Trails across the Upper Midwest.' },
  { title: 'Previews and Recaps', body: "What a course is like and whether it's worth signing up for." },
];
