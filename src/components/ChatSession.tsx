import { useState, useEffect, useRef, FC } from 'react';
import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";
import { X, Send, Sparkles, Loader2, Volume2, Image as ImageIcon, Crown, Mic, MicOff, Square, VolumeX } from 'lucide-react';
import { Coach } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, updateDoc, doc } from 'firebase/firestore';
import { BeanibaseLogo } from './BeanibaseLogo';

interface ChatSessionProps {
  coach: Coach;
  onClose: () => void;
  onCheckIn: (reflection: string) => void;
  initialMessage?: string;
  subscriptionType?: 'free' | 'monthly' | 'lifetime';
  onUpgrade: () => void;
  messagesUsed: number;
  isGuest?: boolean;
}

export const ChatSession: FC<ChatSessionProps> = ({ 
  coach, 
  onClose, 
  onCheckIn, 
  initialMessage, 
  subscriptionType = 'free',
  onUpgrade,
  messagesUsed,
  isGuest = false
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [moodImage, setMoodImage] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [context, setContext] = useState<string>('');
  const [selectedText, setSelectedText] = useState<{ text: string, x: number, y: number } | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [researchStatus, setResearchStatus] = useState<string>('');
  const [fluffMode, setFluffMode] = useState<'fluffy' | 'crisp'>('fluffy');
  const [isPaused, setIsPaused] = useState(false);
  const [fluffLevel, setFluffLevel] = useState(1);
  const [localMessagesUsed, setLocalMessagesUsed] = useState(messagesUsed);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start listening:', err);
      }
    }
  };

  // Dynamic Research Status for Trade Coach
  useEffect(() => {
    if (isLoading && coach.id === 'trade-skill-learning') {
      const statuses = [
        "Scanning technical manuals...",
        "Analyzing industry standards...",
        "Cross-referencing blueprints...",
        "Synthesizing expert roadmaps...",
        "Evaluating certification requirements...",
        "Compiling step-by-step mastery guide..."
      ];
      let i = 0;
      setResearchStatus(statuses[0]);
      const interval = setInterval(() => {
        i = (i + 1) % statuses.length;
        setResearchStatus(statuses[i]);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setResearchStatus('');
    }
  }, [isLoading, coach.id]);

  // Load previous context and send welcome message on mount
  useEffect(() => {
    const loadContext = async () => {
      // For Guests, we just show welcome and return
      if (!auth.currentUser) {
        if (isGuest) {
          setMessages([{ role: 'model', text: coach.welcomeMessage }]);
          if (initialMessage) {
            setTimeout(() => {
              handleSend(initialMessage);
            }, 500);
          }
        }
        return;
      }
      
      try {
        const convRef = collection(db, 'users', auth.currentUser.uid, 'conversations');
        const q = query(convRef, orderBy('timestamp', 'desc'), limit(3));
        const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.GET, `users/${auth.currentUser?.uid}/conversations`));
        
        let previousContext = '';
        if (subscriptionType !== 'free' && snap && !snap.empty) {
          previousContext = snap.docs
            .map(d => d.data().summary)
            .filter(Boolean)
            .join('\n');
          
          if (previousContext) {
            setContext(`Previous session context:\n${previousContext}`);
          }
        }

        // Create a new conversation document for this session
        const newConv = await addDoc(convRef, {
          uid: auth.currentUser.uid,
          coachId: coach.id,
          timestamp: new Date().toISOString(),
          messages: [],
          summary: ''
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${auth.currentUser?.uid}/conversations`));
        
        if (newConv) {
          setConversationId(newConv.id);
          
          // Initial welcome message from the coach
          setMessages([{ role: 'model', text: coach.welcomeMessage }]);

          if (initialMessage) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
              handleSend(initialMessage);
            }, 100);
          }
        }
      } catch (err) {
        console.error("Error loading context:", err);
      }
    };

    loadContext();
  }, [coach.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText({
        text: selection.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectedText(null);
      setIsLooping(false);
      stopAudio();
    }
  };

  const stopAudio = () => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const playPCM = (base64Data: string, onEnded?: () => void) => {
    stopAudio();

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to Float32 for AudioContext (assuming 16-bit PCM)
    const dataView = new DataView(bytes.buffer);
    const floatData = new Float32Array(len / 2);
    for (let i = 0; i < len / 2; i++) {
      floatData[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioCtx = audioCtxRef.current;
    const buffer = audioCtx.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
    currentAudioSourceRef.current = source;

    source.onended = () => {
      if (currentAudioSourceRef.current === source) {
        currentAudioSourceRef.current = null;
        setIsSpeaking(false);
      }
      if (onEnded) onEnded();
    };
    return source;
  };

  const handleSpeak = async (text: string, loop: boolean = false) => {
    if (isSpeaking && !loop) {
      stopAudio();
    }
    
    setIsSpeaking(true);
    if (!loop) setIsTTSLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: coach.voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      setIsTTSLoading(false);

      if (base64Audio) {
        playPCM(base64Audio, () => {
          if (loop && isLooping) {
            // Small delay before repeating
            setTimeout(() => {
              if (isLooping) handleSpeak(text, true);
            }, 300);
          }
        });
      } else {
        setIsSpeaking(false);
        setIsLooping(false);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsSpeaking(false);
      setIsLooping(false);
      setIsTTSLoading(false);
    }
  };

  const handleVisualizeMood = async () => {
    if (isVisualizing || messages.length === 0) return;
    setIsVisualizing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `A cozy, atmospheric room representing the current mood of this conversation: ${messages.slice(-3).map(m => m.text).join(' ')}. Style: Minimalist, soft lighting, 4k, cinematic.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setMoodImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error("Image gen error:", err);
    } finally {
      setIsVisualizing(false);
    }
  };

  const TRIAL_LIMIT = 5;
  const isLimitReached = subscriptionType === 'free' && localMessagesUsed >= TRIAL_LIMIT;

  const handleSend = async (retryCount: number | React.MouseEvent | string = 0, originalInput?: string) => {
    const actualRetryCount = typeof retryCount === 'number' ? retryCount : 0;
    const forcedInput = typeof retryCount === 'string' ? retryCount : originalInput || null;
    
    const messageToSend = forcedInput || input.trim();
    if (!messageToSend || (isLoading && actualRetryCount === 0)) return;
    if (!isGuest && (!auth.currentUser || !conversationId)) return;

    // Check if limit reached before sending
    if (subscriptionType === 'free' && localMessagesUsed >= 5) {
      setMessages(prev => [
        ...prev, 
        { role: 'user' as const, text: messageToSend },
        { role: 'model' as const, text: "This has been a great sit. I can feel you making progress. Your cushion only goes so far today though — come back tomorrow for your next free session, or upgrade to Premium to keep going right now." }
      ]);
      setInput('');
      setTimeout(() => {
        onUpgrade();
      }, 2000);
      return;
    }

    const userMessage = messageToSend;
    
    // Only update messages state if it's not a retry
    if (actualRetryCount === 0) {
      setMessages(prev => [...prev, { role: 'user' as const, text: userMessage }]);
      if (typeof retryCount !== 'string') setInput('');
      
      const newMessagesUsed = localMessagesUsed + 1;
      setLocalMessagesUsed(newMessagesUsed);

      // If this was the last free message, maybe set an indicator, but we let it process normally.
    }

    
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `${coach.systemInstruction}\n\nCORE DIRECTIVES: Be extremely logical, accurate, and lightning fast. Give high-impact, brief responses. Keep ALL your responses UNDER 3 SENTENCES and under 50 words max. Avoid filler and excessive formatting. Get straight to the value. ${context ? `\n\n${context}` : ''}\n\nAlways remember previous improvements discussed in past sessions.\n\nMODE: You are currently in ${fluffMode} mode. ${fluffMode === 'fluffy' ? 'Be playful and metaphorical, but keep it concise.' : 'Be direct, step-by-step, and minimal.'}`;

      // Filter out empty messages and ensure the sequence starts with 'user'
      let history = messages
        .filter(m => m.text.trim() !== "")
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      // Gemini requires the first message to be 'user'
      if (history.length > 0 && history[0].role === 'model') {
        history = history.slice(1);
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction
        }
      });

      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of responseStream) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { ...last, text: fullText }];
          }
          return prev;
        });
      }

      // Add post-answer prompt for Trade Lab
      if (coach.id === 'trade-skill-learning') {
        const prompt = "\n\n*Want the hands-on build guide or the ‘explain like I’m on a beanbag’ version?*";
        fullText += prompt;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { ...last, text: fullText }];
          }
          return prev;
        });
      }

      // Add fluff feedback
      if (!isPaused) {
        setFluffLevel(prev => Math.min(prev + 1, 3));
      }

      const updatedMessages = [...messages, { role: 'user' as const, text: userMessage }, { role: 'model' as const, text: fullText }];
      
      // Async update without blocking UI
      const saveToFirestore = async () => {
        if (!auth.currentUser || !conversationId) return;
        try {
          const convRef = doc(db, 'users', auth.currentUser.uid, 'conversations', conversationId);
          let sessionSummary = '';
          
          if (subscriptionType !== 'free') {
            const summaryResponse = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-preview",
              contents: `Summarize this session's key takeaways and improvements for future reference in 2 sentences:\n${updatedMessages.map(m => `${m.role}: ${m.text}`).join('\n')}`,
            });
            sessionSummary = summaryResponse.text || '';
          }

          await updateDoc(convRef, {
            messages: updatedMessages.map(m => ({ ...m, timestamp: new Date().toISOString() })),
            summary: sessionSummary
          }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser?.uid}/conversations/${conversationId}`));
        } catch (e) {
          console.warn("Non-critical storage error:", e);
        }
      };
      
      saveToFirestore();
      onCheckIn(userMessage);
    } catch (err: any) {
      console.error("Chat error:", err);
      
      let errorMessage = "I'm having a momentary lapse in connection. Please try sending your message again.";
      if (err.message?.includes('429')) {
        errorMessage = "Whoa. You're sitting very fast. Take a breath. The cushion isn't going anywhere. Try again in a few seconds. (This is a soft limit, not a punishment.)";
      } else if (err.message?.includes('500')) {
        errorMessage = "We broke it. Not you. Beanibase is having a small meltdown. Give us 2 minutes. We'll fluff the servers and try again. Refresh. Or come back. We'll be here.";
      }

      if (actualRetryCount < 2) {
        console.log(`Retrying... (${actualRetryCount + 1}/2)`);
        setTimeout(() => handleSend(actualRetryCount + 1, userMessage), 1000);
        return;
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl h-[80vh] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-black/5 relative">
        {/* Mood Background */}
        <AnimatePresence>
          {moodImage && (
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              src={moodImage}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className={cn("p-6 flex items-center justify-between border-b border-black/5 relative z-10", coach.color)}>
          <div className="flex items-center space-x-4">
            <BeanibaseLogo size="sm" className="shadow-sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-display font-bold">{coach.name}</h2>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-black/5 rounded-full">
                  <Crown className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
                </div>
              </div>
              <p className="text-xs opacity-50 uppercase tracking-widest font-bold">{coach.persona}</p>
            </div>
          </div>

          {/* Fluff Controls */}
          <div className="flex items-center space-x-4">
            {/* Fluff Meter */}
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full", i <= fluffLevel ? "bg-orange-500" : "bg-black/10")} />
              ))}
            </div>

            {/* Mode Toggle */}
            <button
              onClick={() => setFluffMode(prev => prev === 'fluffy' ? 'crisp' : 'fluffy')}
              className="px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider hover:bg-black/10 transition-colors"
              title={fluffMode === 'fluffy' ? "Fluffy mode (playful, metaphorical, encouraging)" : "Crisp mode (direct, step-by-step, fewer emojis)"}
            >
              {fluffMode}
            </button>

            {/* Pause Toggle */}
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className={cn("p-2 rounded-full transition-colors", isPaused ? "bg-orange-100 text-orange-600" : "hover:bg-black/5")}
              title={isPaused ? "Resume fluff" : "Pause mode: chat normally, but no fluff tracking"}
            >
              {isPaused ? "▶️" : "⏸️"}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleVisualizeMood}
              disabled={isVisualizing || messages.length === 0}
              className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30"
              title="Visualize Mood"
            >
              {isVisualizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 text-black/60" />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-black/40" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef} 
          onMouseUp={handleTextSelection}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FDFCFB]/80 backdrop-blur-sm relative z-10"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <div className="space-y-4 opacity-30">
                <Sparkles className="w-12 h-12 text-orange-400 mx-auto" />
                <p className="italic font-serif text-lg max-w-xs mx-auto">"{coach.famousLine}"</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto">
                {coach.quickPrompts.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSend(prompt)}
                    className="px-6 py-3 bg-white border border-black/5 rounded-2xl text-sm font-medium hover:border-orange-200 hover:bg-orange-50/50 transition-all text-left shadow-sm"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed relative group",
                m.role === 'user' 
                  ? "bg-black text-white rounded-tr-none" 
                  : "bg-white text-black border border-black/5 rounded-tl-none shadow-sm"
              )}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
                {m.role === 'model' && m.text && (
                  <button 
                    onClick={() => handleSpeak(m.text)}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 rounded-full"
                  >
                    <Volume2 className={cn("w-4 h-4", isSpeaking ? "text-orange-500 animate-pulse" : "text-black/40")} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">
                {coach.id === 'trade-skill-learning' ? researchStatus : "Thinking..."}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Trial Limit Overlay */}
        <AnimatePresence>
          {isLimitReached && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md flex items-center justify-center p-8 text-center"
            >
              <div className="max-w-sm space-y-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-orange-600 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold tracking-tight">Support Limited</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    You've reached the 5-message limit for Beanbag Free. To keep sitting with {coach.name} and unlock advanced tools like Trade Lab Pro, choose a membership.
                  </p>
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={onUpgrade}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98]"
                  >
                    Select Membership
                  </button>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors py-2"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Speaker */}
        <AnimatePresence>
          {selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{ left: selectedText.x, top: selectedText.y }}
              className="fixed z-[100] -translate-x-1/2 -translate-y-full bg-black text-white p-1 rounded-full flex items-center space-x-1 shadow-xl"
            >
              {isSpeaking || isTTSLoading ? (
                <button
                  onClick={() => {
                    setIsLooping(false);
                    stopAudio();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  {isTTSLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3 fill-current" />}
                  <span>{isTTSLoading ? "Loading..." : "Stop"}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsLooping(false);
                      handleSpeak(selectedText.text);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-2 hover:bg-white/10 transition-all"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Once</span>
                  </button>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    onClick={() => {
                      setIsLooping(true);
                      handleSpeak(selectedText.text, true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-2 hover:bg-white/10 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Loop</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-6 bg-white border-t border-black/5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Speak with your coach..."}
                className={cn(
                  "w-full bg-gray-50 border-none rounded-2xl pl-6 pr-12 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all",
                  isListening && "ring-2 ring-orange-500/50 animate-pulse"
                )}
              />
              <button
                onClick={toggleListening}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                  isListening ? "text-orange-500 bg-orange-50" : "text-gray-400 hover:text-black"
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
