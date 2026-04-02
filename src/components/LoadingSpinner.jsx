import React from 'react';

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border border-gray-100 flex flex-col"
      style={{ background: '#F9FAFB', padding: '16px', minHeight: '120px' }}
    >
      <div className="skeleton h-8 w-8 rounded-xl mb-3" />
      <div className="skeleton h-4 w-3/4 rounded mb-1.5" />
      <div className="skeleton h-3 w-1/2 rounded mt-auto" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/3 rounded mb-2" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full shrink-0" />
    </div>
  );
}

export function LoadingSpinner({ color = '#EC4899' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round">
            <animateTransform
              attributeName="transform" type="rotate"
              from="0 12 12" to="360 12 12"
              dur="0.75s" repeatCount="indefinite"
            />
          </path>
        </svg>
        <span className="text-sm text-gray-400 font-medium">Loading…</span>
      </div>
    </div>
  );
}
