import { useState, useEffect, useCallback } from 'react';
import { parseCSV, organizeData, SAMPLE_DATA } from '../utils/dataParser';
import { getCached, setCache } from '../utils/cache';

// ─────────────────────────────────────────────────────────────────────────────
// Replace SHEET_ID with your published Google Sheet ID
// ─────────────────────────────────────────────────────────────────────────────
// Your SHEET_ID can be one of two formats:
//
// FORMAT A — Published web key (starts with "2PACX-"):
//   File → Share → Publish to web → CSV → copy the key from the URL
//   e.g. https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv
//          ↑ paste just the 2PACX-... part
//
// FORMAT B — Regular spreadsheet ID (from the editor URL):
//   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_ID = '2PACX-1vSWZjtApD4fljd2sP1t18L_HlUHUBoUx3_Z4igII-zTSOo8IJpLLtr9lpaSFbN54g_YgvqaIn3Z205u';
const SHEET_GID = '0'; // 0 = first sheet

function getSheetURL() {
  if (!SHEET_ID || SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') return null;
  // Published web key format (2PACX-...)
  if (SHEET_ID.startsWith('2PACX-')) {
    return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&gid=${SHEET_GID}`;
  }
  // Regular spreadsheet ID format
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
}

export function useSheetData() {
  const [data, setData] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // 1. Try local cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = getCached();
      if (cached) {
        setData(cached);
        setTree(organizeData(cached));
        setCacheInfo('Loaded from local cache');
        setLoading(false);
        return;
      }
    }

    // 2. Try fetching from Google Sheets
    const url = getSheetURL();
    if (url) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const csv = await resp.text();
        const rows = parseCSV(csv);
        if (rows.length === 0) throw new Error('No data found in sheet');
        setCache(rows);
        setData(rows);
        setTree(organizeData(rows));
        setCacheInfo('Live from Google Sheets');
        setUsingDemo(false);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Sheet fetch failed, using demo data:', err.message);
        setError(`Could not load from Google Sheets: ${err.message}`);
      }
    }

    // 3. Fall back to built-in sample data
    const organized = organizeData(SAMPLE_DATA);
    setData(SAMPLE_DATA);
    setTree(organized);
    setUsingDemo(true);
    setCacheInfo('Using demo data — add your Sheet ID to show real data');
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, tree, loading, error, usingDemo, cacheInfo, refresh: () => loadData(true) };
}
