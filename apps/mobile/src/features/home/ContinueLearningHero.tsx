import { brand, categoryArt, categoryIcons, homeAssets } from '@/design-system/assets';
import { LandscapeHeroPanel, type HomeMetrics } from '@/design-system/landscape';
import type { TalkiCategory } from '@/domain/types';
import { plain } from '@/domain/vocabulary/niqqud';
import { testIds } from '@/testing/testIds';

export interface ContinueLearningHeroProps {
  category: TalkiCategory;
  learned: number;
  points: number;
  metrics: HomeMetrics;
  onContinue: () => void;
}

/**
 * Landscape Home welcome / continue-learning hero.
 *
 * Behaviour still matches legacy `homeHero()`:
 *   fresh      learned.size === 0 → welcome copy, no progress bar
 *   returning  greeting + this-category progress + category caption
 *
 * Presentation is the redesigned storybook card (see `LandscapeHeroPanel`
 * and `homeLayout.ts`): mascot on the scenic side, copy + progress + CTA in
 * the card's copy column, category artwork in the card's thumbnail frame.
 * The returning state keeps the same constant greeting as the fresh state
 * (card-redesign request) — the category name moves to the small caption
 * under the progress bar instead of standing in as the card's title.
 */
export function ContinueLearningHero({
  category,
  learned,
  points,
  metrics,
  onContinue,
}: ContinueLearningHeroProps) {
  const fresh = points === 0;
  const total = category.items.length;
  const progress = total > 0 ? learned / total : 0;
  const thumbnail =
    category.id === 'mine' ? brand.starMark : (categoryArt[category.id] ?? categoryIcons[category.id]);

  if (fresh) {
    return (
      <LandscapeHeroPanel
        testID={testIds.home.hero}
        ctaTestID={testIds.home.heroContinue}
        metrics={metrics}
        title="היי כאן דברי"
        subtitle="לומדים מילים, מתרגלים ומדברים בביטחון"
        ctaLabel="מתחילים ללמוד"
        onCtaPress={onContinue}
        mascot={homeAssets.heroStar}
        titleMark={brand.starMark}
        thumbnail={thumbnail}
      />
    );
  }

  return (
    <LandscapeHeroPanel
      testID={testIds.home.hero}
      ctaTestID={testIds.home.heroContinue}
      metrics={metrics}
      title="היי כאן דברי"
      subtitle="יאללה נמשיך ללמוד!"
      progress={progress}
      progressLabel={`${learned}/${total}`}
      progressCaption={`קטגוריית ${plain(category.title)}`}
      ctaLabel="המשך ללמוד"
      onCtaPress={onContinue}
      mascot={homeAssets.heroStar}
      titleMark={brand.starMark}
      thumbnail={thumbnail}
    />
  );
}
