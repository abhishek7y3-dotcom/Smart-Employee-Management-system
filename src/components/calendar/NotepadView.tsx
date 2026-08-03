import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../services/axios';
import { Loader2, Save, History, X, PlusCircle } from 'lucide-react';

interface Props {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const NotepadView: React.FC<Props> = ({ selectedDate, setSelectedDate }) => {
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const [showHistory, setShowHistory] = useState(false);
  const [historyNotes, setHistoryNotes] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const fetchNote = useCallback(async () => {
    try {
      setFetching(true);
      const res = await axiosInstance.get(`/notes/${dateStr}`);
      const data = res.data?.data;
      setNote(data?.content || '');
      setNoteId(data?._id || null);
    } catch (error) {
      console.error('Failed to fetch note', error);
      setNote('');
      setNoteId(null);
    } finally {
      setFetching(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  // Timer logic for the top right
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = now.getSeconds(); // not zero-padded in the screenshot (e.g. 00:00:0)
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveNote = async () => {
    try {
      setSaving(true);
      const res = await axiosInstance.post(`/notes/${dateStr}`, { content: note, noteId });
      if (res.data?.data?._id) {
        setNoteId(res.data.data._id);
      }
      // If history is open, refresh it so the newly saved note appears
      if (showHistory) {
        fetchHistory();
      }
    } catch (error) {
      console.error('Failed to save note', error);
    } finally {
      setSaving(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await axiosInstance.get('/notes/history');
      if (res.data?.success) {
        setHistoryNotes(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  return (
    <div className="flex-1 w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-250px)]">
      {/* Toolbar area */}
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Notepad</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setNote('');
              setNoteId(null);
            }}
            className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-teal-700 dark:text-teal-400 font-medium rounded-md shadow-sm border border-zinc-300 dark:border-zinc-700 transition-all flex justify-center items-center gap-2"
          >
            <PlusCircle size={16} />
            New Page
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium rounded-md shadow-sm border border-zinc-300 dark:border-zinc-700 transition-all flex justify-center items-center gap-2"
          >
            <History size={16} />
            History
          </button>
          <button 
            onClick={handleSaveNote}
            disabled={saving || fetching}
            className="px-10 py-2 bg-gradient-to-b from-[#4fa2d8] to-[#1e6ca4] hover:from-[#5ab0e8] hover:to-[#2277b5] text-white font-bold rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-[#155480] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Save
          </button>
          
          <div className="px-4 py-2 bg-white border border-zinc-300 rounded-full text-zinc-700 font-mono text-sm shadow-sm min-w-[100px] text-center">
            {currentTime || '00:00:0'}
          </div>
        </div>
      </div>

      {/* Lined Paper Area */}
      <div className="flex-1 w-full bg-[#fcf9d9] rounded-xl overflow-hidden shadow-inner relative border border-[#e6e2b8]">
        
        {/* The textarea on top of lined background */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={fetching}
          className="absolute inset-0 w-full h-full p-8 bg-transparent resize-none outline-none text-zinc-800 font-medium text-lg leading-relaxed z-20"
          spellCheck="false"
        ></textarea>

        {fetching && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
            <Loader2 size={32} className="text-amber-600 animate-spin" />
          </div>
        )}

        {/* History Drawer Overlay */}
        {showHistory && (
          <div className="absolute inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm flex justify-end">
            <div className="w-80 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <History size={18} />
                  Note History
                </h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {fetchingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-zinc-400" />
                  </div>
                ) : historyNotes.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-500">
                    No previous notes found.
                  </div>
                ) : (
                  historyNotes.map((n) => {
                    // Extract a short preview of the content
                    const preview = n.content.trim().substring(0, 40) + (n.content.length > 40 ? '...' : '');
                    const noteDate = new Date(n.dateStr);
                    const formattedDate = noteDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    const isCurrentlySelected = n.dateStr === dateStr;

                    return (
                      <div 
                        key={n._id}
                        onClick={() => {
                          setSelectedDate(noteDate);
                          setNote(n.content);
                          setNoteId(n._id);
                          setShowHistory(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                          isCurrentlySelected && n._id === noteId
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' 
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{formattedDate}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{preview || <span className="italic text-zinc-400">Empty note</span>}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
