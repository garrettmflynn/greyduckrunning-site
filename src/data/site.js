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
    'A weekly podcast for the mediocre Midwest runner. Every race has ' +
    'something to offer, from a major marathon to a small-town festival 5K.',
  hosts: ['Christian', 'Lauren'],
};

export const links = {
  spotify: 'https://open.spotify.com/show/033LBDWqdgBps2G7CM41d2',
  instagram: 'https://www.instagram.com/greyduckrunning',
  strava: 'https://www.strava.com/clubs/2297694',
  patreon: 'https://www.patreon.com/cw/Greyduckrunning',
  // Share-sheet tracking params stripped from the URL they arrived with.
  // `autoplay=true` in particular would have started playing on click.
  iheart: 'https://www.iheart.com/podcast/269-grey-duck-running-341147137/',
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
  { key: 'patreon', icon: 'patreon', label: 'Support on Patreon', href: links.patreon },
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
 * Portraits are optional on purpose. `portrait` names a file built by
 * tools/build-portraits.py; a person without one gets a monogram tile of the
 * same shape, so the three columns still line up and the photo can be dropped
 * in later without the page reflowing around it. Lauren's is pending.
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
    portrait: 'christian',
    portraitAlt: 'Christian running the final stretch of a road race',
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
    portrait: 'nova',
    portraitAlt: 'Nova, a cream goldendoodle, sitting on a paved trail',
    bio: [
      "Ruff. Some may say I am the true host of the Grey Duck Running Podcast.",
      "I like to make my voice heard throughout each episode.",
      "When I am not voicing my opinions on the podcast you can find me going for a nice brisk walk, eating bananas, watching TV past my bed time, and showing my love and affection to my family.",
    ],
    signature: 'Love, Nova',
  },
];

/* Lauren's words, edited only where a comma was doing a full stop's job.
   Hiking used to be a fourth tile and is gone at her request — the show does
   not primarily cover hikes, so the site should not say it does. That claim
   also appeared in the hero and the structured data; both were changed with
   this. */
export const coverage = [
  {
    title: 'Running Events',
    body:
      "Around here we don't discriminate — we get excited about covering all " +
      'distances! From one mile road races to one hundred mile trail events, ' +
      "we're happy to cover it.",
  },
  {
    title: 'Bike Events',
    body:
      'The Midwest is home to some beautiful roads and trails, and one of the ' +
      'best ways to experience them is by bike. We cover some of the best ' +
      'untimed road tours along with high-energy timed gravel, road and ' +
      'mountain bike races.',
  },
  {
    title: 'Race Recaps',
    body:
      'Every week we choose two or three events to cover, talk about the top ' +
      'results, and give a bit of a preview of what the course is like. We ' +
      'also highlight things like breweries, coffee shops and other local ' +
      'attractions in the host city that make it worth going out of your way for.',
  },
];

/* The Patreon pitch. Their own page says it plainly — a weekly show for the
   mediocre Midwest runner — so this does not try to sell it harder than they
   do, and it does not invent detail about how the show gets made. */
export const support = {
  title: 'Support the Show',
  body:
    'A weekly episode takes a week of work. If Grey Duck has pointed you ' +
    'toward a race you would not have found otherwise, Patreon is how you ' +
    'can chip in.',
  cta: 'Become a member',
  href: links.patreon,
};
