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
    "> INITIALIZING NETWATCH_V4...",
    "> ESTABLISHING SECURE TUNNEL...",
  ]);
  const logsEndRef = useRef(null);

  // --- 1. TIME-BASED DYNAMIC LOGIC ---
  useEffect(() => {
    const updateTimeBasedData = () => {
      const hour = new Date().getHours();
      let greeting, threatLevel, accentColor;

      // Night time (10PM - 6AM)
      if (hour >= 22 || hour < 6) {
        greeting = "NIGHT OPS ACTIVE";
        threatLevel = "MIDNIGHT";
        accentColor = "text-green-500 border-green-500 bg-green-900/20"; 
      } else {
        greeting = "DAYLIGHT OPS";
        threatLevel = "ACTIVE";
        accentColor = "text-green-400 border-green-400 bg-green-900/10";
      }
      setTimeData({ greeting, threatLevel, accentColor });
    };

    updateTimeBasedData();
    const interval = setInterval(updateTimeBasedData, 60000); 
    return () => clearInterval(interval);
  }, []);

  // --- 2. TERMINAL LOGIC ---
  useEffect(() => {
    const possibleLogs = [
      "Scanning port 443... OPEN", "Packet sniffed: IP 192.168.1.X", "Injecting payload...", 
      "Bypassing Firewall Layer 3...", "Decryption key found: 0xFA92...", "> ROOT ACCESS GRANTED"
    ];
    
    const interval = setInterval(() => {
      setTerminalLogs(prev => {
        const newLog = `> [${new Date().toLocaleTimeString()}] ${possibleLogs[Math.floor(Math.random() * possibleLogs.length)]}`;
        const updatedLogs = [...prev, newLog];
        if (updatedLogs.length > 12) updatedLogs.shift(); 
        return updatedLogs;
      });
    }, 1500); 

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
            <div className={`inline-flex items-center px-4 py-1 rounded-full border ${timeData.accentColor} backdrop-blur-md shadow-lg shadow-green-500/20`}>
               <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                 THREAT LEVEL: {timeData.threatLevel}
               </span>
            </div>
          </div>

          {/* 2. The Headline (White & Dark Green Glitch) */}
          <div className="space-y-[-10px] md:space-y-[-20px]">
            {/* Top Line: White */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
              OFFENSIVE
            </h1>
            
            {/* Bottom Line: Dark Green + Glitch + Fade */}
            <div className="relative">
               {/* This text has a gradient to fade out at bottom like the reference image */}
               <h1 
                 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-green-600 via-green-800 to-black glitch-wrapper leading-none"
                 data-text="DIGITAL DEFENSE"
               >
                 DIGITAL DEFENSE
               </h1>
               
               {/* Glow effect behind the text */}
               <div className="absolute inset-0 blur-xl bg-green-900/40 -z-10"></div>
            </div>
          </div>
          
          <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
            When perimeter defenses fail, we are the void that stares back. Elite offensive cybersecurity for high-value targets.
          </p>

          <div className="flex gap-4 pt-4 justify-center lg:justify-start">
            <button className="px-8 py-4 bg-green-600 text-black font-bold uppercase tracking-widest hover:bg-green-400 hover:text-black hover:shadow-[0_0_30px_rgba(0,255,65,0.8)] transition-all clip-path-slant group relative overflow-hidden border border-green-400/50">
              <span className="relative z-10">ENGAGE RED TEAM</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LAPTOP */}
        <div className="flex-1 w-full max-w-xl laptop-perspective-container relative lg:mt-32 lg:mr-[-50px]">
           <div className="laptop-screen-angled bg-[#020804] border-2 border-green-500/50 rounded-lg overflow-hidden relative h-[400px] w-full backdrop-blur-xl z-30">
              <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none mix-blend-overlay z-50"></div>
              
              {/* Terminal Header */}
              <div className="bg-green-900/20 px-4 py-2 flex justify-between items-center border-b border-green-500/30 backdrop-blur-sm">
                  <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/50 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-green-400 font-bold font-mono">Target: 192.168.0.1 [LIVE]</div>
              </div>

              {/* Logs */}
              <div className="p-4 h-full overflow-y-auto font-mono text-xs md:text-sm text-green-300 flex flex-col gap-1 pb-12 relative z-20 terminal-scroll">
                  {terminalLogs.map((log, index) => (
                      <div key={index} className={`${index === terminalLogs.length - 1 ? 'text-green-100 font-bold' : 'opacity-70'}`}>
                        {log}
                      </div>
                  ))}
                   <div className="flex items-center">
                    <span className="text-green-500 mr-2">$</span>
                    <span className="blink-cursor bg-green-500 w-2 h-4 block"></span>
                  </div>
                  <div ref={logsEndRef} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-500/20 to-transparent z-10 pointer-events-none"></div>
           </div>
           {/* Background Glow behind laptop */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[100px] rounded-full -z-10 pointer-events-none animate-pulse"></div>
        </div>

      </div>
    </div>
  );
};

export default Hero;

