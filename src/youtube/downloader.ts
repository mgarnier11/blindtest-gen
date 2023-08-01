import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import { Music } from "../utils/interfaces";
import { searchArtists, searchMusics } from "node-youtube-music";

//WIP may be fully repaced by deezer downloader

const youtubeUrl = "https://www.youtube.com/watch?v=";
const musicsPath = "musics";

if (!fs.existsSync(musicsPath)) fs.mkdirSync(musicsPath);

const download = (url: string, outputPath: string) =>
  new Promise<void>((resolve, reject) => {
    console.log(`Downloading ${url} to ${outputPath}...`);

    ffmpeg(
      ytdl(url, {
        quality: "highestaudio",
      })
    )
      .audioBitrate(128)
      .save(outputPath)
      .on("end", () => {
        console.log(`Downloaded !`);
        resolve();
      });
  });

const downloadMusic = async (musicTitle: string): Promise<void> => {
  console.log(`Getting infos on ${musicTitle}...`);

  const name = musicTitle.split(`"`)[1].trim();
  const artistName = musicTitle.split(`" - `)[1];

  const youtubeMusics = await searchMusics(musicTitle);

  const artists = await searchArtists(artistName);

  const youtubeMusic = youtubeMusics[0];

  const fileName = `${artistName.toLowerCase().replaceAll(" ", "-")}_${name.toLowerCase().replaceAll(" ", "-")}.mp3`;

  const localPath = `${musicsPath}/${fileName}`;
  const url = `${youtubeUrl}${youtubeMusic.youtubeId}`;

  if (!fs.existsSync(localPath)) await download(`${youtubeUrl}${youtubeMusic.youtubeId}`, `${musicsPath}/${fileName}`);

  // return {
  //   name,
  //   artist: artistName,
  //   duration: youtubeMusic.duration?.totalSeconds || 0,
  //   localPath,
  //   thumbnailUrl: youtubeMusic.thumbnailUrl!,
  // };
};

export const downloadMusics = async (musicTitles: string[]): Promise<Music[]> => {
  const musics: Music[] = [];

  console.log(`Downloading ${musicTitles.length} musics...`);

  for (const musicTitle of musicTitles) {
    // const music = await downloadMusic(musicTitle);
    // musics.push(music);
  }

  console.log(`Downloaded ${musicTitles.length} musics !`);

  return musics;
};
