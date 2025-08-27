'use client';
import ThemeProvider from './ThemeProvider';
import DeckBackground from './DeckBackground';
import { TitleSlide, TwoColumn, Quote, SectionHeader, FeatureGrid, ProcessDiagram, DataChart, Timeline, ComparisonTable, TeamMembers, FallbackLayout as RegistryFallbackLayout, Agenda } from './layouts';
import { usePresentationStore } from '@/store/usePresentationStore';

// Explicit registry avoids tree-shaking removing components accessed dynamically
const Layouts = { TitleSlide, TwoColumn, Quote, SectionHeader, FeatureGrid, ProcessDiagram, DataChart, Timeline, ComparisonTable, TeamMembers, Agenda, FallbackLayout: RegistryFallbackLayout };

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
  // Normalize: collapse non-alphanumerics to underscores
  const normalized = raw.replace(/[^a-zA-Z0-9]+/g, '_');
  const layoutName = normalized
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Try common variants to be resilient against model output
  const candidates = [
    layoutName,
    `${layoutName}Slide`,
    layoutName.endsWith('Slide') ? layoutName.replace(/Slide$/, '') : null,
  ].filter(Boolean);

  // Build lookup maps for robust resolution
  const availableEntries = Object.entries(Layouts).filter(([, v]) => typeof v === 'function');
  const byExact = new Map(availableEntries);
  const byLower = new Map(availableEntries.map(([k, v]) => [k.toLowerCase(), v]));

  // Alias map (keys normalized to lower + stripped non-alphanum)
  const aliasMap = new Map([
    // Title aliases
    ['title', 'TitleSlide'],
    ['titleslide', 'TitleSlide'],
    ['titlelayout', 'TitleSlide'],

    // TwoColumn aliases
    ['twocolumn', 'TwoColumn'],
    ['twocolumnslide', 'TwoColumn'],
    ['twocolumns', 'TwoColumn'],
    ['twocolumnsslide', 'TwoColumn'],
    ['two_column', 'TwoColumn'],
    ['two_columns', 'TwoColumn'],
    ['twocolumntextandimage', 'TwoColumn'],
    ['two_column_text_and_image', 'TwoColumn'],
    ['threecolumntext', 'TwoColumn'],

    // Agenda -> dedicated Agenda component
    ['agenda', 'Agenda'],
    ['agendaslide', 'Agenda'],
    ['agendalayout', 'Agenda'],

    // Quote
    ['quoteslide', 'Quote'],
    ['quote', 'Quote'],
    ['quotelayout', 'Quote'],

    // Section header
    ['sectionheader', 'SectionHeader'],

    // Feature grid / hub & spoke
    ['featuregrid', 'FeatureGrid'],
    ['hubandspokediagram', 'FeatureGrid'],

    // Process / timeline
    ['processdiagram', 'ProcessDiagram'],
    ['process_diagram', 'ProcessDiagram'],
    ['timelinediagram', 'Timeline'],
    ['timeline', 'Timeline'],
    ['timelineslide', 'Timeline'],

    // Comparison
    ['comparison', 'ComparisonTable'],
    ['comparisontable', 'ComparisonTable'],

    // Team
    ['team', 'TeamMembers'],
    ['teammembers', 'TeamMembers'],

    // Charts / stats
    ['datachart', 'DataChart'],
    ['keystatsinfographic', 'DataChart'],

    // Closing often equals a title-like slide
    ['closinglayout', 'TitleSlide'],
  ]);

  // Diagnostics: log what we see and what we have
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[SlideRenderer] raw:', raw, 'normalized:', normalized, 'candidates:', candidates, 'available:', Object.keys(Layouts));
  }

  let LayoutComponent = FallbackLayout;
  // 1) exact and simple variants
  for (const name of candidates) {
    if (byExact.has(name)) { LayoutComponent = byExact.get(name); break; }
  }
  // 2) case-insensitive match
  if (LayoutComponent === FallbackLayout) {
    for (const name of candidates) {
      const lower = name.toLowerCase();
      if (byLower.has(lower)) { LayoutComponent = byLower.get(lower); break; }
    }
  }
  // 3) try stripping/adding 'slide' suffix in a case-insensitive way
  if (LayoutComponent === FallbackLayout) {
    for (const name of candidates) {
      const base = name.replace(/slide$/i, '');
      const withSlide = `${base}Slide`;
      if (byExact.has(base)) { LayoutComponent = byExact.get(base); break; }
      if (byExact.has(withSlide)) { LayoutComponent = byExact.get(withSlide); break; }
      if (byLower.has(base.toLowerCase())) { LayoutComponent = byLower.get(base.toLowerCase()); break; }
      if (byLower.has(withSlide.toLowerCase())) { LayoutComponent = byLower.get(withSlide.toLowerCase()); break; }
    }
  }
  // 4) alias mapping resolution on fully normalized string
  if (LayoutComponent === FallbackLayout) {
    const fullyNorm = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const aliasTarget = aliasMap.get(fullyNorm) || aliasMap.get(normalized.toLowerCase());
    if (aliasTarget && byExact.has(aliasTarget)) {
      LayoutComponent = byExact.get(aliasTarget);
    }
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
