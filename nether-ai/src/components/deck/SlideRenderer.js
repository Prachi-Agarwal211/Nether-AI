'use client';
import ThemeProvider from './ThemeProvider';
import DeckBackground from './DeckBackground';
import { 
  TitleSlide, TwoColumn, Quote, SectionHeader, FeatureGrid, ProcessDiagram, DataChart, Timeline, ComparisonTable, TeamMembers, FallbackLayout as RegistryFallbackLayout, Agenda, KpiGrid, FullBleedImageLayout, TitleAndBulletsLayout, ContactInfoLayout 
} from './layouts';
import { usePresentationStore } from '@/store/usePresentationStore';

// Explicit registry avoids tree-shaking removing components accessed dynamically
const Layouts = { 
  TitleSlide, TwoColumn, Quote, SectionHeader, FeatureGrid, ProcessDiagram, DataChart, Timeline, ComparisonTable, TeamMembers, Agenda, KpiGrid, FullBleedImageLayout, TitleAndBulletsLayout, ContactInfoLayout,
  FallbackLayout: RegistryFallbackLayout 
};

// Map AI prop synonyms into what our layouts expect
function normalizeRecipeProps(props = {}) {
  const p = { ...props };
  if (!p.bullets && Array.isArray(p.points)) p.bullets = p.points;
  if (!p.bullets && Array.isArray(p.items)) p.bullets = p.items;
  if (!p.body && typeof p.description === 'string') p.body = p.description;
  if (!p.imageUrl) p.imageUrl = p.image || p.imageURL || p.image_url;
  if (!p.quote && typeof p.text === 'string') p.quote = p.text;
  if (!p.author) p.author = p.attribution || p.source;
  return p;
}

const FallbackLayout = ({ recipe }) => (
  <div className="w-full h-full bg-red-900/50 text-white flex flex-col items-center justify-center p-8">
    <p className="font-bold">Error: Layout Not Found</p>
    <p className="text-sm mt-2">Could not find layout: "{recipe?.layout_type}"</p>
  </div>
);

export default function SlideRenderer({ recipe, animated = true }) {
  if (!recipe) return <div className="w-full h-full bg-black" />;
  const { presentation } = usePresentationStore();
  const designSystem = presentation?.designSystem;

  const raw = String(recipe.layout_type || '').trim();
  const layoutName = raw.charAt(0).toUpperCase() + raw.slice(1);
  
  // ALIAS MAP (Expanded for maximum robustness)
  const aliasMap = new Map([
    // Title aliases
    ['title', 'TitleSlide'], ['titleslide', 'TitleSlide'], ['titlelayout', 'TitleSlide'], ['cover', 'TitleSlide'],
    // TwoColumn aliases
    ['twocolumn', 'TwoColumn'], ['two_column', 'TwoColumn'], ['textandimage', 'TwoColumn'],
    // FullBleedImage aliases
    ['fullbleedimage', 'FullBleedImageLayout'], ['fullbleed', 'FullBleedImageLayout'], ['image', 'FullBleedImageLayout'],
    // TitleAndBullets aliases
    ['titleandbullets', 'TitleAndBulletsLayout'], ['bullets', 'TitleAndBulletsLayout'], ['list', 'TitleAndBulletsLayout'],
    // Contact / Closing aliases
    ['contact', 'ContactInfoLayout'], ['contactinfo', 'ContactInfoLayout'], ['thankyou', 'ContactInfoLayout'], ['closing', 'ContactInfoLayout'],
    // Other common aliases
    ['agenda', 'Agenda'], ['quote', 'Quote'], ['sectionheader', 'SectionHeader'], ['section', 'SectionHeader'],
    ['featuregrid', 'FeatureGrid'], ['features', 'FeatureGrid'],
    ['process', 'ProcessDiagram'], ['diagram', 'ProcessDiagram'],
    ['timeline', 'Timeline'], ['chart', 'DataChart'], ['datachart', 'DataChart'],
    ['table', 'ComparisonTable'], ['comparison', 'ComparisonTable'],
    ['team', 'TeamMembers'], ['members', 'TeamMembers'], ['kpi', 'KpiGrid'], ['stats', 'KpiGrid'],
  ]);

  // Logic to find the layout component (more robust)
  let LayoutComponent = FallbackLayout;
  const normalizedKey = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  if (Layouts[layoutName]) {
    LayoutComponent = Layouts[layoutName];
  } else if (aliasMap.has(normalizedKey) && Layouts[aliasMap.get(normalizedKey)]) {
    LayoutComponent = Layouts[aliasMap.get(normalizedKey)];
  }
  
  return (
    <ThemeProvider theme={recipe.theme_runtime} designSystem={designSystem}>
      <div className="relative w-full h-full overflow-hidden">
        <DeckBackground background={recipe?.theme_runtime?.background} backgroundVariant={recipe?.backgroundVariant} animated={animated} />
        <div className="relative z-10 w-full h-full">
          <LayoutComponent {...normalizeRecipeProps(recipe.props)} recipe={recipe} animated={animated} />
        </div>
      </div>
    </ThemeProvider>
  );
}
