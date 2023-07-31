import * as api from "d-fi-core";
import fs from "fs";
import dotenv from "dotenv";
import levenshtein from "js-levenshtein";
import { Music } from "../utils/interfaces.js";
import { toBuffer } from "../utils/utils.js";
import path from "path";
dotenv.config();

await api.initDeezerApi(process.env.DEEZER_ARL!);

const musicsPath = path.join(process.cwd(), "musics");
if (!fs.existsSync(musicsPath)) fs.mkdirSync(musicsPath);

const downloadMusic = async (musicTitle: string): Promise<Music> => {
  console.log(`Getting infos on ${musicTitle}...`);

  let musicName = musicTitle.split(`"`)[1].trim();
  let artistName = musicTitle.split(`" - `)[1];

  const searchResult = await api.searchMusic(musicName, ["TRACK"]);

  const tracks = searchResult.TRACK.data.sort((a, b) => {
    const aLevenshtein = levenshtein(a.ART_NAME, artistName);
    const bLevenshtein = levenshtein(b.ART_NAME, artistName);

    return aLevenshtein - bLevenshtein;
  });

  const track = tracks[0];

  musicName = track.SNG_TITLE;
  artistName = track.ART_NAME;
  const fileName = `${artistName.toLowerCase().replaceAll(" ", "-")}_${musicName
    .toLowerCase()
    .replaceAll(" ", "-")}.mp3`;
  const localPath = `${musicsPath}/${fileName}`;

  const trackData = await api.getTrackDownloadUrl(track, 1);

  // Download track
  if (!fs.existsSync(localPath)) {
    console.log(`Downloading to ${localPath}...`);

    const response = await fetch(trackData!.trackUrl);
    const buffer = toBuffer(await response.arrayBuffer());

    const outFile = trackData!.isEncrypted ? api.decryptDownload(buffer, track.SNG_ID) : buffer;

    const trackWithMetadata = await api.addTrackTags(outFile, track, 500);

    fs.writeFileSync(localPath, trackWithMetadata);

    console.log(`Downloaded !`);
  }

  return {
    name: musicName,
    artist: artistName,
    duration: parseInt(track.DURATION),
    localPath,
    thumbnailUrl: track.ALB_PICTURE,
  };
};

export const downloadMusics = async (musicTitles: string[]): Promise<Music[]> => {
  const musics: Music[] = [];

  console.log(`Downloading ${musicTitles.length} musics...`);

  for (const musicTitle of musicTitles) {
    const music = await downloadMusic(musicTitle);
    musics.push(music);
  }

  console.log(`Downloaded ${musicTitles.length} musics !`);

  return musics;
};
