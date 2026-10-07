import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import os from 'os';

function ttsPlugin() {
  return {
    name: 'custom-tts-endpoint',
    configureServer(server: any) {
      server.middlewares.use('/api/tts', async (req: any, res: any) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const text = url.searchParams.get('text') || "Hello! It's time to drink water. Please drink a glass and stay healthy and hydrated!";

          const tts = new MsEdgeTTS();
          await tts.setMetadata("en-IN-NeerjaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

          const tempDir = os.tmpdir();
          const result = await tts.toFile(tempDir, text, {
            pitch: "+0Hz",
            rate: "+0%",
            volume: "+0%"
          });

          const audioBuffer = fs.readFileSync(result.audioFilePath);
          try { fs.unlinkSync(result.audioFilePath); } catch {}

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.end(audioBuffer);
        } catch (err: any) {
          console.error('TTS Middleware error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ttsPlugin()],
  server: {
    port: 3000,
    host: true
  }
});
