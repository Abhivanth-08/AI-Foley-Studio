const API_BASE_URL = 'https://abhi02072005-ai-foley-studio-backend.hf.space';

export interface ProcessingConfig {
  sensitivity?: 'low' | 'medium' | 'high';
  yolo_conf?: number;
  use_hybrid?: boolean;
  create_annotated?: boolean;
  add_audio?: boolean;
  surface_type?: string;
}

export interface FootstepEvent {
  frame: number;
  timecode: string;
  foot: string;
  event: string;
  time_seconds: number;
  confidence: number;
}

export interface ProcessingResult {
  events: FootstepEvent[];
  fps: number;
  total_frames: number;
  width: number;
  height: number;
  detection_stats: {
    yolo_detections: number;
    pose_detections: number;
    total_frames: number;
  };
}

export interface TaskStatus {
  task_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: ProcessingResult;
  error?: string;
}

export interface LiveSession {
  session_id: string;
  status: string;
  message: string;
}

export interface LiveDetection {
  session_id: string;
  detected: boolean;
  foot: string | null;
  frame?: string;  // base64 encoded annotated frame
  message: string;
}

export interface SessionStats {
  detection_count: number;
  last_detection: {
    foot: string;
    timestamp: string;
  } | null;
}

export const api = {
  // Health Check
  healthCheck: async (): Promise<{ status: string; service: string; version: string }> => {
    const res = await fetch(`${API_BASE_URL}/`);
    if (!res.ok) throw new Error('Backend is not responding');
    return res.json();
  },

  // Video Upload Mode
  uploadVideo: async (file: File, config?: ProcessingConfig): Promise<{ task_id: string; status: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (config) {
      formData.append('config', JSON.stringify(config));
    }
    
    const res = await fetch(`${API_BASE_URL}/api/upload-video`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Upload failed');
    }
    
    return res.json();
  },
  
  processVideo: async (taskId: string): Promise<{ task_id: string; status: string; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/process/${taskId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Processing failed to start');
    }
    
    return res.json();
  },
  
  getTaskStatus: async (taskId: string): Promise<TaskStatus> => {
    const res = await fetch(`${API_BASE_URL}/api/status/${taskId}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get status');
    }
    
    return res.json();
  },
  
  getResults: async (taskId: string): Promise<ProcessingResult> => {
    const res = await fetch(`${API_BASE_URL}/api/results/${taskId}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get results');
    }
    
    return res.json();
  },
  
  exportCSV: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/export/${taskId}/csv`, '_blank');
  },
  
  exportJSON: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/export/${taskId}/json`, '_blank');
  },
  
  generateVideo: async (taskId: string): Promise<{ message: string; task_id: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/generate-video/${taskId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Video generation failed');
    }
    
    return res.json();
  },
  
  getVideoStatus: async (taskId: string): Promise<{ task_id: string; video_ready: boolean; video_generating: boolean; video_progress?: number; video_error: string | null }> => {
    const res = await fetch(`${API_BASE_URL}/api/video-status/${taskId}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get video status');
    }
    
    return res.json();
  },
  
  downloadVideo: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/download-video/${taskId}`, '_blank');
  },
  
  // Audio Video Generation
  generateAudioVideo: async (taskId: string): Promise<{ message: string; task_id: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/generate-audio-video/${taskId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Audio video generation failed');
    }
    
    return res.json();
  },
  
  getAudioVideoStatus: async (taskId: string): Promise<{ task_id: string; audio_video_ready: boolean; audio_video_generating: boolean; audio_video_progress?: number; audio_video_error: string | null }> => {
    const res = await fetch(`${API_BASE_URL}/api/audio-video-status/${taskId}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get audio video status');
    }
    
    return res.json();
  },
  
  downloadAudioVideo: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/download-audio-video/${taskId}`, '_blank');
  },
  
  // Live Mode
  captureFloor: async (imageBlob: Blob): Promise<LiveSession> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'floor.jpg');
    
    const res = await fetch(`${API_BASE_URL}/api/live/capture-floor`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Floor capture failed');
    }
    
    return res.json();
  },
  
  generateAudio: async (sessionId: string): Promise<{ session_id: string; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/live/generate-audio/${sessionId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Audio generation failed');
    }
    
    return res.json();
  },
  
  detectFrame: async (sessionId: string, frameBlob: Blob): Promise<LiveDetection> => {
    const formData = new FormData();
    formData.append('file', frameBlob, 'frame.jpg');
    
    const res = await fetch(`${API_BASE_URL}/api/live/detect-frame/${sessionId}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Frame detection failed');
    }
    
    return res.json();
  },

  stopLiveSession: async (sessionId: string): Promise<{ session_id: string; message: string; stats: SessionStats }> => {
    const res = await fetch(`${API_BASE_URL}/api/live/stop-session/${sessionId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to stop session');
    }
    
    return res.json();
  },
  
  // Utility
  cleanup: async (taskId: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/cleanup/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Cleanup failed');
    }
    
    return res.json();
  },
  
  listTasks: async (): Promise<{ tasks: Array<{ task_id: string; status: string; created_at: string; type: string }> }> => {
    const res = await fetch(`${API_BASE_URL}/api/tasks`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to list tasks');
    }
    
    return res.json();
  },
};
