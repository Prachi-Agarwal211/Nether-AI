'use client';
import { motion } from 'framer-motion';

export function TitleSlide({ title, subtitle, animated }) {
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.2 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 100 } }
  };

  const Container = animated ? motion.div : 'div';
  const Title = animated ? motion.h1 : 'h1';
  const Subtitle = animated ? motion.p : 'p';

  return (
    <Container
      className="w-full h-full p-16 flex flex-col items-center justify-center text-center"
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <Title
        className="text-7xl font-extrabold mb-4 mother-of-pearl-text"
        variants={animated ? itemVariants : undefined}
      >
        {title}
      </Title>
      {subtitle && (
        <Subtitle
          className="text-2xl max-w-4xl text-white/80 leading-relaxed"
          variants={animated ? itemVariants : undefined}
        >
          {subtitle}
        </Subtitle>
      )}
    </Container>
  );
}
