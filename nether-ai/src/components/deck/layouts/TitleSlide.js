'use client';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

export function TitleSlide({ title, subtitle, animated }) {
  const theme = useTheme();
  const hasGradient = theme.designBrief?.typography?.textEffects?.headingGradient;
  
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
        className={`text-7xl font-extrabold mb-4 ${hasGradient ? 'heading-gradient' : ''}`}
        style={{
          color: hasGradient ? undefined : 'var(--color-text-primary)',
          '--heading-gradient-colors': hasGradient 
            ? theme.designBrief.typography.textEffects.headingGradient.colors
              .map(color => `var(--color-${color})`)
              .join(', ')
            : undefined
        }}
        variants={animated ? itemVariants : undefined}
      >
        {title}
      </Title>
      {subtitle && (
        <Subtitle
          className="text-2xl max-w-4xl"
          style={{ color: 'var(--color-text-secondary)' }}
          variants={animated ? itemVariants : undefined}
        >
          {subtitle}
        </Subtitle>
      )}
    </Container>
  );
}
