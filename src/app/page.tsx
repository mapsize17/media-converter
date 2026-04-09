"use client";
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { UploadCloud, FileVideo, FileImage, Loader2, Download, RefreshCw, Settings } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
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

  if (!isReady) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl w-full space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <RefreshCw className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Media Converter
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Fast, private, and free. Convert your images and videos directly in your browser without uploading to any servers.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
          
          {/* Dropzone */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
                : file 
                  ? 'border-slate-200 bg-slate-50' 
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange}
              accept="video/*,image/*"
            />
            {file ? (
              <div className="flex flex-col items-center text-indigo-600 animate-in fade-in zoom-in duration-300">
                {file.type.startsWith('video') ? <FileVideo className="w-16 h-16 mb-4 drop-shadow-sm" /> : <FileImage className="w-16 h-16 mb-4 drop-shadow-sm" />}
                <span className="font-semibold text-lg text-slate-800">{file.name}</span>
                <span className="text-sm text-slate-500 mt-1 font-medium bg-slate-200/50 px-3 py-1 rounded-full">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 pointer-events-none">
                <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span className="font-semibold text-lg text-slate-700">Drag & drop your file here</span>
                <span className="text-sm mt-2 text-slate-500">or click to browse from your device</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                <Settings className="w-4 h-4 mr-2 text-slate-500" />
                Convert to format
              </label>
              <div className="relative">
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="block w-full appearance-none rounded-xl border-slate-200 bg-slate-50 py-3 px-4 pr-8 text-slate-700 font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={convertFile}
              disabled={!file || isConverting}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[160px]"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Converting...
                </>
              ) : (
                'Start Conversion'
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isConverting && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>Processing your file...</span>
                <span className="text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {outputUrl && !isConverting && (
            <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="font-semibold text-lg">Conversion Complete!</h3>
              </div>
              <a 
                href={outputUrl} 
                download={`converted.${outputFormat}`}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-slate-400 mt-8">
          Powered by WebAssembly • 100% Client-Side Processing
        </div>
      </div>
    <div className="max-w-4xl w-full mt-24 text-slate-700 space-y-12 pb-12"><section> <h2 className="text-2xl font-bold text-slate-900 mb-4">Why use our Free Media Converter?</h2> <p className="mb-4 leading-relaxed">Most online video and image converters force you to upload your files to their servers. This is slow, eats up your bandwidth, and poses a massive privacy risk. Our converter runs entirely <strong>inside your browser</strong> using WebAssembly technology. Your files never leave your device, ensuring 100% privacy and lightning-fast local conversion speeds.</p> </section> <section> <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2> <div className="space-y-6"> <div> <h3 className="text-lg font-semibold text-slate-800">Is this tool completely free?</h3> <p className="mt-1">Yes! There are no hidden fees, no watermarks, and no premium subscriptions required.</p> </div> <div> <h3 className="text-lg font-semibold text-slate-800">Which formats are supported?</h3> <p className="mt-1">We currently support popular video formats like MP4, WEBM, and GIF, as well as image formats including JPG, PNG, and WEBP.</p> </div> <div> <h3 className="text-lg font-semibold text-slate-800">Do you store my files?</h3> <p className="mt-1">No. All processing happens locally on your computer or phone. We do not have servers to store your data, guaranteeing your privacy.</p> </div> </div> </section></div></main>
  );
}
