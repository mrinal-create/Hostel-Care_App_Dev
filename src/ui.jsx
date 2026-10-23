import React from 'react';

export const categories = [
  'Plumbing', 'Electrical', 'Fans / Lighting', 'AC Related',
  'Wi-Fi', 'Furniture', 'Cleaning / Sanitation', 'Other',
];

export const priorities = ['Low', 'Medium', 'High', 'Urgent'];

export const categoryStaff = {
  Electrical: ['Amit Sharma', 'Sandeep Yadav'],
  'Fans / Lighting': ['Amit Sharma', 'Sandeep Yadav'],
  Plumbing: ['Manoj Kumar', 'Deepak Verma'],
  Furniture: ['Manoj Kumar', 'Deepak Verma'],
  'Cleaning / Sanitation': ['Manoj Kumar', 'Deepak Verma'],
  'Wi-Fi': ['Rahul Singh', 'Karan Mehta'],
  'AC Related': ['Vikram Patel', 'Imran Khan'],
  Other: ['Vikram Patel', 'Imran Khan'],
};

export const studentNav = [
  ['dashboard', 'Dashboard', '⌂'],
  ['new', 'New Complaint', '＋'],
  ['announcements', 'Announcements', '▤'],
];

export const adminNav = [
  ['dashboard', 'Dashboard', '⌂'],
  ['complaints', 'All Complaints', '▦'],
  ['workers', 'Workers', '⚒'],
  ['announcements', 'Announcements', '▤'],
];

export const formatDate = (date) =>
  date ? new Date(date).toLocaleString([], {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }) : '—';

export function Pill({ children, kind = '' }) {
  return <span className={`pill ${kind}`}>{children}</span>;
}

export function Status({ value }) {
  const status = value || 'Submitted';
  return <Pill kind={`s-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</Pill>;
}

export function Priority({ value }) {
  const priority = value || 'Medium';
  return <Pill kind={`p-${priority.toLowerCase()}`}>{priority}</Pill>;
}

export function Empty({ title, detail }) {
  return <div className="empty"><span>✳</span><b>{title}</b><small>{detail}</small></div>;
}

export function Metric({ label, value, sub, icon, tone }) {
  return <article className="card metric"><div className={`metric-icon ${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>;
}
