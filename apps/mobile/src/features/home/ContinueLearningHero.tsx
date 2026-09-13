import { brand, categoryArt, categoryCardBackgrounds, categoryIcons, homeAssets } from '@/design-system/assets';
import { LandscapeHeroPanel, type HomeMetrics } from '@/design-system/landscape';
import type { TalkiCategory } from '@/domain/types';
import { STAR_STEP, wordsToNextStar } from '@/domain/progress/stars';
import { plain } from '@/domain/vocabulary/niqqud';
import { testIds } from '@/testing/testIds';

export interface ContinueLearningHeroProps {
  category: TalkiCategory;
  learned: number;
  points: number;
  metrics: HomeMetrics;
  /** Strip index of `category`, so the hero thumbnail's scenic fill matches
   *  the card the child sees for the same category. */
  backgroundIndex?: number;
  onContinue: () => void;
}

/**
 * Landscape Home welcome / continue-learning hero.
 *
 * Behaviour still matches legacy `homeHero()`:
 *   fresh      learned.size === 0 → welcome copy, no progress bar
 *   returning  "ממשיכים עם" + category title + this-category progress
 *
 * Presentation is the v3 mock's large central card (see `LandscapeHeroPanel`
 * and `homeLayout.ts`): mascot on the scenic side, copy + progress + CTA in
 * the card's copy column, category artwork in the card's thumbnail frame.
 */
export function ContinueLearningHero({
  category,
  learned,
  points,
  metrics,
  backgroundIndex = 0,
  onContinue,
}: ContinueLearningHeroProps) {
  const fresh = points === 0;
  const total = category.items.length;
  const progress = total > 0 ? learned / total : 0;
  const remaining = wordsToNextStar(points);
  const thumbnail =
    category.id === 'mine' ? brand.starMark : (categoryArt[category.id] ?? categoryIcons[category.id]);
  const thumbnailBackground =
    categoryCardBackgrounds[backgroundIndex % categoryCardBackgrounds.length];

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
        thumbnailBackground={thumbnailBackground}
      />
    );
  }

  return (
    <LandscapeHeroPanel
      testID={testIds.home.hero}
      ctaTestID={testIds.home.heroContinue}
      metrics={metrics}
      eyebrow="ממשיכים עם"
      title={plain(category.title)}
      subtitle={`עוד ${Math.min(remaining, STAR_STEP)} מילים לכוכב הבא`}
      progress={progress}
      progressLabel={`${learned}/${total}`}
      ctaLabel="המשך ללמוד"
      onCtaPress={onContinue}
      mascot={homeAssets.heroStar}
      titleMark={brand.starMark}
      thumbnail={thumbnail}
      thumbnailBackground={thumbnailBackground}
    />
  );
}
