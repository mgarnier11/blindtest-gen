import { loadFont } from '@remotion/google-fonts/Inter';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { ProgressBar } from './ProgressBar';

loadFont();

export const MusicQuestionProps = z.object({
  questionInfos: z
    .object({
      difficulty: z.string().default(''),
      category: z.string().default(''),
    })
    .default({}),
  music: z
    .object({
      title: z.string().default(''),
      artist: z.string().default(''),
      thumbnail: z.string().default(''),
      audio: z.string().default(''),
    })
    .default({}),
  questionDuration: z.number().default(30),
  answerDuration: z.number().default(10),
});

export const MusicQuestion = ({
  music,
  questionInfos,
  questionDuration,
  answerDuration,
}: z.infer<typeof MusicQuestionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className='bg-black text-white'>
      <div className='w-full h-full flex justify-center items-center'>
        <Sequence durationInFrames={questionDuration * fps} layout='none'>
          <Sequence durationInFrames={5 * fps} layout='none'>
            <div className='text-9xl'>Show cat + diff</div>
          </Sequence>
          <Sequence durationInFrames={questionDuration * fps - 5 * fps} from={5 * fps} layout='none'>
            <div className='w-1/2'>
              <ProgressBar
                startFrame={0}
                endFrame={questionDuration * fps - 5 * fps}
                color='bg-white'
                backgroundColor='bg-black'
              />
            </div>
          </Sequence>
        </Sequence>
        <Sequence durationInFrames={answerDuration * fps} from={questionDuration * fps} layout='none'>
          <div>Answer</div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
