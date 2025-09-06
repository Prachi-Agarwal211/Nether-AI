'use client';
import ThemeProvider from './ThemeProvider';
import DeckBackground from './DeckBackground';
import { 
  TitleSlide, TwoColumn, Agenda, ComparisonTable
} from './layouts';
import { usePresentationStore } from '@/store/usePresentationStore';

export default function SlideRenderer({ recipe, animated = true }) {
  const { presentation } = usePresentationStore();
  const designSystem = presentation?.designSystem;
  
  if (!recipe) return <div className="w-full h-full bg-black" />;

  const layoutMap = {
    'TitleSlide': TitleSlide,
    'TwoColumn': TwoColumn,
    'Agenda': Agenda,
    'ComparisonTable': ComparisonTable
  };

  const LayoutComponent = layoutMap[recipe.layout_type] || TitleSlide;
  
  return (
    <ThemeProvider designBrief={designSystem}>
      <div className="relative w-full h-full overflow-hidden">
        <DeckBackground 
          designSystem={designSystem} 
          backgroundVariant={recipe?.backgroundVariant} 
          animated={animated} 
        />
        <div className="relative z-10 w-full h-full">
          <LayoutComponent {...recipe.props} animated={animated} />
        </div>
      </div>
    </ThemeProvider>
  );
}
