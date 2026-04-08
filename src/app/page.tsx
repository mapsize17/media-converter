"use client";
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { UploadCloud, FileVideo, FileImage, Loader2, Download } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
    setIsReady(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setOutputUrl(null);
      setProgress(0);
    }
  };

  const convertFile = async () => {
    if (!file || !ffmpegRef.current) return;
    setIsConverting(true);
    setProgress(0);
    setOutputUrl(null);

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('progress', ({ progress }: any) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
      }

      const inputName = file.name;
      const outputName = `converted.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);
      const data = await ffmpeg.readFile(outputName);
      
      const url = URL.createObjectURL(new Blob([data as any]));
      setOutputUrl(url);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Error during conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Media Converter</h1>
          <p className="mt-2 text-lg text-gray-600">Convert images and videos locally in your browser. 100% private, zero server uploads.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              accept="video/*,image/*"
            />
            {file ? (
              <div className="flex flex-col items-center text-blue-600">
                {file.type.startsWith('video') ? <FileVideo className="w-12 h-12 mb-3" /> : <FileImage className="w-12 h-12 mb-3" />}
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <UploadCloud className="w-12 h-12 mb-3" />
                <span className="font-medium text-gray-900">Click or drag a file to upload</span>
                <span className="text-sm mt-1">Supports MP4, WEBM, GIF, JPG, PNG, WEBP</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Convert to format</label>
              <select 
                value={outputFormat} 
                onChange={(e) => setOutputFormat(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              >
                <optgroup label="Video">
                  <option value="mp4">MP4</option>
                  <option value="webm">WEBM</option>
                  <option value="gif">GIF</option>
                </optgroup>
                <optgroup label="Image">
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                </optgroup>
              </select>
            </div>
            
            <button
              onClick={convertFile}
              disabled={!file || isConverting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert File'
              )}
            </button>
          </div>

          {isConverting && (
            <div className="mt-8">
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {outputUrl && !isConverting && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100 flex flex-col items-center">
              <h3 className="text-green-800 font-medium mb-4">Conversion Complete!</h3>
              <a 
                href={outputUrl} 
                download={`converted.${outputFormat}`}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors shadow-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Result
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
