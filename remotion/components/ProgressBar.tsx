import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const ProgressBarProps = z.object({
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  margin: z.string().optional(),
  height: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
  startFrame: z.number(),
  endFrame: z.number(),
});

export const defaultProgressBarProps: z.infer<typeof ProgressBarProps> = {
  color: 'bg-blue-500',
  backgroundColor: 'bg-gray-300',
  margin: 'm-0',
  height: 'h-16',
  borderColor: 'border border-gray-400',
  borderWidth: 'border-8',
  startFrame: 0,
  endFrame: 0,
};

export const ProgressBar: React.FC<z.infer<typeof ProgressBarProps>> = ({
  color = defaultProgressBarProps.color,
  backgroundColor = defaultProgressBarProps.backgroundColor,
  margin = defaultProgressBarProps.margin,
  height = defaultProgressBarProps.height,
  borderColor = defaultProgressBarProps.borderColor,
  borderWidth = defaultProgressBarProps.borderWidth,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();

  console.log(color, backgroundColor, margin, height, borderColor, borderWidth, startFrame, endFrame);

  // Calculate the progress percentage based on the current frame
  const progress = interpolate(frame, [startFrame, endFrame], [0, 100], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className={`bottom-0 left-0 right-0 ${margin} ${backgroundColor} ${height} ${borderColor} ${borderWidth}  rounded-full overflow-hidden`}
    >
      <div className={`${color} h-full transition-all ease-out`} style={{ width: `${progress}%` }} />
    </div>
  );
};
