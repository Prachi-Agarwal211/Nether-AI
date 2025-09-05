'use client';

export default function MainLayout({ children }) {
  // Keep this route-group layout minimal to avoid double-wrapping
  // when child segments (e.g., dashboard) define their own layouts.
  return <>{children}</>;
}
