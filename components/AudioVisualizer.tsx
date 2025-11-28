import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!isRecording || !analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear with transparency for trail effect? Or solid clear.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Gradient color based on height
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Indigo 500
        gradient.addColorStop(1, '#a855f7'); // Purple 500

        ctx.fillStyle = gradient;
        
        // Draw rounded bars centered vertically
        const heightScale = barHeight / 2;
        const centerY = canvas.height / 2;
        
        ctx.beginPath();
        ctx.roundRect(x, centerY - heightScale / 2, barWidth, heightScale, 4);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    draw();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [analyser, isRecording]);

  return (
    <div className="w-full h-32 bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 backdrop-blur-sm flex items-center justify-center">
      {!isRecording ? (
        <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            Microphone Idle
        </div>
      ) : (
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={128} 
            className="w-full h-full"
        />
      )}
    </div>
  );
};

export default AudioVisualizer;
