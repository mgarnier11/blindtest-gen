import { z } from 'zod';
export const COMP_NAME = 'MyComp';

export const CompositionProps = z.object({
  title: z.string(),
  repeats: z.number(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: 'Next.js and Remotion',
  repeats: 3,
};

export const DURATION_IN_FRAMES = 600;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;

export const QuestionDifficultyEnum = z.enum(['easy', 'medium', 'hard']);
export const CategoryEnum = z.enum(['music', 'film', 'videogame', 'show']);

export const Music = z.object({
  title: z.string(),
  artist: z.string(),
  thumbnail: z.string(),
  audio: z.string(),
  difficulty: QuestionDifficultyEnum,
  category: CategoryEnum,
});
