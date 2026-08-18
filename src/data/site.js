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
    'A podcast for the mediocre runner. Christian and Lauren race, ride and ' +
    'hike their way around the Upper Midwest, then talk about it.',
  hosts: ['Christian', 'Lauren'],
};

export const links = {
  spotify: 'https://open.spotify.com/show/033LBDWqdgBps2G7CM41d2',
  instagram: 'https://www.instagram.com/greyduckrunning',
  strava: 'https://www.strava.com/clubs/2297694',
  rss: '/feed.xml',
  eventsIcs: '/events.ics',
};

/** Primary navigation. Order is deliberate: the show first, then the thing
 *  that brings people back weekly, then who we are. */
export const nav = [
  { href: '/episodes/', label: 'Episodes' },
  { href: '/races/', label: 'Races' },
  { href: '/about/', label: 'About' },
];

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

/**
 * Host bios, in their own words.
 *
 * Copyedited for spelling and run-on sentences only — the voice is theirs and
 * should stay that way. Lauren's "Heyy", Christian's "mediocre runner at heart"
 * and Nova's "Ruff" are the point, not slips to be smoothed out.
 *
 * All three are cut to the same three beats, because they already told the
 * same story in the same order and the paragraphing was hiding it:
 *
 *   1. how they got started
 *   2. how it went, running and all
 *   3. what they do when they are not running
 *
 * Each ends with a signature. It is set type for now — drop a transparent PNG
 * or SVG of a real signature at signatureImage and the component uses that
 * instead, with no other change.
 *
 * None of them introduces themselves by title. The name and the role sit
 * directly above in the markup, so an opening line spent on "co-founder of the
 * Grey Duck Running Podcast" was saying twice what the page already said, and
 * pushed the actual hook — the energy she could not regulate, the mediocre
 * runner at heart — into the second sentence. Nova's species moved up into her
 * role line for the same reason.
 */
export const people = [
  {
    name: 'Lauren Flynn',
    role: 'Co-founder',
    bio: [
      "Heyy! From a very young age I had an abundance of energy and a drive in me that I struggled to regulate. It wasn't until I found martial arts that I was able to channel my energy into something useful. From there I discovered movement as a way of keeping my mind from spiraling.",
      "As a kid I loved bikes and being outside. I didn't find running until high school cross country, where it turned out I was pretty decent at it. Longer distances suited me best, and I built slowly up to a marathon. There were setbacks the whole way. Stress fractures plagued me constantly and cut my collegiate running short, but they pushed me toward endurance cycling, which is now a big part of what keeps me healthy while I train. In the winter of 2023 a femoral stress fracture had me convinced my running days were over. Two surgeries later — one to put a plate and rod in, one to take them out — I'm back. Physical activity is great for the mind and body no matter your pace. Getting out there is the most important part.",
      "When I'm not running or biking, you will probably find me reading a variety of different genres — literary fiction, horror, historical fiction, classic lit. I'm willing to read just about anything, so if you have any recommendations be sure to send them my way!",
    ],
    signature: 'Lauren',
  },
  {
    name: 'Christian Hjelmen',
    role: 'Co-founder',
    bio: [
      "A mediocre runner at heart. I grew up in the Austin, Minnesota area, where my interest in running was first piqued by Track & Field and Cross Country throughout high school.",
      "I kept running at the University of Wisconsin River Falls, where I met my lovely co-host Lauren Flynn and picked up a Bachelor's degree in Finance, which I now put to use crunching numbers for a living. Since college I have been working through the marathon scene, with the goal of running one in all 50 states and eventually venturing into ultras.",
      "My interests outside of running are reading, hiking and grabbing a good cup of coffee!",
    ],
    signature: 'Christian',
  },
  {
    name: 'Nova',
    role: "Lauren and Christian's dog",
    bio: [
      "Ruff. Some may say I am the true host of the Grey Duck Running Podcast.",
      "I like to make my voice heard throughout each episode.",
      "When I am not voicing my opinions on the podcast you can find me going for a nice brisk walk, eating bananas, watching TV past my bed time, and showing my love and affection to my family.",
    ],
    signature: 'Love, Nova',
  },
];

/* Each of these has to earn its tile. An earlier version ended three of the
   four with a variation on "around the Upper Midwest", which said the same
   thing three times and told you nothing new. */
export const coverage = [
  { title: 'Running Races', body: '5Ks, halves, marathons, and trail races that go considerably further.' },
  { title: 'Bike Events', body: 'Gravel rides and long-distance events like Ride Across Wisconsin.' },
  { title: 'Hiking', body: 'Trails worth the drive.' },
  { title: 'Previews and Recaps', body: 'What to expect before you sign up, and what actually happened.' },
];
