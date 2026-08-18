#!/usr/bin/env python3
"""Turn the shared Google Calendar into static event data and a public mirror.

Google Calendar is the EDITING interface; this site is the published source of
truth. Same relationship the podcast has with anchor.fm: they host, we
republish at a URL we own, so subscribers survive the day the upstream moves.

Two outputs, mirroring the episodes pipeline exactly:
  src/data/events.json  — parsed, for our own rendering
  public/events.ics     — verbatim mirror, for people to subscribe to

The .ics is copied byte-for-byte rather than regenerated. Calendar clients rely
on UID, SEQUENCE and LAST-MODIFIED to apply edits and cancellations to an
existing subscription; regenerating those by hand is how a subscriber ends up
with duplicate or undeletable events. Audited before republishing: the feed
carries no ORGANIZER, ATTENDEE or email address, only race names, locations and
public registration links.

The source is the calendar's PUBLIC iCal address, so it is safe to keep here in
the open — it exposes nothing that the calendar does not already publish to the
world. It was deliberately not the private "secret address" version: that one is
a bearer credential, and a public repo is the last place it should live.
Override with CALENDAR_ICS_URL if the calendar ever moves.

Run:  python3 tools/build-events.py
"""

import datetime as dt
import html
import json
import os
import re
import sys
import urllib.request

CALENDAR_ID = "da79b4138ed37ab02cf1d5d1fba64871aa4ef98bbe8e6fe2c3e11ef6624a1a71%40group.calendar.google.com"
DEFAULT_ICS = f"https://calendar.google.com/calendar/ical/{CALENDAR_ID}/public/basic.ics"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_OUT = os.path.join(ROOT, "src", "data", "events.json")
ICS_OUT = os.path.join(ROOT, "public", "events.ics")

# How much of the calendar to carry into the site's own data. Past events are
# kept rather than dropped: a race that happened is still worth linking to, and
# discarding them meant the page had no way to show anything at all if the
# calendar ever stopped being updated. The mirror is unaffected either way —
# subscribers always get the whole feed.
FUTURE_DAYS = 400
PAST_DAYS = 400

STATES = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
    "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE",
    "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ",
    "new mexico": "NM", "new york": "NY", "north carolina": "NC",
    "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR",
    "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
}
ABBREVS = set(STATES.values())

STREETISH = re.compile(
    r"^\d|\b(rd|road|ave|avenue|st|street|blvd|dr|drive|ln|lane|way|hwy|highway|pkwy|ct|trl|trail)\.?$",
    re.I,
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "greyduckrunning.com"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def unfold(text):
    """RFC 5545 folds long lines with a leading space or tab on continuation."""
    return re.sub(r"\r?\n[ \t]", "", text)


def unescape(value):
    """iCal escapes commas, semicolons and newlines with a backslash."""
    return (
        value.replace("\\n", " ")
        .replace("\\N", " ")
        .replace("\\,", ",")
        .replace("\;", ";")
        .replace("\\\\", "\\")
        .strip()
    )


def field(block, key):
    m = re.search(rf"^{key}(;[^:]*)?:(.*)$", block, re.M)
    return unescape(m.group(2)) if m else ""


def parse_start(block):
    m = re.search(r"^DTSTART(;[^:]*)?:(\d{8})", block, re.M)
    if not m:
        return None
    d = m.group(2)
    return dt.date(int(d[:4]), int(d[4:6]), int(d[6:8]))


def race_url(block):
    """Pull the race's own page out of the description.

    Every event carries its registration link, but as pasted rich text — an
    <a href>, sometimes wrapped in <u> or <i>, sometimes just a bare URL. That
    link is the single most useful thing on the calendar, so it is worth
    digging out rather than rendering the HTML or dropping it.
    """
    raw = field(block, "DESCRIPTION")
    if not raw:
        return ""
    m = re.search(r'href=["\']([^"\']+)["\']', raw, re.I)
    if not m:
        m = re.search(r'(https?://[^\s<>"\']+)', raw)
    if not m:
        return ""
    url = html.unescape(m.group(1)).strip()
    return url if url.startswith(("http://", "https://")) else ""


def tidy_location(raw):
    """'Chequamegon-Nicolet National Forest, 1170 4th Ave S, Park Falls, WI 54552, USA'
    -> 'Park Falls, WI'.

    Google returns a full postal address: venue, street, city, state+ZIP,
    country. Only city and state earn the space — so anchor on the state and
    take the part before it, unless that part is itself a street, which happens
    when the venue has no city of its own.
    """
    if not raw:
        return ""

    parts = [p.strip() for p in raw.split(",") if p.strip()]
    parts = [p for p in parts if p.upper() not in {"USA", "US", "UNITED STATES"}]
    parts = [re.sub(r"\s+\d{5}(-\d{4})?$", "", p).strip() for p in parts]
    if not parts:
        return ""

    state_at = None
    for i, part in enumerate(parts):
        if part.upper() in ABBREVS or part.lower() in STATES:
            state_at = i
    if state_at is None:
        return ", ".join(parts[-2:])

    state = parts[state_at]
    state = STATES.get(state.lower(), state.upper())
    if state_at == 0:
        return state
    city = parts[state_at - 1]
    return state if STREETISH.search(city) else f"{city}, {state}"


def build():
    url = os.environ.get("CALENDAR_ICS_URL", "").strip() or DEFAULT_ICS
    body = fetch(url)

    # A calendar shared as free/busy still returns 200, just with every event
    # titled "Busy" and no location — which would silently publish a useless
    # page. Fail instead, loudly, naming the setting that is wrong.
    text_probe = body.decode("utf-8", "replace")
    summaries = re.findall(r"^SUMMARY(?:;[^:]*)?:(.*)$", text_probe, re.M)
    if summaries and all(s.strip().lower() == "busy" for s in summaries):
        sys.exit(
            "The calendar is public but shared as free/busy only: every event came\n"
            "back titled 'Busy' with no details.\n"
            "Fix in Google Calendar > Settings and sharing > Access permissions:\n"
            "set the dropdown to 'See all event details'."
        )

    # The mirror people subscribe to: byte-for-byte, so UID/SEQUENCE survive.
    os.makedirs(os.path.dirname(ICS_OUT), exist_ok=True)
    with open(ICS_OUT, "wb") as f:
        f.write(body)

    raw = unfold(body.decode("utf-8", "replace"))
    today = dt.date.today()
    earliest = today - dt.timedelta(days=PAST_DAYS)
    horizon = today + dt.timedelta(days=FUTURE_DAYS)

    events = []
    for block in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", raw, re.S):
        start = parse_start(block)
        title = field(block, "SUMMARY")
        if not start or not title:
            continue
        if field(block, "STATUS").upper() == "CANCELLED":
            continue
        if start < earliest or start > horizon:
            continue

        events.append(
            {
                "title": title,
                "iso": start.isoformat(),
                "day": str(start.day),
                "month": start.strftime("%b"),
                "weekday": start.strftime("%a"),
                "monthKey": start.strftime("%Y-%m"),
                "monthLabel": start.strftime("%B %Y"),
                "monthShort": start.strftime("%b"),
                # Computed at build time, and re-checked in the browser against
                # the real date — the site is static and rebuilt twice a day, so
                # between builds this can be up to half a day stale.
                "past": start < today,
                "location": tidy_location(field(block, "LOCATION")),
                "url": race_url(block),
            }
        )

    events.sort(key=lambda e: (e["iso"], e["title"]))

    os.makedirs(os.path.dirname(JSON_OUT), exist_ok=True)
    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
        f.write("\n")

    upcoming = sum(1 for e in events if not e["past"])
    linked = sum(1 for e in events if e["url"])
    print(f"{len(events)} event(s): {upcoming} upcoming, {len(events) - upcoming} past, {linked} with a race link")
    print(f"  -> {os.path.relpath(JSON_OUT, ROOT)}")
    print(f"  -> {os.path.relpath(ICS_OUT, ROOT)}  ({len(body)} bytes, verbatim)")


if __name__ == "__main__":
    build()
