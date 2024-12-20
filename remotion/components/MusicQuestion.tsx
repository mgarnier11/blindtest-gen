import { loadFont } from '@remotion/google-fonts/Inter';
import { useTranslation } from 'react-i18next';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { Music } from '../../types/constants';
import { ProgressBar } from './ProgressBar';

loadFont();

export const MusicQuestionProps = z.object({
  music: Music,
  questionDuration: z.number(),
  answerDuration: z.number(),
});

export const defaultMusicQuestionProps: z.infer<typeof MusicQuestionProps> = {
  music: {
    title: 'Title',
    artist: 'Artist',
    thumbnail: '',
    audio: '',

    difficulty: 'easy',
    category: 'music',
  },
  questionDuration: 15,
  answerDuration: 10,
};

export const MusicQuestion = ({
  music = defaultMusicQuestionProps.music,
  questionDuration = defaultMusicQuestionProps.questionDuration,
  answerDuration = defaultMusicQuestionProps.answerDuration,
}: z.infer<typeof MusicQuestionProps>) => {
  const frame = useCurrentFrame();
  const { t } = useTranslation();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className='bg-black text-white'>
      <div className='w-full h-full flex justify-center items-center'>
        <Sequence durationInFrames={questionDuration * fps} layout='none'>
          <div className='absolute top-10 left-1/8 w-3/4 flex justify-between p-0'>
            <div className='text-3xl font-bold'>{t(music.category)}</div>
            <div className='text-3xl font-bold'>{t(music.difficulty)}</div>
          </div>
          <div className='w-2/3'>
            <ProgressBar startFrame={0} endFrame={questionDuration * fps} color='bg-white' backgroundColor='bg-black' />
          </div>
        </Sequence>
        <Sequence durationInFrames={answerDuration * fps} from={questionDuration * fps} layout='none'>
          <div>Answer</div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
