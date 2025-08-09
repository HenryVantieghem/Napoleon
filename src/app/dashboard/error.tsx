'use client';
export default function DashboardError({ error }: { error: Error }) {
  return <div className="p-6">Dashboard unavailable. Please refresh.</div>;
}


