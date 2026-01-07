import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Project, ProjectStatus, VoiceName, WorkflowType } from "../types";
import { AudioPlayer } from "./AudioPlayer";
import { Bot, FileText, Mic, RefreshCw, Copy, Check } from "lucide-react";

interface ProjectViewProps {
  project: Project;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const { updateProjectScript, regenerateAudio } = useApp();
  const [localScript, setLocalScript] = useState(project.script);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(
    project.selectedVoice
  );

  const [showAllVoices, setShowAllVoices] = useState(false);

  // Sync local state when project updates externally (e.g., script generation finishes)
  useEffect(() => {
    setLocalScript(project.script);
  }, [project.script]);

  const voices = Object.values(VoiceName);
  const visibleVoices = showAllVoices ? voices : voices.slice(0, 6);

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalScript(e.target.value);
    updateProjectScript(project.id, e.target.value);
  };

  const handleRegenerateAudio = () => {
    regenerateAudio(project.id, localScript, selectedVoice);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isGenerating =
    project.status === ProjectStatus.GENERATING_AUDIO ||
    project.status === ProjectStatus.GENERATING_SCRIPT;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-lg font-semibold text-white truncate max-w-md">
            {project.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {project.type === WorkflowType.TOPIC_TO_VIDEO
                ? "SEO Script Mode"
                : "Voiceover Mode"}
            </span>
            {isGenerating && (
              <span className="text-brand-400 animate-pulse flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" /> Processing...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Script Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-800 min-w-[300px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText size={16} /> Script Editor
            </h3>
            <button
              onClick={() => copyToClipboard(localScript)}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-brand-400 transition-colors"
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              {isCopied ? "Copied" : "Copy Text"}
            </button>
          </div>
          <div className="flex-1 relative bg-slate-950">
            {project.status === ProjectStatus.GENERATING_SCRIPT ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Bot
                  size={48}
                  className="animate-bounce mb-4 text-brand-500 opacity-50"
                />
                <p>Writing your SEO script...</p>
              </div>
            ) : (
              <textarea
                className="w-full h-full bg-transparent p-6 text-slate-300 resize-none focus:outline-none focus:bg-slate-900/20 font-mono text-sm leading-relaxed"
                value={localScript}
                onChange={handleScriptChange}
                placeholder="Your script will appear here..."
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {/* Right Panel: Controls & Metadata */}
        <div className="w-96 flex flex-col bg-slate-900 border-l border-slate-800 overflow-y-auto">
          {/* Audio Section */}
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Mic size={16} className="text-brand-500" /> AI Voiceover
            </h3>

            {/* Voice Selector */}
            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">
                Voice Persona
              </label>

              <div className="grid grid-cols-2 gap-2">
                {visibleVoices.map((voice) => (
                  <button
                    key={voice}
                    onClick={() => setSelectedVoice(voice)}
                    className={`px-3 py-2 text-xs rounded-md border transition-all text-left ${
                      selectedVoice === voice
                        ? "border-brand-500 bg-brand-500/10 text-brand-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
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

            {/* Audio Player & Actions */}
            {project.audioUrl ? (
              <div className="space-y-4">
                <AudioPlayer src={project.audioUrl} blob={project.audioBlob} />
                <button
                  onClick={handleRegenerateAudio}
                  disabled={isGenerating || !localScript.trim()}
                  className="w-full py-2 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  Regenerate Voice
                </button>
              </div>
            ) : (
              <div className="h-32 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                {project.status === ProjectStatus.GENERATING_AUDIO ? (
                  <>
                    <RefreshCw
                      size={24}
                      className="animate-spin mb-2 text-brand-500"
                    />
                    <p className="text-xs">Generating voiceover...</p>
                  </>
                ) : (
                  <p className="text-xs">Audio generation pending...</p>
                )}
              </div>
            )}

            {project.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                Error: {project.error}
              </div>
            )}
          </div>

          {/* SEO Metadata (Only for Topic workflow) */}
          {project.type === WorkflowType.TOPIC_TO_VIDEO &&
            project.seoMetadata && (
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-4">
                  SEO Metadata
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold uppercase">
                      Title
                    </label>
                    <p className="text-sm text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1 select-all">
                      {project.seoMetadata.title}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-semibold uppercase">
                      Description
                    </label>
                    <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 mt-1 h-24 overflow-y-auto select-all whitespace-pre-wrap">
                      {project.seoMetadata.description}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-semibold uppercase">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.seoMetadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-semibold uppercase">
                      Pinned Comment
                    </label>
                    <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 mt-1 select-all">
                      {project.seoMetadata.pinnedComment}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
