import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-24"></div>
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-28 mt-2"></div>
      <div className="h-3 bg-slate-200 rounded w-36"></div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200/50 border border-slate-200/80 animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-44"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
      </div>

      <div className="h-56 bg-slate-100/80 rounded-xl flex items-end p-4 justify-between gap-2">
        <div className="w-full bg-slate-200 rounded-t h-1/3"></div>
        <div className="w-full bg-slate-200 rounded-t h-1/2"></div>
        <div className="w-full bg-slate-200 rounded-t h-3/4"></div>
        <div className="w-full bg-slate-200 rounded-t h-2/3"></div>
        <div className="w-full bg-slate-200 rounded-t h-5/6"></div>
        <div className="w-full bg-slate-200 rounded-t h-full"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/80 overflow-hidden animate-pulse">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-40"></div>
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-32"></div>
                <div className="h-2.5 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-6 bg-slate-200 rounded-full w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
