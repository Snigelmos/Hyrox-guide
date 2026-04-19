"""
Hyrox Competition Scraper

Scrapes upcoming Hyrox events from hyrox.com and outputs competitions.json.
Run manually or schedule via GitHub Actions (weekly).

Usage:
    python scripts/scrape_competitions.py

Output:
    src/data/competitions.json
"""

import json
import re
from datetime import datetime
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Install dependencies: pip install requests beautifulsoup4")
    print("Falling back to sample data...")
    requests = None
    BeautifulSoup = None

OUTPUT_PATH = Path(__file__).parent.parent / "src" / "data" / "competitions.json"
HYROX_EVENTS_URL = "https://hyrox.com/find-your-race/"


def scrape_competitions() -> list[dict]:
    """Attempt to scrape competitions from hyrox.com."""
    if not requests or not BeautifulSoup:
        return []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(HYROX_EVENTS_URL, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        competitions = []

        # Look for event cards/listings — structure may change, adapt selectors as needed
        event_elements = soup.select(".event-card, .race-card, [data-event], .event-item")

        for el in event_elements:
            title_el = el.select_one("h2, h3, .event-title, .race-title")
            date_el = el.select_one(".event-date, .race-date, time")
            link_el = el.select_one("a[href]")
            location_el = el.select_one(".event-location, .race-location, .venue")

            if title_el:
                city = title_el.get_text(strip=True).replace("HYROX", "").strip()
                date_str = date_el.get_text(strip=True) if date_el else ""
                url = link_el["href"] if link_el else HYROX_EVENTS_URL
                venue = location_el.get_text(strip=True) if location_el else ""

                if not url.startswith("http"):
                    url = f"https://hyrox.com{url}"

                competitions.append({
                    "city": city,
                    "country": extract_country(city),
                    "date": parse_date(date_str),
                    "venue": venue,
                    "registrationUrl": url,
                    "status": "open",
                })

        return competitions

    except Exception as e:
        print(f"Scraping failed: {e}")
        return []


def extract_country(city_text: str) -> str:
    """Best-effort country extraction from city name."""
    country_map = {
        "London": "UK", "Manchester": "UK", "Birmingham": "UK",
        "Hamburg": "Germany", "Berlin": "Germany", "Munich": "Germany", "Cologne": "Germany",
        "New York": "USA", "Chicago": "USA", "Dallas": "USA", "Miami": "USA",
        "Los Angeles": "USA", "Atlanta": "USA", "Denver": "USA", "Boston": "USA",
        "Paris": "France", "Lyon": "France", "Marseille": "France",
        "Amsterdam": "Netherlands", "Rotterdam": "Netherlands",
        "Stockholm": "Sweden", "Gothenburg": "Sweden", "Malmö": "Sweden",
        "Madrid": "Spain", "Barcelona": "Spain",
        "Milan": "Italy", "Rome": "Italy",
        "Sydney": "Australia", "Melbourne": "Australia",
        "Dubai": "UAE", "Singapore": "Singapore", "Hong Kong": "Hong Kong",
        "Seoul": "South Korea", "Tokyo": "Japan",
        "Zurich": "Switzerland",
        "Vienna": "Austria",
        "Copenhagen": "Denmark",
        "Oslo": "Norway",
        "Helsinki": "Finland",
        "Lisbon": "Portugal",
    }
    for city, country in country_map.items():
        if city.lower() in city_text.lower():
            return country
    return "Unknown"


def parse_date(date_str: str) -> str:
    """Try to parse a date string into ISO format."""
    if not date_str:
        return ""
    formats = ["%B %d, %Y", "%d %B %Y", "%d/%m/%Y", "%Y-%m-%d", "%b %d, %Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str


def get_sample_data() -> list[dict]:
    """Fallback sample data for development and when scraping fails."""
    return [
        {"city": "Hamburg", "country": "Germany", "date": "2026-06-14", "venue": "Hamburg Messe", "registrationUrl": "https://hyrox.com/event/hamburg/", "status": "open", "region": "Europe"},
        {"city": "London", "country": "UK", "date": "2026-06-28", "venue": "ExCeL London", "registrationUrl": "https://hyrox.com/event/london/", "status": "open", "region": "Europe"},
        {"city": "New York", "country": "USA", "date": "2026-07-12", "venue": "Javits Center", "registrationUrl": "https://hyrox.com/event/new-york/", "status": "open", "region": "North America"},
        {"city": "Stockholm", "country": "Sweden", "date": "2026-07-19", "venue": "Stockholmsmässan", "registrationUrl": "https://hyrox.com/event/stockholm/", "status": "open", "region": "Europe"},
        {"city": "Paris", "country": "France", "date": "2026-08-02", "venue": "Paris Expo Porte de Versailles", "registrationUrl": "https://hyrox.com/event/paris/", "status": "open", "region": "Europe"},
        {"city": "Chicago", "country": "USA", "date": "2026-08-16", "venue": "McCormick Place", "registrationUrl": "https://hyrox.com/event/chicago/", "status": "open", "region": "North America"},
        {"city": "Berlin", "country": "Germany", "date": "2026-09-06", "venue": "Messe Berlin", "registrationUrl": "https://hyrox.com/event/berlin/", "status": "open", "region": "Europe"},
        {"city": "Amsterdam", "country": "Netherlands", "date": "2026-09-20", "venue": "RAI Amsterdam", "registrationUrl": "https://hyrox.com/event/amsterdam/", "status": "open", "region": "Europe"},
        {"city": "Sydney", "country": "Australia", "date": "2026-09-27", "venue": "ICC Sydney", "registrationUrl": "https://hyrox.com/event/sydney/", "status": "open", "region": "Asia Pacific"},
        {"city": "Dallas", "country": "USA", "date": "2026-10-10", "venue": "Kay Bailey Hutchison Convention Center", "registrationUrl": "https://hyrox.com/event/dallas/", "status": "open", "region": "North America"},
        {"city": "Manchester", "country": "UK", "date": "2026-10-24", "venue": "Manchester Central", "registrationUrl": "https://hyrox.com/event/manchester/", "status": "open", "region": "Europe"},
        {"city": "Gothenburg", "country": "Sweden", "date": "2026-11-07", "venue": "Svenska Mässan", "registrationUrl": "https://hyrox.com/event/gothenburg/", "status": "open", "region": "Europe"},
        {"city": "Dubai", "country": "UAE", "date": "2026-11-14", "venue": "Dubai World Trade Centre", "registrationUrl": "https://hyrox.com/event/dubai/", "status": "open", "region": "Middle East"},
        {"city": "Milan", "country": "Italy", "date": "2026-11-21", "venue": "Fiera Milano", "registrationUrl": "https://hyrox.com/event/milan/", "status": "open", "region": "Europe"},
        {"city": "Los Angeles", "country": "USA", "date": "2026-12-05", "venue": "Los Angeles Convention Center", "registrationUrl": "https://hyrox.com/event/los-angeles/", "status": "open", "region": "North America"},
        {"city": "Madrid", "country": "Spain", "date": "2026-12-12", "venue": "IFEMA Madrid", "registrationUrl": "https://hyrox.com/event/madrid/", "status": "open", "region": "Europe"},
        {"city": "Singapore", "country": "Singapore", "date": "2027-01-17", "venue": "Singapore Expo", "registrationUrl": "https://hyrox.com/event/singapore/", "status": "coming_soon", "region": "Asia Pacific"},
        {"city": "Munich", "country": "Germany", "date": "2027-01-31", "venue": "Messe München", "registrationUrl": "https://hyrox.com/event/munich/", "status": "coming_soon", "region": "Europe"},
    ]


def main():
    print("Scraping Hyrox competitions...")
    competitions = scrape_competitions()

    if not competitions:
        print("Using sample data (scraping returned no results)")
        competitions = get_sample_data()
    else:
        print(f"Found {len(competitions)} competitions")

    # Add region if not present
    region_map = {
        "USA": "North America", "UK": "Europe", "Germany": "Europe",
        "France": "Europe", "Netherlands": "Europe", "Sweden": "Europe",
        "Spain": "Europe", "Italy": "Europe", "Switzerland": "Europe",
        "Austria": "Europe", "Denmark": "Europe", "Norway": "Europe",
        "Finland": "Europe", "Portugal": "Europe",
        "Australia": "Asia Pacific", "Singapore": "Asia Pacific",
        "Hong Kong": "Asia Pacific", "South Korea": "Asia Pacific",
        "Japan": "Asia Pacific", "UAE": "Middle East",
    }
    for comp in competitions:
        if "region" not in comp:
            comp["region"] = region_map.get(comp["country"], "Other")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(competitions, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(competitions)} competitions to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
