import { logger } from "../logger";

export interface MP3Segment {
  data: ArrayBuffer;
  duration: number; // in seconds
}

export interface SegmenterResult {
  segments: MP3Segment[];
  totalDuration: number; // in seconds
}

/**
 * Pure JavaScript/TypeScript frame-accurate MP3 segmenter.
 * Slices an MP3 file into segments of approximately `segmentDurationSec` length.
 */
export function segmentMp3(buffer: ArrayBuffer, segmentDurationSec = 2): SegmenterResult {
  const bytes = new Uint8Array(buffer);
  const segments: MP3Segment[] = [];
  
  let offset = 0;
  
  // ── ID3v2 Tag Handling ─────────────────────────────────
  // ID3v2 tags at the start of the file can contain large metadata (artwork, tags).
  // We must parse and skip them to avoid scan false positives.
  if (
    bytes.length >= 10 &&
    bytes[0] === 0x49 && // 'I'
    bytes[1] === 0x44 && // 'D'
    bytes[2] === 0x33    // '3'
  ) {
    const flags = bytes[5];
    const sizeBytes = bytes.slice(6, 10);
    // Synchsafe integer parsing (7 bits per byte, MSB is 0)
    const id3Size =
      (sizeBytes[0] << 21) |
      (sizeBytes[1] << 14) |
      (sizeBytes[2] << 7) |
      sizeBytes[3];
    
    // Add 10 bytes for the ID3 header itself
    let totalHeaderSize = 10 + id3Size;
    
    // If footer is present, add another 10 bytes
    const hasFooter = (flags & 0x10) !== 0;
    if (hasFooter) {
      totalHeaderSize += 10;
    }
    
    logger.info("MP3 Segmenter: Skipping ID3v2 tag", { id3Size, totalHeaderSize });
    offset = totalHeaderSize;
  }
  
  const sampleRates = [
    [44100, 48000, 32000], // MPEG-1
    [22050, 24000, 16000], // MPEG-2
    [11025, 12000, 8000]   // MPEG-2.5
  ];
  
  const bitrates = [
    // Version 1, Layer III (kbps)
    [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    // Version 2 & 2.5, Layer III (kbps)
    [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
  ];

  let currentSegmentFrames: Uint8Array[] = [];
  let currentSegmentDurationMs = 0;
  let totalDuration = 0;

  const flushSegment = () => {
    if (currentSegmentFrames.length === 0) return;
    
    const totalLength = currentSegmentFrames.reduce((acc, f) => acc + f.length, 0);
    const segmentBytes = new Uint8Array(totalLength);
    let writeOffset = 0;
    for (const frame of currentSegmentFrames) {
      segmentBytes.set(frame, writeOffset);
      writeOffset += frame.length;
    }
    
    const segmentDuration = currentSegmentDurationMs / 1000;
    segments.push({
      data: segmentBytes.buffer,
      duration: segmentDuration,
    });
    
    totalDuration += segmentDuration;
    
    currentSegmentFrames = [];
    currentSegmentDurationMs = 0;
  };

  while (offset < bytes.length - 4) {
    // Look for MP3 frame syncword: 11 bits set (0xFF and top 3 bits of next byte)
    if (bytes[offset] === 0xFF && (bytes[offset + 1] & 0xE0) === 0xE0) {
      const b1 = bytes[offset + 1];
      const b2 = bytes[offset + 2];
      
      const mpegVersionBit = (b1 & 0x18) >> 3;
      const mpegLayer = (b1 & 0x06) >> 1;
      const bitrateIdx = (b2 & 0xF0) >> 4;
      const sampleRateIdx = (b2 & 0x0C) >> 2;
      const padding = (b2 & 0x02) >> 1;
      
      // We only support Layer III (mpegLayer === 1, which corresponds to Layer 3)
      if (mpegLayer !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || sampleRateIdx === 3) {
        // Not a valid Layer III frame, advance by 1 and try again
        offset++;
        continue;
      }
      
      let versionIdx = 0; // MPEG-1
      if (mpegVersionBit === 2) versionIdx = 1; // MPEG-2
      else if (mpegVersionBit === 0) versionIdx = 2; // MPEG-2.5
      
      const sampleRate = sampleRates[versionIdx][sampleRateIdx];
      const bitrate = bitrates[versionIdx === 0 ? 0 : 1][bitrateIdx] * 1000;
      
      let frameSize = 0;
      let samplesPerFrame = 1152;
      if (versionIdx === 0) {
        frameSize = Math.floor(144 * bitrate / sampleRate) + padding;
      } else {
        frameSize = Math.floor(72 * bitrate / sampleRate) + padding;
        samplesPerFrame = 576;
      }
      
      if (frameSize <= 0 || offset + frameSize > bytes.length) {
        // Incomplete or corrupt frame header, skip byte
        offset++;
        continue;
      }
      
      // Extract frame bytes
      const frameData = bytes.slice(offset, offset + frameSize);
      currentSegmentFrames.push(frameData);
      
      const frameDurationMs = (samplesPerFrame / sampleRate) * 1000;
      currentSegmentDurationMs += frameDurationMs;
      
      offset += frameSize;
      
      // Trigger segment cut when duration is met
      if (currentSegmentDurationMs >= segmentDurationSec * 1000) {
        flushSegment();
      }
    } else {
      offset++;
    }
  }

  // Flush any leftover frames in the last segment
  flushSegment();

  logger.info("MP3 Segmenter: Finished processing file", {
    totalSegments: segments.length,
    totalDurationSeconds: totalDuration,
  });

  return {
    segments,
    totalDuration,
  };
}
