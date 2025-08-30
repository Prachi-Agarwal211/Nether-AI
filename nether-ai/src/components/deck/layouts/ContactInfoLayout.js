'use client';

import { motion } from 'framer-motion';
import { Mail, Globe, Linkedin, Twitter } from 'lucide-react';

const icons = { Mail, Globe, Linkedin, Twitter };

export function ContactInfoLayout({ title = "Thank You", name, role, contacts = [], animated }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center text-center"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h2 variants={itemVariants} className="text-6xl font-bold mb-4" style={{ color: 'var(--color-textPrimary)' }}>
        {title}
      </motion.h2>

      <motion.div variants={itemVariants} className="w-48 h-1 my-6 rounded-full" style={{ background: 'var(--color-primary)' }} />

      {name && (
        <motion.p variants={itemVariants} className="text-4xl font-medium" style={{ color: 'var(--color-textPrimary)' }}>
          {name}
        </motion.p>
      )}
      {role && (
        <motion.p variants={itemVariants} className="text-xl mt-2 text-white/70">
          {role}
        </motion.p>
      )}

      <motion.div
        className="flex items-center justify-center gap-8 mt-12"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {(contacts || []).map((contact, i) => {
          const Icon = icons[contact.icon] || Globe;
          return (
            <motion.a
              key={i}
              href={contact.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-3 text-lg text-white/80 hover:text-white"
            >
              <Icon className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              <span>{contact.label}</span>
            </motion.a>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
