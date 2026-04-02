import React from 'react';

export function SkeletonCard() {
  return (
    <div className="skeleton rounded-2xl h-28" />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-gray-100">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function LoadingSpinner({ color = '#EC4899' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
        <span className="text-sm text-gray-400 font-medium">Loading questions…</span>
      </div>
    </div>
  );
}
