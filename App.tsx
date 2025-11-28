import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import AudioVisualizer from './components/AudioVisualizer';
import ResultsView from './components/ResultsView';
import { analyzeSpeechAudio } from './services/geminiService';
import { AppState, SpeechAnalysisResult } from './types';

const App = () => {
  const { 
    isRecording, 
    recordingTime, 
    mediaBlob, 
    startRecording, 
    stopRecording, 
    resetRecording, 
    analyser 
  } = useAudioRecorder();

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording) {
      setAppState(AppState.RECORDING);
    } else if (mediaBlob && appState === AppState.RECORDING) {
      // Automatic transition to analyzing when recording stops and we have a blob
      handleAnalysis(mediaBlob);
    }
  }, [isRecording, mediaBlob]);

  const handleStart = () => {
    setErrorMsg(null);
    startRecording();
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleAnalysis = async (blob: Blob) => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeSpeechAudio(blob);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze audio. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    resetRecording();
    setAnalysisResult(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900/50 rounded-2xl mb-4 border border-slate-800 shadow-xl backdrop-blur-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            FluentCheck
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Your personal AI Speech Coach. Record a 1-minute speech to detect filler words and improve your eloquence.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-2xl">
          
          {/* State: IDLE or RECORDING or ANALYZING */}
          {appState !== AppState.RESULTS && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-500">
              
              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center mb-8">
                <span className={`text-6xl font-mono font-bold tabular-nums tracking-wider ${isRecording ? 'text-white' : 'text-slate-600'}`}>
                  {formatTime(recordingTime)}
                </span>
                <span className="text-sm text-slate-500 mt-2 font-medium tracking-wide uppercase">
                  {isRecording ? 'Recording in progress' : 'Ready to record'}
                </span>
              </div>

              {/* Visualizer */}
              <div className="mb-8">
                <AudioVisualizer analyser={analyser} isRecording={isRecording} />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {appState === AppState.IDLE || appState === AppState.ERROR ? (
                  <button
                    onClick={handleStart}
                    className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                    aria-label="Start Recording"
                  >
                    <div className="w-8 h-8 rounded bg-white transition-all group-hover:scale-90" style={{ borderRadius: '50%' }}></div>
                    {/* Pulsing ring */}
                    <span className="absolute inset-0 rounded-full border border-red-500 opacity-0 group-hover:animate-ping"></span>
                  </button>
                ) : appState === AppState.RECORDING ? (
                  <button
                    onClick={handleStop}
                    className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 shadow-lg transition-all active:scale-95"
                    aria-label="Stop Recording"
                  >
                    <div className="w-8 h-8 rounded bg-red-500 shadow-sm"></div>
                  </button>
                ) : (
                  // Analyzing State
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300 font-medium animate-pulse">Analyzing speech patterns...</p>
                  </div>
                )}
              </div>

              {appState === AppState.ERROR && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
                  {errorMsg}
                  <button onClick={handleReset} className="block w-full mt-2 text-white underline decoration-red-500/50 hover:decoration-red-500">Try Again</button>
                </div>
              )}
              
              <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Note: Recording will automatically stop after 60 seconds to ensure optimal analysis.
                  </p>
              </div>
            </div>
          )}

          {/* State: RESULTS */}
          {appState === AppState.RESULTS && analysisResult && (
            <ResultsView result={analysisResult} onReset={handleReset} />
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
