import * as api from "d-fi-core";
import fs from "fs";
import dotenv from "dotenv";
import levenshtein from "js-levenshtein";
import { Music, MusicRequest } from "../utils/interfaces.js";
import { toBuffer } from "../utils/utils.js";
import path from "path";
import { outDirPath } from "../utils/config.js";
dotenv.config();

await api.initDeezerApi(process.env.DEEZER_ARL!);

const musicsPath = path.join(outDirPath, "musics");
if (!fs.existsSync(musicsPath)) fs.mkdirSync(musicsPath);

const downloadMusicRequest = async (musicRequest: MusicRequest): Promise<Music> => {
  console.log(`Getting infos on ${musicRequest.title} - ${musicRequest.artist}...`);

  const searchResult = await api.searchMusic(musicRequest.title, ["TRACK"]);

  const tracks = searchResult.TRACK.data.sort((a, b) => {
    const aLevenshtein = levenshtein(a.ART_NAME, musicRequest.artist);
    const bLevenshtein = levenshtein(b.ART_NAME, musicRequest.artist);

    return aLevenshtein - bLevenshtein;
  });

  const track = tracks[0];

  const musicName = track.SNG_TITLE;
  const artistName = track.ART_NAME;
  const fileName = `${artistName.toLowerCase().replaceAll(" ", "-")}_${musicName
    .toLowerCase()
    .replaceAll(" ", "-")}.mp3`;
  const localPath = `${musicsPath}/${fileName}`;

  // Download track
  if (!fs.existsSync(localPath)) {
    console.log(`Downloading to ${localPath}...`);

    const trackData = await api.getTrackDownloadUrl(track, 1);

    const response = await fetch(trackData!.trackUrl);
    const buffer = toBuffer(await response.arrayBuffer());

    const outFile = trackData!.isEncrypted ? api.decryptDownload(buffer, track.SNG_ID) : buffer;

    const trackWithMetadata = await api.addTrackTags(outFile, track, 500);

    fs.writeFileSync(localPath, trackWithMetadata);

    console.log(`Downloaded !`);
  }

  return {
    title: musicName,
    artist: artistName,
    duration: parseInt(track.DURATION),
    localPath,
    thumbnailUrl: `https://e-cdns-images.dzcdn.net/images/cover/${track.ALB_PICTURE}/500x500-000000-80-0-0.jpg`,
    extractStart: musicRequest.timestamp_start,
    extractEnd: musicRequest.timestamp_end,
  };
};

export const downloadMusicRequests = async (musicRequests: MusicRequest[]): Promise<Music[]> => {
  const musics: Music[] = [];

  console.log(`Downloading ${musicRequests.length} musics...`);

  for (const musicRequest of musicRequests) {
    const music = await downloadMusicRequest(musicRequest);
    musics.push(music);
  }

  console.log(`Downloaded ${musicRequests.length} musics !`);

  return musics;
};
