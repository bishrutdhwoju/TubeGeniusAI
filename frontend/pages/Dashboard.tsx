import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Youtube, FileAudio, Sparkles, ArrowRight, Mic } from 'lucide-react';
import { VoiceName } from '../types';

export const Dashboard: React.FC = () => {
  const { createTopicProject, createTranscriptProject } = useApp();
  const [activeTab, setActiveTab] = useState<'topic' | 'transcript'>('topic');
  const [input, setInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Puck);
  const [showAllVoices, setShowAllVoices] = useState(false);

  const voices = Object.values(VoiceName);
  const visibleVoices = showAllVoices ? voices : voices.slice(0, 6);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (activeTab === 'topic') {
      createTopicProject(input, selectedVoice);
    } else {
      createTranscriptProject(input, selectedVoice);
    }
    setInput('');
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="z-10 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Create <span className="text-brand-400">Viral Tutorials</span> in
          Seconds
        </h1>
        <p className="text-slate-400 mb-10 text-lg">
          Generate SEO-optimized scripts and human-like AI voiceovers for your
          YouTube channel.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-950/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("topic")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === "topic"
                  ? "bg-brand-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Youtube size={18} />
              Topic to Video
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === "transcript"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileAudio size={18} />
              Transcript to Audio
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="px-4 pb-4">
            <div className="relative mb-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === "topic"
                    ? "E.g., How to make sourdough bread for beginners..."
                    : "Paste your script here to generate voiceover..."
                }
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:border-brand-500 focus:outline-none min-h-[160px] resize-none transition-colors"
              />
            </div>

            {/* Voice Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-left px-1">
                Select AI Voice Persona
              </label>

              <div className="flex flex-wrap gap-2">
                {visibleVoices.map((voice) => (
                  <button
                    key={voice}
                    type="button"
                    onClick={() => setSelectedVoice(voice)}
                    className={`px-4 py-2 text-xs rounded-full font-medium border transition-all ${
                      selectedVoice === voice
                        ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/50"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {voice}
                  </button>
                ))}
              </div>

              {/* See More / Less */}
              {voices.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllVoices((prev) => !prev)}
                  className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition"
                >
                  {showAllVoices ? "See less voices" : "See more voices"}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/10"
            >
              {activeTab === "topic" ? (
                <Sparkles size={18} className="text-brand-600" />
              ) : (
                <Mic size={18} />
              )}
              Generate Content
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-slate-500 mt-4 text-center">
              {activeTab === "topic"
                ? "Includes: SEO Script, Tags, Description, and AI Voiceover."
                : "Includes: High-quality AI Voiceover (WAV)."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};