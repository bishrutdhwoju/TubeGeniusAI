import React from "react";
import { useApp } from "../context/AppContext";
import {
  PlusCircle,
  FileAudio,
  Video,
  Trash2,
  History,
  Key,
} from "lucide-react";
import { ProjectStatus, WorkflowType } from "../types";

export const Sidebar: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    apiKey,
    setApiKey,
  } = useApp();

  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const inputType = isFocused || isHovered ? "text" : "password";

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-lg">
            T
          </span>
          TubeGenius
        </h1>
      </div>

      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <button
          onClick={() => setActiveProjectId(null)}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-6 shadow-lg shadow-brand-900/20"
        >
          <PlusCircle size={20} />
          New Project
        </button>

        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
          <History size={12} /> Recent Projects
        </h3>

        <div className="flex-1 overflow-y-auto space-y-1">
          {projects.length === 0 && (
            <p className="text-sm text-slate-600 px-2 italic">
              No projects yet.
            </p>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                activeProjectId === project.id
                  ? "bg-slate-800 text-brand-400"
                  : "hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveProjectId(project.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {project.type === WorkflowType.TOPIC_TO_VIDEO ? (
                  <Video
                    size={16}
                    className={
                      activeProjectId === project.id
                        ? "text-brand-400"
                        : "text-slate-500"
                    }
                  />
                ) : (
                  <FileAudio
                    size={16}
                    className={
                      activeProjectId === project.id
                        ? "text-brand-400"
                        : "text-slate-500"
                    }
                  />
                )}
                <div className="flex flex-col truncate">
                  <span className="truncate text-sm font-medium">
                    {project.name}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    {project.status === ProjectStatus.COMPLETED ? (
                      <span className="text-green-500">Ready</span>
                    ) : project.status === ProjectStatus.ERROR ? (
                      <span className="text-red-500">Failed</span>
                    ) : (
                      <span className="text-amber-500 animate-pulse">
                        Processing...
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
            <Key size={12} className="text-brand-500" />
            Gemini API Key
          </div>

          <input
            type={inputType}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            placeholder="Paste API Key here..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 
                 text-xs text-slate-300 placeholder-slate-600 
                 focus:border-brand-500 outline-none transition-colors"
            autoComplete="off"
          />

          <p className="text-[10px] text-slate-600 mt-2 leading-tight">
            Your key is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

// {
//   /* API Key Section */
// }
// <div className="p-4 border-t border-slate-800 bg-slate-900">
//   <div
//     tabIndex={0}
//     className="group bg-slate-950/50 rounded-lg p-3 border border-slate-800
//                hover:border-brand-500 focus:border-brand-500
//                transition-colors outline-none"
//   >
//     <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
//       <Key size={12} className="text-brand-500" />
//       Gemini API Key
//     </div>

//     {/* Visual input (not focusable) */}
//     <div
//       className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs
//                  text-slate-300 placeholder-slate-600
//                  group-hover:border-brand-500 group-focus:border-brand-500"
//     >
//       {apiKey ? "••••••••••••••••••••••" : "Paste API Key here..."}
//     </div>

//     {/* Hidden real input */}
//     <input
//       type="password"
//       value={apiKey}
//       onChange={(e) => setApiKey(e.target.value)}
//       className="absolute opacity-0 pointer-events-none"
//       autoComplete="off"
//     />

//     <p className="text-[10px] text-slate-600 mt-2 leading-tight">
//       Your key is stored locally in your browser.
//     </p>
//   </div>
// </div>;
