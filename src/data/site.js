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
      "As a kid I loved bikes and being outside. I didn't find running until I joined my high school cross country team, where I found I was actually pretty decent at it. My love for running kept growing, with a preference for longer distances and a slow but sure build up to a marathon. Along the way I encountered a lot of setbacks — I was constantly plagued by stress fractures, which stunted my collegiate running career but let me grow my love of endurance cycling, now a major factor in keeping me healthy while training for long distance events. I ended up with a femoral stress fracture in the winter of 2023 and thought my days of running were over, but after two surgeries to put in, and later remove, a stabilizing plate and rod in my femur, I've been back to running. Physical activity is great for the mind and body no matter your pace or fitness level. Getting out there is the most important part.",
      "When I'm not running or biking, you will probably find me reading a variety of different genres — literary fiction, horror, historical fiction, classic lit. I'm willing to read just about anything, so if you have any recommendations be sure to send them my way!",
    ],
    signature: 'Lauren',
  },
  {
    name: 'Christian Hjelmen',
    role: 'Co-founder',
    bio: [
      "A mediocre runner at heart. I grew up in the Austin, Minnesota area, where my interest in running was first piqued by Track & Field and Cross Country throughout high school.",
      "I continued my running career at the University of Wisconsin River Falls, where I met my lovely co-host Lauren Flynn. In addition to running at UWRF I obtained my Bachelor's degree in Finance, which has been put to good use in my everyday life of crunching numbers. Post college I have dabbled in the marathon running scene, with the goal of running one in all 50 states and eventually venturing into the ultra marathon scene.",
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

export const coverage = [
  { title: 'Running Races', body: '5Ks, half and full marathons, and trail races around the region.' },
  { title: 'Bike Events', body: 'Gravel rides and long-distance events like Ride Across Wisconsin.' },
  { title: 'Hiking', body: 'Trails across the Upper Midwest.' },
  { title: 'Previews and Recaps', body: "What a course is like and whether it's worth signing up for." },
];
