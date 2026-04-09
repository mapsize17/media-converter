"use client";
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { UploadCloud, FileVideo, FileImage, Loader2, Download, RefreshCw, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const ffmpegRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Initialize FFmpeg
  useEffect(() => {
    setMounted(true);
    const loadFFmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      ffmpeg.on('log', ({ message }: any) => {
        console.log('FFmpeg Log:', message);
      });
      
      ffmpeg.on('progress', ({ progress, time }: any) => {
        console.log("FFmpeg Progress:", progress);
        if (progress >= 0 && progress <= 1) {
          setProgress(Math.round(progress * 100));
        }
      });

      try {
        console.log("Loading FFmpeg core...");
        // Load the specific 8-bit core to avoid SharedArrayBuffer issues entirely
        await ffmpeg.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
        });
        console.log("FFmpeg loaded.");
        setIsReady(true);
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
      }
    };
    
    loadFFmpeg();
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
    if (!file || !ffmpegRef.current || !isReady) return;
    setIsConverting(true);
    setProgress(0);
    setOutputUrl(null);

    const ffmpeg = ffmpegRef.current;

    try {
      // Ensure we don't pass weird filenames to FFmpeg's virtual FS
      const ext = file.name.split('.').pop() || 'tmp';
      const safeInputName = `input.${ext}`;
      const outputName = `output.${outputFormat}`;

      console.log(`Writing ${safeInputName} to FS...`);
      await ffmpeg.writeFile(safeInputName, await fetchFile(file));
      
      console.log(`Executing conversion to ${outputName}...`);
      // Use extremely basic, safe args to guarantee execution completion
      await ffmpeg.exec(['-i', safeInputName, outputName]);
      
      console.log("Conversion complete, reading file...");
      const data = await ffmpeg.readFile(outputName);
      
      const url = URL.createObjectURL(new Blob([data as any]));
      setOutputUrl(url);
      setProgress(100);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Error during conversion. Check console for details.");
    } finally {
      setIsConverting(false);
    }
  };

  if (!isReady) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-slate-500 font-medium animate-pulse">Downloading WebAssembly Core (~25MB)...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      )}

      <div className="max-w-3xl w-full space-y-10">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-4 transition-colors">
            <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight transition-colors">
            Media Converter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed transition-colors">
            Fast, private, and free. Convert your images and videos directly in your browser without uploading to any servers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all">
          
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]' 
                : file 
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
              <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400 animate-in fade-in zoom-in duration-300">
                {file.type.startsWith('video') ? <FileVideo className="w-16 h-16 mb-4 drop-shadow-sm" /> : <FileImage className="w-16 h-16 mb-4 drop-shadow-sm" />}
                <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">{file.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-full">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 pointer-events-none">
                <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${isDragActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-semibold text-lg text-slate-700 dark:text-slate-300">Drag & drop your file here</span>
                <span className="text-sm mt-2 text-slate-500 dark:text-slate-400">or click to browse from your device</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                <Settings className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                Convert to format
              </label>
              <div className="relative">
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="block w-full appearance-none rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 px-4 pr-8 text-slate-700 dark:text-slate-200 font-medium shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={convertFile}
              disabled={!file || isConverting}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:shadow-lg focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[160px]"
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

          {isConverting && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Processing your file...</span>
                <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {outputUrl && !isConverting && (
            <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="font-semibold text-lg">Conversion Complete!</h3>
              </div>
              <a 
                href={outputUrl} 
                download={`converted.${outputFormat}`}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 flex items-center justify-center transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
        
        {/* Google AdSense Display Ad Banner */}
        <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl overflow-hidden min-h-[100px] flex items-center justify-center mt-8 border border-slate-200 dark:border-slate-800">
           <ins className="adsbygoogle"
             style={{ display: "block", width: "100%", height: "90px" }}
             data-ad-client="ca-pub-6382699321234354"
             data-ad-slot="YOUR_AD_SLOT_ID"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
           <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }}></script>
        </div>
        
        <div className="max-w-4xl w-full mt-16 text-slate-700 dark:text-slate-300 space-y-12 pb-12 transition-colors">
          <section> 
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Why use our Free Media Converter?</h2> 
            <p className="mb-4 leading-relaxed">Most online video and image converters force you to upload your files to their servers. This is slow, eats up your bandwidth, and poses a massive privacy risk. Our converter runs entirely <strong className="dark:text-white">inside your browser</strong> using WebAssembly technology. Your files never leave your device, ensuring 100% privacy and lightning-fast local conversion speeds.</p> 
          </section> 
          <section> 
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Frequently Asked Questions</h2> 
            <div className="space-y-6"> 
              <div> 
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Is this tool completely free?</h3> 
                <p className="mt-1">Yes! There are no hidden fees, no watermarks, and no premium subscriptions required.</p> 
              </div> 
              <div> 
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Which formats are supported?</h3> 
                <p className="mt-1">We currently support popular video formats like MP4, WEBM, and GIF, as well as image formats including JPG, PNG, and WEBP.</p> 
              </div> 
              <div> 
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Do you store my files?</h3> 
                <p className="mt-1">No. All processing happens locally on your computer or phone. We do not have servers to store your data, guaranteeing your privacy.</p> 
              </div> 
            </div> 
          </section>
        </div>

        <div className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8 transition-colors">
          Powered by WebAssembly • <a href="https://buymeacoffee.com/mapsize17" target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors">Buy me a coffee ☕</a>
        </div>
      </div>
    </main>
  );
}
