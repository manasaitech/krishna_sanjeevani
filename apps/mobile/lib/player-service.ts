import { Audio, AVPlaybackStatus } from "expo-av";

// Configure audio mode for background playback
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  playThroughEarpieceAndroid: false,
}).catch((err) => {
  console.warn("Failed to set audio mode", err);
});

class PlayerService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async load(
    url: string,
    initialPositionSeconds = 0,
    speed = 1,
    volume = 0.8,
    isMuted = false,
    onStatus: (status: AVPlaybackStatus) => void
  ) {
    if (this.sound) {
      await this.unload();
    }

    this.onStatusUpdate = onStatus;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: false,
          positionMillis: initialPositionSeconds * 1000,
          rate: speed,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 500, // updates twice a second
          volume: isMuted ? 0 : volume,
          isMuted: isMuted,
        },
        this.handleStatusUpdate.bind(this)
      );

      this.sound = sound;
    } catch (err) {
      console.error("PlayerService: Failed to create sound instance", err);
      throw err;
    }
  }

  async setVolume(volume: number) {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
  }

  async setMuted(isMuted: boolean) {
    if (this.sound) {
      await this.sound.setIsMutedAsync(isMuted);
    }
  }

  private handleStatusUpdate(status: AVPlaybackStatus) {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(status);
    }
  }

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
    }
  }

  async seek(positionSeconds: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(positionSeconds * 1000);
    }
  }

  async setSpeed(speed: number) {
    if (this.sound) {
      await this.sound.setRateAsync(speed, true);
    }
  }

  async unload() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (err) {
        console.warn("PlayerService: Failed to unload sound", err);
      }
      this.sound = null;
    }
    this.onStatusUpdate = null;
  }
}

export const playerService = new PlayerService();
