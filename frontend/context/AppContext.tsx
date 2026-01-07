import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, ProjectStatus, WorkflowType, VoiceName } from '../types';
import { generateScriptFromTopic, generateSpeech } from '../services/geminiService';

interface AppContextType {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  createTopicProject: (topic: string, voice: VoiceName) => void;
  createTranscriptProject: (transcript: string, voice: VoiceName) => void;
  updateProjectScript: (id: string, newScript: string) => void;
  regenerateAudio: (id: string, voice: VoiceName) => void;
  deleteProject: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // --- Actions ---

  const createTopicProject = useCallback(async (topic: string, voice: VoiceName) => {
    const newProject: Project = {
      id: generateId(),
      name: topic.length > 30 ? topic.substring(0, 30) + '...' : topic,
      type: WorkflowType.TOPIC_TO_VIDEO,
      createdAt: Date.now(),
      status: ProjectStatus.GENERATING_SCRIPT,
      topic,
      script: '',
      selectedVoice: voice,
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);

    try {
      // 1. Generate Script
      const scriptData = await generateScriptFromTopic(topic);
      
      setProjects(prev => prev.map(p => {
        if (p.id !== newProject.id) return p;
        return {
          ...p,
          script: scriptData.script,
          seoMetadata: scriptData.seo,
          status: ProjectStatus.GENERATING_AUDIO // Auto-transition to audio
        };
      }));

      // 2. Generate Audio (Auto)
      const audioBlob = await generateSpeech(scriptData.script, newProject.selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);

      setProjects(prev => prev.map(p => {
        if (p.id !== newProject.id) return p;
        return {
          ...p,
          status: ProjectStatus.COMPLETED,
          audioBlob,
          audioUrl
        };
      }));

    } catch (err: any) {
      setProjects(prev => prev.map(p => {
        if (p.id !== newProject.id) return p;
        return { ...p, status: ProjectStatus.ERROR, error: err.message || 'Generation failed' };
      }));
    }
  }, []);

  const createTranscriptProject = useCallback(async (transcript: string, voice: VoiceName) => {
    const newProject: Project = {
      id: generateId(),
      name: transcript.substring(0, 20) + '...',
      type: WorkflowType.TRANSCRIPT_TO_AUDIO,
      createdAt: Date.now(),
      status: ProjectStatus.GENERATING_AUDIO,
      originalTranscript: transcript,
      script: transcript, // In this flow, script is the input
      selectedVoice: voice,
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);

    try {
      const audioBlob = await generateSpeech(transcript, newProject.selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);

      setProjects(prev => prev.map(p => {
        if (p.id !== newProject.id) return p;
        return {
          ...p,
          status: ProjectStatus.COMPLETED,
          audioBlob,
          audioUrl
        };
      }));
    } catch (err: any) {
      setProjects(prev => prev.map(p => {
        if (p.id !== newProject.id) return p;
        return { ...p, status: ProjectStatus.ERROR, error: err.message || 'Audio generation failed' };
      }));
    }
  }, []);

  const updateProjectScript = useCallback((id: string, newScript: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, script: newScript } : p));
  }, []);

  const regenerateAudio = useCallback(async (id: string, voice: VoiceName) => {
    // Find project to get current script
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, status: ProjectStatus.GENERATING_AUDIO, selectedVoice: voice, error: undefined };
    }));

    let scriptToUse = '';
    
    setProjects(prev => {
      const p = prev.find(proj => proj.id === id);
      if (p) scriptToUse = p.script;
      return prev;
    });
    
    if (!scriptToUse) return;

    try {
      const audioBlob = await generateSpeech(scriptToUse, voice);
      const audioUrl = URL.createObjectURL(audioBlob);

      setProjects(prev => prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: ProjectStatus.COMPLETED,
          audioBlob,
          audioUrl
        };
      }));
    } catch (err: any) {
      setProjects(prev => prev.map(p => {
        if (p.id !== id) return p;
        return { ...p, status: ProjectStatus.ERROR, error: err.message || 'Regeneration failed' };
      }));
    }
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  }, [activeProjectId]);

  return (
    <AppContext.Provider value={{
      projects,
      activeProjectId,
      setActiveProjectId,
      createTopicProject,
      createTranscriptProject,
      updateProjectScript,
      regenerateAudio,
      deleteProject
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};