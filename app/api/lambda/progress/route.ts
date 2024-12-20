import { executeApi } from '../../../../helpers/api-response';
import { ProgressRequest, ProgressResponse } from '../../../../types/schema';

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(ProgressRequest, async (req, body) => {
  // const renderProgress = await getRenderProgress({
  //   bucketName: body.bucketName,
  //   functionName: speculateFunctionName({
  //     diskSizeInMb: DISK,
  //     memorySizeInMb: RAM,
  //     timeoutInSeconds: TIMEOUT,
  //   }),
  //   region: REGION as AwsRegion,
  //   renderId: body.id,
  // });

  // if (renderProgress.fatalErrorEncountered) {
  //   return {
  //     type: "error",
  //     message: renderProgress.errors[0].message,
  //   };
  // }

  // if (renderProgress.done) {
  //   return {
  //     type: "done",
  //     url: renderProgress.outputFile as string,
  //     size: renderProgress.outputSizeInBytes as number,
  //   };
  // }

  return {
    type: 'progress',
    progress: 100,
  };
});
