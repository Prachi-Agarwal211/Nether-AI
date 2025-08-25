'use client';

export default function Footer() {
  return (
    <footer className="bg-black/20 border-t border-white/10 p-4 text-center text-sm text-white/60">
      <p>© {new Date().getFullYear()} All rights preserved by Reverbex Technology.</p>
    </footer>
  );
}
