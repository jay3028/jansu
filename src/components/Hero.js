import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';

// --- CUSTOM CSS ANIMATIONS & STYLES ---
const customStyles = `
  /* Scrolling Digital Rain Background */
  @keyframes digital-rain {
    0% { background-position: 0% 0%; }
    100% { background-position: 0% 100%; }
  }
  .bg-digital-rain {
    background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3Ctext x='50' y='70' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.1)'%3EENCRYPT_NODE%3C/text%3E%3Ctext x='120' y='110' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E::BREACH::%3C/text%3E%3Ctext x='30' y='160' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.1)'%3E101101001%3C/text%3E%3C/svg%3E");
    animation: digital-rain 20s linear infinite;
    background-size: 200px 200px;
  }

  /* CRT Monitor Scanline flicker */
  @keyframes flicker {
    0% { opacity: 0.9; }
    5% { opacity: 0.8; }
    10% { opacity: 0.9; }
    15% { opacity: 0.6; }
    20% { opacity: 0.9; }
    55% { opacity: 0.9; }
    60% { opacity: 0.4; }
    65% { opacity: 0.9; }
    100% { opacity: 0.9; }
  }
  .crt-flicker {
    animation: flicker 0.15s infinite;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
  }

  /* 3D Perspective for Laptop */
  .laptop-perspective-container { 
    perspective: 1000px; 
  }
  .laptop-screen-angled {
    transform: rotateX(10deg) rotateY(-15deg) rotateZ(2deg);
    box-shadow: -20px 20px 60px rgba(0, 255, 65, 0.2), 0 0 20px rgba(0,255,65,0.1) inset;
    transition: transform 0.3s ease-out;
  }
  .laptop-screen-angled:hover { 
    transform: rotateX(5deg) rotateY(-10deg) rotateZ(1deg) scale(1.02); 
  }

  /* Blinking Cursor */
  .blink-cursor { 
    animation: blink 1s step-end infinite; 
  }
  @keyframes blink { 
    50% { opacity: 0; } 
  }

  /* --- TEXT GLITCH EFFECTS --- */
  @keyframes glitch-skew {
    0% { transform: skew(0deg); }
    20% { transform: skew(-2deg); }
    40% { transform: skew(2deg); }
    60% { transform: skew(-1deg); }
    80% { transform: skew(1deg); }
    100% { transform: skew(0deg); }
  }
  .glitch-wrapper {
    position: relative;
    display: inline-block;
  }
  .glitch-wrapper::before,
  .glitch-wrapper::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .glitch-wrapper::before {
    left: 2px;
    text-shadow: -1px 0 #00ff41;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    animation: glitch-skew 2s infinite linear alternate-reverse;
    opacity: 0.7;
  }
  .glitch-wrapper::after {
    left: -2px;
    text-shadow: -1px 0 #0f3d0f;
    clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
    animation: glitch-skew 3s infinite linear alternate-reverse;
    opacity: 0.7;
  }

  /* Button with cyberpunk slant effect */
  .clip-path-slant {
    clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
    position: relative;
  }
  .clip-path-slant::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,255,65,0.4), transparent);
    transition: left 0.5s;
  }
  .clip-path-slant:hover::before {
    left: 100%;
  }

  /* Scanlines overlay for terminal */
  .bg-scanlines {
    background-image: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
  }

  /* Terminal scrollbar styling */
  .terminal-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .terminal-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  .terminal-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 65, 0.3);
    border-radius: 3px;
  }
  .terminal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 65, 0.5);
  }

  /* Neon glow effects */
  @keyframes neon-pulse {
    0%, 100% { 
      box-shadow: 0 0 5px rgba(0, 255, 65, 0.5),
                  0 0 10px rgba(0, 255, 65, 0.3),
                  0 0 15px rgba(0, 255, 65, 0.2);
    }
    50% { 
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.8),
                  0 0 20px rgba(0, 255, 65, 0.5),
                  0 0 30px rgba(0, 255, 65, 0.3);
    }
  }
  .neon-glow {
    animation: neon-pulse 2s ease-in-out infinite;
  }
`;

const Hero = () => {
  const [timeData, setTimeData] = useState({ greeting: '', threatLevel: '', accentColor: '' });
  const [terminalLogs, setTerminalLogs] = useState([
    "> [11:09:43 am] Verifying agent credentials...",
    "> [11:09:44 am] Validating worker profile...",
  ]);
  const logsEndRef = useRef(null);

  // --- 1. TIME-BASED DYNAMIC LOGIC ---
  useEffect(() => {
    const updateTimeBasedData = () => {
      setTimeData({ 
        greeting: "SYSTEM STATUS", 
        threatLevel: "ONLINE", 
        accentColor: "text-green-400 border-green-400 bg-green-900/10" 
      });
    };

    updateTimeBasedData();
  }, []);

  // --- 2. TERMINAL LOGIC ---
  useEffect(() => {
    const possibleLogs = [
      "Agent verification complete...",
      "Checking trust status...",
      "Verifying agent credentials...",
      "Validating worker profile...",
      "Scanning QR code...",
      "Police verification confirmed..."
    ];
    
    const interval = setInterval(() => {
      setTerminalLogs(prev => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${now.getHours() >= 12 ? 'pm' : 'am'}`;
        const newLog = `> [${time}] ${possibleLogs[Math.floor(Math.random() * possibleLogs.length)]}`;
        const updatedLogs = [...prev, newLog];
        if (updatedLogs.length > 8) updatedLogs.shift(); 
        return updatedLogs;
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  // Removed auto-scroll to prevent page jumping
  // useEffect(() => {
  //   logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [terminalLogs]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-green-900 selection:text-green-100">
      <style>{customStyles}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-digital-rain opacity-40"></div>
      <div className="absolute inset-0 crt-flicker opacity-20 z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)] z-0"></div>

      {/* --- NAVBAR --- */}
      <Navbar showAuth={true} />

      {/* --- MAIN HERO CONTENT --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-16 pb-32 lg:pt-32 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 h-full">
        
        {/* LEFT COLUMN: TYPOGRAPHY */}
        <div className="flex-1 space-y-8 mt-8 text-center lg:text-left">
          
          {/* 1. The "Pill" Badge */}
          <div className="flex justify-center lg:justify-start">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border ${timeData.accentColor} backdrop-blur-md shadow-lg shadow-green-500/20`}>
               <span className="text-xs font-bold tracking-[0.15em] uppercase">
                 {timeData.greeting}: {timeData.threatLevel}
               </span>
            </div>
          </div>

          {/* 2. The Headline - JAN SURAKSHA */}
          <div className="space-y-[-10px] md:space-y-[-20px]">
            {/* Top Line: JAN (White) */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
              JAN
            </h1>
            
            {/* Bottom Line: SURAKSHA (Green) */}
            <div className="relative">
               <h1 
                 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)] leading-none"
               >
                 SURAKSHA
               </h1>
               {/* Glow effect behind the text */}
               <div className="absolute inset-0 blur-2xl bg-green-500/30 -z-10"></div>
            </div>
          </div>
          
          {/* Description in English */}
          <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
            JanSuraksha empowers citizens, banks, gig platforms, and law enforcement to instantly verify whether a worker is genuine, authorized, and police verified — in real time and without compromising privacy.
          </p>

          {/* Hindi Text */}
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>
            देखकर नहीं, जाँचकर भरोसा करें।<br />
            JanSuraksha के साथ सुरक्षित हर कदम।
          </p>

          {/* CTA Button */}
          <div className="flex gap-4 pt-4 justify-center lg:justify-start">
            <Link href="/verify" className="px-8 py-4 bg-green-600 text-black font-bold uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_30px_rgba(0,255,65,0.8)] transition-all clip-path-slant group relative overflow-hidden border border-green-400/50 inline-block">
              <span className="relative z-10">VERIFY AGENT</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: TERMINAL */}
        <div className="flex-1 w-full max-w-xl laptop-perspective-container relative lg:mt-0">
           <div className="laptop-screen-angled bg-[#001a00] border-2 border-green-500/50 rounded-lg overflow-hidden relative min-h-[400px] w-full backdrop-blur-xl z-30">
              <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none mix-blend-overlay z-50"></div>
              
              {/* Terminal Header */}
              <div className="bg-green-900/20 px-4 py-2 flex justify-between items-center border-b border-green-500/30 backdrop-blur-sm">
                  <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-green-400 font-bold font-mono">Jan Suraksha System [ACTIVE]</div>
              </div>

              {/* Logs */}
              <div className="p-6 h-full overflow-y-auto font-mono text-sm text-green-300 flex flex-col gap-2 pb-12 relative z-20 terminal-scroll">
                  {terminalLogs.map((log, index) => (
                      <div key={index} className={`${index === terminalLogs.length - 1 ? 'text-green-400 font-bold' : 'text-green-400/70'}`}>
                        {log}
                      </div>
                  ))}
                   <div className="flex items-center mt-2">
                    <span className="text-green-500 mr-2">❯</span>
                    <span className="blink-cursor bg-green-400 w-2 h-4 block"></span>
                  </div>
                  <div ref={logsEndRef} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#001a00] to-transparent z-10 pointer-events-none"></div>
           </div>
           {/* Background Glow behind terminal */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
};

export default Hero;

