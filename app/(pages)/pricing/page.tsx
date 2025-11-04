'use client';

import { useContext } from 'react';

import Hero from '~/components/widgets/Hero';
import Pricing from '~/components/widgets/Pricing';
import Comparison from '~/components/widgets/Comparison';
import FAQs3 from '~/components/widgets/FAQs3';
import { heroPricing, comparisonPricing, faqs3Pricing, pricingPricing } from '~/shared/data/pages/pricing.data';
import { LanguageContext } from '~/context/LanguageContext';
import { getTranslation } from '~/utils/i18n';

const Page = () => {
  const { language } = useContext(LanguageContext);

  const translatedHeroPricing = {
    title: getTranslation(language, 'pricing.hero.title'),
    subtitle: (
      <>
        <span className="hidden md:inline">
          {getTranslation(language, 'pricing.hero.subtitle1')}
        </span>{' '}
        {getTranslation(language, 'pricing.hero.subtitle2')}
      </>
    )
    // tagline: getTranslation(language, 'pricing.hero.tagline'),
  };

  return (
    <>
      <Hero {...translatedHeroPricing} />
      <Pricing {...pricingPricing} />
      <Comparison {...comparisonPricing} />
      <FAQs3 {...faqs3Pricing} />
    </>
  );
};

export default Page;
