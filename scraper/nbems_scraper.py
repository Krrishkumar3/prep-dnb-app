#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NBEMS Old Question Paper Scraper
=================================
Scrapes https://natboard.edu.in/dnb_old_qp (147 pages) and extracts:
  Subject, Year, Session, ExamType, PaperNumber, PDF_Link

Output:
  nbems_question_papers.csv  — ready to import into Google Sheets
  nbems_question_papers.json — structured data for programmatic use

Optional:
  Run with --download to also download all PDFs locally into ./pdfs/

Usage:
  pip install requests beautifulsoup4 lxml
  python nbems_scraper.py                      # Scrape only
  python nbems_scraper.py --download           # Scrape + download PDFs
  python nbems_scraper.py --pages 1 5          # Scrape pages 1-5 only (for testing)
  python nbems_scraper.py --subject Anatomy    # Filter by subject name
"""

import re
import csv
import json
import time
import argparse
import os
import sys
from pathlib import Path
from urllib.parse import urljoin, unquote, quote
from typing import Optional, List, Dict, Any

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌  Missing dependencies. Run: pip install requests beautifulsoup4 lxml")
    sys.exit(1)


# ─── Configuration ────────────────────────────────────────────────────────────

BASE_URL    = "https://natboard.edu.in"
START_URL   = "https://natboard.edu.in/dnb_old_qp"
PAGE_URL    = "https://natboard.edu.in/dnb_old_qp.php?page={page}&s="
PDF_MARKER  = "/natboard-data/QuestionPaper/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://natboard.edu.in/",
}

REQUEST_DELAY  = 0.5   # seconds between requests (be polite)
REQUEST_TIMEOUT = 20   # seconds


# ─── Month Lookup ─────────────────────────────────────────────────────────────

MONTH_MAP = {
    "JAN": "January",  "FEB": "February", "MAR": "March",
    "APR": "April",    "MAY": "May",       "JUN": "June",
    "JUL": "July",     "AUG": "August",    "SEP": "September",
    "OCT": "October",  "NOV": "November",  "DEC": "December",
}


# ─── Subject Normalisation Map ────────────────────────────────────────────────
# Maps raw NBEMS specialty names → standardised app subject names.
# Add entries below if you discover new variants in older pages.

SUBJECT_MAP = {
    # ── Anatomy / Pre-Clinical ──
    "Anatomy":                              "Anatomy",
    "Physiology":                           "Physiology",
    "Biochemistry":                         "Biochemistry",

    # ── Para-Clinical ──
    "Pathology":                            "Pathology",
    "Microbiology":                         "Microbiology",
    "Pharmacology":                         "Pharmacology",
    "Forensic Medicine":                    "Forensic Medicine",
    "Community Medicine":                   "Community Medicine",
    "Preventive and Social Medicine":       "Community Medicine",
    "Social and Preventive Medicine":       "Community Medicine",

    # ── Clinical ──
    "General Medicine":                     "General Medicine",
    "Medicine":                             "General Medicine",
    "Paediatrics":                          "Pediatrics",
    "Pediatrics":                           "Pediatrics",
    "Child Health":                         "Pediatrics",
    "General Surgery":                      "General Surgery",
    "Surgery":                              "General Surgery",
    "Orthopaedics":                         "Orthopedics",
    "Orthopaedic Surgery":                  "Orthopedics",
    "Obstetrics and Gynaecology":           "Obstetrics & Gynecology",
    "Obstetrics and Gynecology":            "Obstetrics & Gynecology",
    "Obstetrics & Gynaecology":             "Obstetrics & Gynecology",
    "Ophthalmology":                        "Ophthalmology",
    "Otorhinolaryngology":                  "ENT",
    "Otorhinolaryngology ENT":              "ENT",
    "Ear Nose and Throat":                  "ENT",
    "ENT":                                  "ENT",
    "Dermatology Venereology and Leprosy":  "Dermatology",
    "Dermatology":                          "Dermatology",
    "Psychiatry":                           "Psychiatry",
    "Anaesthesiology":                      "Anesthesia",
    "Anesthesiology":                       "Anesthesia",
    "Anesthesia":                           "Anesthesia",
    "Radio Diagnosis":                      "Radiology",
    "Radiodiagnosis":                       "Radiology",
    "Radiology":                            "Radiology",
    "Radiation Oncology":                   "Radiation Oncology",

    # ── Super-Specialty ──
    "Cardiology":                           "Cardiology",
    "Neurology":                            "Neurology",
    "Nephrology":                           "Nephrology",
    "Gastroenterology":                     "Gastroenterology",
    "Endocrinology":                        "Endocrinology",
    "Respiratory Medicine":                 "Pulmonology",
    "Tuberculosis and Chest Disease":       "Pulmonology",
    "Pulmonary Medicine":                   "Pulmonology",
    "Rheumatology":                         "Rheumatology",
    "Emergency Medicine":                   "Emergency Medicine",
    "Family Medicine":                      "Family Medicine",
    "Neonatology":                          "Pediatrics",
    "Neurosurgery":                         "General Surgery",
    "Urology":                              "General Surgery",
    "Plastic Surgery":                      "General Surgery",
    "Cardiothoracic Surgery":               "General Surgery",
    "Vascular Surgery":                     "General Surgery",
    "Surgical Oncology":                    "General Surgery",
    "Nuclear Medicine":                     "Radiology",

    # ── Additional specialties found in older pages ──
    "Hospital Administration":              "Hospital Administration",
    "Immunohematology and Blood Transfusion": "Pathology",
    "Transfusion Medicine":                 "Pathology",
    "Clinical Haematology":                 "General Medicine",
    "Haematology":                          "Pathology",
    "Medical Oncology":                     "General Medicine",
    "Palliative Medicine":                  "General Medicine",
    "Sports Medicine":                      "Orthopedics",
    "Physical Medicine and Rehabilitation": "Orthopedics",
    "Neonatal and Perinatal Medicine":      "Pediatrics",
    "Paediatric Surgery":                   "General Surgery",
    "Pediatric Surgery":                    "General Surgery",
    "Head and Neck Surgery":                "ENT",
    "Otolaryngology":                       "ENT",
    "Clinical Pharmacology":                "Pharmacology",
    # Legacy format names (no prefix, just specialty)
    "Surgical Gastroenterology":            "Gastroenterology",
    "Surgical Oncology":                    "General Surgery",
    "Thoracic Surgery":                     "General Surgery",
    "Cardiovascular and Thoracic Surgery":  "General Surgery",
    "Cardiothoracic and Vascular Surgery":  "General Surgery",
    "Burns and Plastic Surgery":            "General Surgery",
    "Reconstructive Surgery":               "General Surgery",
    "Obstetrics and Gynecology":            "Obstetrics & Gynecology",
    "Gynaecological Oncology":              "Obstetrics & Gynecology",
    "Vitreoretinal Surgery":                "Ophthalmology",
    "Ocular Pharmacology":                  "Ophthalmology",
    "Cornea":                               "Ophthalmology",
    "Glaucoma":                             "Ophthalmology",
    "Neuro Ophthalmology":                  "Ophthalmology",
    "Neuro-Ophthalmology":                  "Ophthalmology",
    "Epilepsy":                             "Neurology",
    "Neurosciences":                        "Neurology",
    "Critical Care Medicine":               "Emergency Medicine",
    "Intensive Care Medicine":              "Emergency Medicine",
    "Tropical Medicine":                    "General Medicine",
    "Geriatric Medicine":                   "General Medicine",
    "Clinical Nutrition":                   "General Medicine",
    "Interventional Radiology":             "Radiology",
    "Paediatrics":                          "Pediatrics",
    "Paediatric Neurology":                 "Pediatrics",
    "Developmental Paediatrics":            "Pediatrics",
    "Paediatric Intensive Care":            "Pediatrics",
    "Perinatal Medicine":                   "Pediatrics",
    "Reproductive Medicine":                "Obstetrics & Gynecology",
    "Maternal and Foetal Medicine":         "Obstetrics & Gynecology",
    "Anatomy":                              "Anatomy",
    "Physiology":                           "Physiology",
    "Biochemistry":                         "Biochemistry",
    "Pathology":                            "Pathology",
    "Microbiology":                         "Microbiology",
    "Pharmacology":                         "Pharmacology",
    "Forensic Medicine":                    "Forensic Medicine",
    "Community Medicine":                   "Community Medicine",
    "General Medicine":                     "General Medicine",
    "General Surgery":                      "General Surgery",
    "Ophthalmology":                        "Ophthalmology",
    "Psychiatry":                           "Psychiatry",
    "Cardiology":                           "Cardiology",
    "Neurology":                            "Neurology",
    "Nephrology":                           "Nephrology",
    "Gastroenterology":                     "Gastroenterology",
    "Endocrinology":                        "Endocrinology",
    "Rheumatology":                         "Rheumatology",
    "Emergency Medicine":                   "Emergency Medicine",
    "Family Medicine":                      "Family Medicine",
    "Radiation Oncology":                   "Radiation Oncology",
    "Radiiotherapy":                        "Radiation Oncology",
    "Radiotherapy":                         "Radiation Oncology",
    "Opthalmology":                         "Ophthalmology",
}


# ─── Parsing Helpers ──────────────────────────────────────────────────────────

# Format 1 (2022+):  "DNB Anatomy Paper1" / "Diploma Paediatrics Paper 1"
PAPER_RE = re.compile(
    r'^(DNB|Diploma|DrNB)\s+(.+?)\s+Paper\s*(\d+)$',
    re.IGNORECASE
)

# Format 2 (legacy, pre-2022): "Surgical Gastroenterology Paper - 1"
#   No DNB/Diploma prefix; paper number with optional space/dash, or Roman numerals
LEGACY_PAPER_RE = re.compile(
    r'^(.+?)\s+Paper\s*[-–]?\s*([IVXivx]+|\d+)$',
    re.IGNORECASE
)

ROMAN = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6}

def roman_to_int(s: str) -> int:
    """Convert Roman numeral string to int (handles I-VI)."""
    s = s.upper().strip()
    return ROMAN.get(s, 0) or int(s) if s.isdigit() else ROMAN.get(s, 1)

# Matches folder like DNB_DEC25, DNB_JUN24, or plain june20, dec19 etc., or DECEMBER 2015
SESSION_FOLDER_RE = re.compile(
    r'(?:QuestionPaper|pdoof/prev)/([A-Za-z_]+)\s*(\d{2,4})/?',
    re.IGNORECASE
)



def parse_session_from_url(pdf_url: str) -> Dict[str, str]:
    """
    Extract session info from the PDF folder path.
    Handles all known formats:
      - New:    /QuestionPaper/DNB_DEC25/  → December 2025
      - Legacy: /QuestionPaper/june20/     → June 2020
      - Legacy: /pdoof/prev/DECEMBER 2015/ → December 2015
      - Month as full name: /QuestionPaper/DNB_JUNE25/ → June 2025
      - Filename fallback: PAEDIATRIC-DEC11.pdf → December 2011
    """
    match = SESSION_FOLDER_RE.search(pdf_url)
    if not match:
        # Check if year is in filename, like DEC11
        m2 = re.search(r'-([A-Za-z]+)(\d{2})\.pdf$', pdf_url, re.IGNORECASE)
        if m2:
            prefix = m2.group(1).upper()
            yy = m2.group(2)
        else:
            return {"year": "", "session": ""}
    else:
        prefix = match.group(1).upper()   # e.g. "DNB_DEC" or "JUNE" or "DEC"
        yy     = match.group(2)            # e.g. "25" or "20"

    # Full month name lookup (handles "JUNE", "DECEMBER", "OCTOBER" etc.)
    FULL_MONTHS = {
        "JANUARY": "January",   "FEBRUARY": "February", "MARCH": "March",
        "APRIL": "April",       "MAY": "May",            "JUNE": "June",
        "JULY": "July",         "AUGUST": "August",      "SEPTEMBER": "September",
        "OCTOBER": "October",   "NOVEMBER": "November",  "DECEMBER": "December",
    }

    # Try to extract month from the end of the prefix after last underscore
    parts = prefix.rsplit("_", 1)
    suffix = parts[-1].strip()  # e.g. "DEC", "JUN", "JUNE", "DECEMBER"

    month = (
        MONTH_MAP.get(suffix[:3])        # 3-char code: DEC → December
        or FULL_MONTHS.get(suffix)       # full name:  JUNE → June
        or None
    )

    if month is None:
        # Legacy: prefix itself is a month name like "JUNE", "DEC"
        clean = re.sub(r'^[^A-Z]+', '', prefix)
        for code in MONTH_MAP:
            if clean.startswith(code):
                month = MONTH_MAP[code]
                break
        if month is None:
            # Check full month names
            for full, m in FULL_MONTHS.items():
                if clean.startswith(full[:4]):   # match first 4 chars
                    month = m
                    break
        if month is None:
            month = suffix.title()[:3]  # last-resort

    # Year normalization
    yy_int = int(yy)
    if yy_int < 100:
        year = 2000 + yy_int if yy_int < 90 else 1900 + yy_int
    else:
        year = yy_int

    return {"year": str(year), "session": month}


def parse_paper_link(link_text: str, raw_url: str) -> Optional[Dict[str, Any]]:
    """
    Parse a question paper anchor tag into structured fields.
    Handles two source formats:
      - New (2022+):    "DNB Anatomy Paper1"
      - Legacy (<2022): "Surgical Gastroenterology Paper - 1" or "Paediatrics Paper-III"
    """
    text = link_text.strip()

    # ── Format 1: has DNB/Diploma/DrNB prefix ──
    m = PAPER_RE.match(text)
    if m:
        prefix       = m.group(1).upper()
        raw_subject  = m.group(2).strip()
        paper_number = int(m.group(3))
        exam_type    = "DipNB" if prefix == "DIPLOMA" else "DNB"
    else:
        # ── Format 2: legacy — no prefix ──
        m2 = LEGACY_PAPER_RE.match(text)
        if not m2:
            # ── Format 3: pdoof style, e.g. "RHEUMATOLOGY RHEUM P-II DECEMBER 2015" or just "PAEDIATRIC-DEC11"
            m3 = re.search(r'P[-_]?([IVXivx]+|\d+)', text, re.IGNORECASE)
            paper_number = roman_to_int(m3.group(1)) if m3 else 1
            raw_subject = text.split('-')[0].split(' P-')[0].split(' DECEMBER')[0].strip()
            
            # If the link text is just "OTORHINOLARYNGOLOGY (ENT)-DEC11.pdf", clean it up
            if raw_subject.upper().endswith('.PDF'):
                raw_subject = raw_subject[:-4].strip()
                
            # If the raw URL has a clear subject folder, use that instead, but avoid fake subjects
            if 'pdoof/prev/' in raw_url:
                parts = raw_url.split('/')
                # ../pdoof/prev/DECEMBER 2015/RHEUMATOLOGY/RHEUM P-II.pdf
                part2 = unquote(parts[-2]).strip()
                part2_lower = part2.lower()
                
                # Check if part2 is a valid sounding folder (not "prev", not a month)
                is_invalid_subject = (
                    part2_lower == 'prev' or 
                    part2_lower.startswith('dec') or 
                    part2_lower.startswith('jun') or
                    part2_lower.startswith('oct')
                )
                
                if len(parts) >= 3 and not is_invalid_subject:
                    raw_subject = part2
        else:
            raw_subject  = m2.group(1).strip()
            paper_number = roman_to_int(m2.group(2))

        if not raw_subject:
            return None
            
        # Guess ExamType from subject map; default DNB
        exam_type = "DNB"

    # Normalise subject name using SUBJECT_MAP
    subject = SUBJECT_MAP.get(raw_subject)
    if subject is None:
        for key in SUBJECT_MAP:
            if raw_subject.lower().startswith(key.lower()):
                subject = SUBJECT_MAP[key]
                break
        if subject is None:
            subject = raw_subject  # keep as-is

    return {
        "subject":      subject,
        "raw_subject":  raw_subject,
        "exam_type":    exam_type,
        "paper_number": paper_number,
    }


def is_pdf_question_paper(href: str) -> bool:
    """True if the link is an actual question paper PDF."""
    if not href: return False
    lower = href.lower()
    
    # Needs to be a PDF and have question paper markers
    if not lower.endswith(".pdf"): return False
    if "questionpaper" not in lower and "pdoof" not in lower: return False
    
    # Exclude other types of PDFs in pdoof
    if any(x in lower for x in ["bulletin", "press", "performance", "guideline", "notice", "syllabus"]):
        return False
        
    return True


def make_absolute(href: str) -> str:
    """Ensure URL is absolute."""
    if href.startswith("http"):
        return href
    return urljoin(BASE_URL, href)


# ─── Scraper ──────────────────────────────────────────────────────────────────

class NBEMSScraper:
    def __init__(self, delay: float = REQUEST_DELAY):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.delay   = delay
        self.results = []
        self.seen    = set()   # for deduplication

    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch a page and return a BeautifulSoup object."""
        try:
            resp = self.session.get(url, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except requests.RequestException as e:
            print(f"  ⚠️  Failed to fetch {url}: {e}")
            return None

    def get_total_pages(self) -> int:
        """Read the 'Last' pagination link to determine total page count."""
        soup = self.fetch_page(START_URL)
        if not soup:
            return 147  # fallback
        last_link = soup.find("a", string=re.compile(r'\[Last\]', re.I))
        if last_link:
            m = re.search(r'page=(\d+)', last_link.get("href", ""))
            if m:
                return int(m.group(1))
        return 147

    def scrape_page(self, url: str) -> List[Dict[str, Any]]:
        """Scrape all question paper links from a single page."""
        soup = self.fetch_page(url)
        if not soup:
            return []

        records = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if not is_pdf_question_paper(href):
                continue

            abs_url    = make_absolute(href)
            link_text  = a.get_text(strip=True)

            # Dedup by URL
            if abs_url in self.seen:
                continue
            self.seen.add(abs_url)

            paper_info = parse_paper_link(link_text, abs_url)
            if not paper_info:
                # Try to parse from the filename itself
                filename = unquote(abs_url.split("/")[-1]).replace(".pdf", "")
                paper_info = parse_paper_link(filename, abs_url)
            if not paper_info:
                print(f"  ⚠️  Could not parse: '{link_text}' — {abs_url}")
                continue

            session_info = parse_session_from_url(abs_url)

            record = {
                "Subject":     paper_info["subject"],
                "Year":        session_info["year"],
                "Session":     session_info["session"],
                "ExamType":    paper_info["exam_type"],
                "PaperNumber": paper_info["paper_number"],
                "PDF_Link":    abs_url,
                # Extra debug fields (can be removed)
                "_raw_subject": paper_info["raw_subject"],
                "_link_text":   link_text,
            }
            records.append(record)

        return records

    def scrape_all(
        self,
        start_page: int = 1,
        end_page:   Optional[int] = None,
        subject_filter: Optional[str] = None
    ):
        """Scrape all paginated pages."""
        if end_page is None:
            print("📡  Detecting total pages…")
            end_page = self.get_total_pages()

        total = end_page - start_page + 1
        print(f"📋  Scraping pages {start_page}–{end_page} ({total} pages)\n")

        for page_num in range(start_page, end_page + 1):
            url = START_URL if page_num == 1 else PAGE_URL.format(page=page_num)
            print(f"  [{page_num:>3}/{end_page}] {url}", end="  ")

            records = self.scrape_page(url)
            found   = len(records)

            if subject_filter:
                records = [
                    r for r in records
                    if subject_filter.lower() in r["Subject"].lower()
                ]

            self.results.extend(records)
            print(f"→  {found} PDFs found  (total so far: {len(self.results)})")

            time.sleep(self.delay)

        print(f"\n✅  Done! Collected {len(self.results)} question paper records.")


# ─── Output Writers ───────────────────────────────────────────────────────────

FIELDNAMES = ["Subject", "Year", "Session", "ExamType", "PaperNumber", "PDF_Link"]


def write_csv(records: list[dict], filepath: str):
    """Write records to CSV in Google Sheets-compatible format."""
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    print(f"💾  CSV saved → {filepath}  ({len(records)} rows)")


def write_json(records: list[dict], filepath: str):
    """Write records to JSON (useful for debugging / app import)."""
    # Strip internal debug fields
    clean = [{k: v for k, v in r.items() if not k.startswith("_")} for r in records]
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=2, ensure_ascii=False)
    print(f"💾  JSON saved → {filepath}")


# ─── PDF Downloader ───────────────────────────────────────────────────────────

def download_pdf(session: requests.Session, url: str, dest_path: Path):
    """Download a single PDF to dest_path."""
    if dest_path.exists():
        return "skip"
    try:
        resp = session.get(url, timeout=30, stream=True)
        resp.raise_for_status()
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return "ok"
    except Exception as e:
        return f"error: {e}"


def download_all_pdfs(records: list[dict], output_dir: str = "pdfs"):
    """
    Download all PDFs into a structured directory tree:
      pdfs/{ExamType}/{Subject}/{Session}_{Year}/Paper_{N}.pdf
    """
    base = Path(output_dir)
    base.mkdir(exist_ok=True)

    sess = requests.Session()
    sess.headers.update(HEADERS)

    total   = len(records)
    skipped = 0
    errors  = 0

    print(f"\n📥  Downloading {total} PDFs into ./{output_dir}/\n")

    for i, rec in enumerate(records, 1):
        # Build safe filename
        subject  = re.sub(r'[^\w\s-]', '', rec["Subject"]).strip().replace(" ", "_")
        session  = rec["Session"]
        year     = rec["Year"]
        exam     = rec["ExamType"]
        paper_n  = rec["PaperNumber"]

        dest = base / exam / subject / f"{session}_{year}" / f"Paper_{paper_n}.pdf"

        status = download_pdf(sess, rec["PDF_Link"], dest)

        if status == "skip":
            skipped += 1
            prefix = "⏭ "
        elif status == "ok":
            prefix = "✅"
        else:
            errors += 1
            prefix = "❌"

        print(f"  {prefix} [{i:>4}/{total}] {exam}/{subject}/Paper_{paper_n}  {status}")
        time.sleep(0.3)

    print(f"\n📦  Done. Downloaded: {total-skipped-errors}  |  Skipped: {skipped}  |  Errors: {errors}")


# ─── Unknown Subject Logger ───────────────────────────────────────────────────

def log_unknown_subjects(records: List[Dict[str, Any]]):
    """Print subjects that had NO entry in SUBJECT_MAP at all (truly unmapped)."""
    unknowns = {}
    for r in records:
        raw = r.get("_raw_subject", "")
        # Truly unmapped: key not in SUBJECT_MAP AND no prefix match was found
        if raw not in SUBJECT_MAP:
            # Check if any prefix match saved it
            matched = any(raw.lower().startswith(k.lower()) for k in SUBJECT_MAP)
            if not matched:
                unknowns[raw] = unknowns.get(raw, 0) + 1

    if unknowns:
        print("\n⚠️   Subjects with NO mapping (kept as raw — add to SUBJECT_MAP if needed):")
        for name, count in sorted(unknowns.items(), key=lambda x: -x[1]):
            print(f"     {count:>4}× '{name}'")
        print()
    else:
        print("\n✅  All subjects matched the normalisation map.\n")


# ─── Print Summary ────────────────────────────────────────────────────────────

def print_summary(records: list[dict]):
    from collections import Counter

    subjects  = Counter(r["Subject"]    for r in records)
    sessions  = Counter(f"{r['Session']} {r['Year']}" for r in records)
    examtypes = Counter(r["ExamType"]   for r in records)

    print("\n" + "═" * 55)
    print("  📊  SCRAPE SUMMARY")
    print("═" * 55)
    print(f"  Total records   : {len(records)}")
    print(f"  Unique subjects : {len(subjects)}")
    print(f"  Unique sessions : {len(sessions)}")
    print(f"\n  ExamType breakdown:")
    for et, count in examtypes.most_common():
        bar = "█" * (count // 20)
        print(f"    {et:<10} {count:>4} {bar}")
    print(f"\n  Top 10 subjects:")
    for subj, count in subjects.most_common(10):
        print(f"    {count:>4}× {subj}")
    print(f"\n  Sessions found:")
    for ses, count in sorted(sessions.items()):
        print(f"    {count:>4}× {ses}")
    print("═" * 55 + "\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Scrape NBEMS question papers into CSV/JSON",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--pages", nargs=2, type=int, metavar=("START", "END"),
        help="Scrape a specific page range (default: all 147 pages)"
    )
    parser.add_argument(
        "--subject", type=str, default=None,
        help="Filter: only include records matching this subject name"
    )
    parser.add_argument(
        "--download", action="store_true",
        help="Also download all PDFs to ./pdfs/"
    )
    parser.add_argument(
        "--output-dir", type=str, default=".",
        help="Directory to save CSV/JSON output (default: current dir)"
    )
    parser.add_argument(
        "--delay", type=float, default=REQUEST_DELAY,
        help=f"Delay between requests in seconds (default: {REQUEST_DELAY})"
    )
    args = parser.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path  = str(out_dir / "nbems_question_papers.csv")
    json_path = str(out_dir / "nbems_question_papers.json")

    print("=" * 55)
    print("  NBEMS Question Paper Scraper")
    print("  Target: https://natboard.edu.in/dnb_old_qp")
    print("=" * 55 + "\n")

    scraper = NBEMSScraper(delay=args.delay)

    start_page = args.pages[0] if args.pages else 1
    end_page   = args.pages[1] if args.pages else None

    scraper.scrape_all(
        start_page=start_page,
        end_page=end_page,
        subject_filter=args.subject
    )

    records = scraper.results

    if not records:
        print("❌  No records scraped. Exiting.")
        sys.exit(1)

    log_unknown_subjects(records)
    print_summary(records)

    write_csv(records, csv_path)
    write_json(records, json_path)

    if args.download:
        download_all_pdfs(records, output_dir=str(out_dir / "pdfs"))

    print(f"\n🎉  All done! Import '{csv_path}' into your Google Sheet.")
    print(f"    Columns: Subject, Year, Session, ExamType, PaperNumber, PDF_Link\n")


if __name__ == "__main__":
    main()
