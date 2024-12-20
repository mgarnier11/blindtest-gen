import { NextApiResponse } from 'next';

// export const POST = executeApi<string, typeof RenderRequest>(RenderRequest, async (req, body) => {
//  // Set the headers for Server-Sent Events
//  res.setHeader("Content-Type", "text/event-stream");
//  res.setHeader("Cache-Control", "no-cache");
//  res.setHeader("Connection", "keep-alive");

//  const steps = 5;

//  for (let i = 1; i <= steps; i++) {
//    // Send progress update
//    res.write(`data: ${JSON.stringify({ progress: i * 20 })}\n\n`);
//    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate task delay
//  }

//  // End the connection
//  res.end();

//   const res = execSync('npx tsx generator/index.ts');

//   console.log(res.toString());
//   return res.toString();
// });

export const POST = async (req: Request, res: NextApiResponse) => {
  // Set the headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const steps = 5;

  for (let i = 1; i <= steps; i++) {
    // Send progress update
    res.write(`data: ${JSON.stringify({ progress: i * 20 })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate task delay
  }

  // End the connection
  res.end();
};
