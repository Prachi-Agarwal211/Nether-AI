import { DesignBriefSchema } from '../../src/core/ai-contract.v2';
import { z } from 'zod';

describe('DesignBrief schema validation', () => {
  test('validates minimal MasterHero brief', () => {
    const brief = {
      slideId: 'hero1',
      layout: 'MasterHero',
      content: {
        title: 'Welcome'
      }
    };
    expect(() => DesignBriefSchema.parse(brief)).not.toThrow();
  });

  test('rejects invalid layout type', () => {
    const brief = {
      slideId: 'invalid1',
      layout: 'InvalidLayout',
      content: {}
    };
    expect(() => DesignBriefSchema.parse(brief)).toThrow(z.ZodError);
  });
});
