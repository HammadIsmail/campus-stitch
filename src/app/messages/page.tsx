"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Compass,
  Tag,
  Bike,
  ArrowLeft,
  ChevronRight,
  CheckCheck,
  Mic,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "other";
  text?: string;
  type?: "text" | "voice";
  audioUrl?: string;
  duration?: string;
  time: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactVerified: boolean;
  contextType: "ride" | "listing" | "bike";
  contextTitle: string;
  contextSubtitle: string;
  contextLink: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: Message[];
}

/**
 * Creates a valid, playable PCM WAV audio Data URL of specified duration (in seconds).
 * Guarantees that simulated, fallback, or synthesized voice notes play audible sound
 * on any browser without external dependencies or network requests.
 */
function createSynthesizedVoiceWav(seconds = 3): string {
  if (typeof window === "undefined") return "";
  try {
    const sampleRate = 8000;
    const duration = Math.max(1, Math.min(seconds, 15));
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    const writeString = (v: DataView, offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        v.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + numSamples, true);
    writeString(view, 8, "WAVE");

    // "fmt " sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 1, true); // BlockAlign
    view.setUint16(34, 8, true); // BitsPerSample (8-bit)

    // "data" sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, numSamples, true);

    // Generate warm voice-like audio harmonic tones (human vowel formant emulation)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const fundamental = Math.sin(2 * Math.PI * 180 * t);
      const harmonic1 = 0.5 * Math.sin(2 * Math.PI * 360 * t);
      const harmonic2 = 0.25 * Math.sin(2 * Math.PI * 720 * t);
      const modulation = 0.8 + 0.2 * Math.sin(2 * Math.PI * 3 * t);
      const signal = (fundamental + harmonic1 + harmonic2) * modulation * 0.4;
      view.setUint8(44 + i, Math.floor((signal + 1) * 127.5));
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:audio/wav;base64,${btoa(binary)}`;
  } catch (err) {
    console.warn("WAV synthesis fallback notice:", err);
    return "";
  }
}

function VoiceMessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Ensure playable audio URL: if URL is missing or an invalid blob from a past session, provide synthesized audio
  const safeAudioUrl = React.useMemo(() => {
    if (!message.audioUrl || message.audioUrl.startsWith("blob:")) {
      const sec = parseInt(message.duration?.split(":")[1] || "3", 10) || 3;
      return createSynthesizedVoiceWav(sec);
    }
    return message.audioUrl;
  }, [message.audioUrl, message.duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio element play error, falling back to Web Audio:", err);
          // If browser rejected the audio element source, fall back to standalone Audio instance
          try {
            const fallback = new Audio(createSynthesizedVoiceWav(3));
            fallback.onended = () => setIsPlaying(false);
            fallback
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          } catch {
            setIsPlaying(false);
          }
        });
    }
  };

  return (
    <div
      className={`p-3 rounded-2xl flex items-center gap-3 min-w-[220px] ${
        isMe
          ? "bg-black text-white rounded-tr-xs shadow-xs"
          : "bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-2xs"
      }`}
    >
      <audio
        ref={audioRef}
        src={safeAudioUrl}
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer shrink-0 ${
          isMe ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      {/* Waveform graphic bars with active playback animation */}
      <div className="flex-1 flex items-center gap-1 h-6">
        {[40, 75, 55, 90, 60, 80, 45, 100, 70, 50, 85, 60, 40].map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isMe ? "bg-white/80" : "bg-black/80"
            }`}
            style={{
              height: `${isPlaying ? Math.max(25, h * (i % 2 === 0 ? 1 : 0.5) * (0.8 + 0.4 * Math.sin(i))) : h}%`,
            }}
          />
        ))}
      </div>

      <span className="text-[11px] font-mono shrink-0 opacity-80">
        {message.duration || "0:04"}
      </span>
    </div>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const contextParam = searchParams.get("context") as "ride" | "listing" | "bike" | null;
  const idParam = searchParams.get("id");

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [inputMsg, setInputMsg] = React.useState("");

  // Refs for scrolling
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<any>(null);

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  React.useEffect(() => {
    let currentConvs: Conversation[] = [];
    try {
      const stored = localStorage.getItem("campus_stitch_conversations");
      if (stored) {
        currentConvs = JSON.parse(stored);
        // Sanitize any dead blob: URLs from previous sessions so they don't throw errors
        currentConvs = currentConvs.map((conv) => ({
          ...conv,
          messages: conv.messages.map((m) => {
            if (m.type === "voice" && (!m.audioUrl || m.audioUrl.startsWith("blob:"))) {
              const sec = parseInt(m.duration?.split(":")[1] || "3", 10) || 3;
              return {
                ...m,
                audioUrl: createSynthesizedVoiceWav(sec),
              };
            }
            return m;
          }),
        }));
      }
    } catch {}

    if (contextParam && idParam) {
      const existing = currentConvs.find((c) => c.contextLink.includes(idParam));
      if (!existing) {
        const newChat: Conversation = {
          id: "c_" + Date.now(),
          contactName:
            contextParam === "ride"
              ? "Ride Organizer"
              : contextParam === "bike"
                ? "Bike Owner"
                : "Seller",
          contactVerified: true,
          contextType: contextParam,
          contextTitle:
            contextParam === "ride"
              ? "Commute Ride Inquiry"
              : contextParam === "bike"
                ? "Bike Rental Inquiry"
                : "Marketplace Listing Inquiry",
          contextSubtitle: `Regarding reference ID: ${idParam}`,
          contextLink:
            contextParam === "ride"
              ? `/commute?id=${idParam}`
              : contextParam === "bike"
                ? `/bike-rentals?id=${idParam}`
                : `/market?id=${idParam}`,
          lastMessage: "Conversation initiated",
          lastTime: "Just now",
          unreadCount: 0,
          messages: [
            {
              id: "m_init",
              sender: "other",
              text: `Hello! Thanks for reaching out regarding the ${
                contextParam === "ride"
                  ? "ride"
                  : contextParam === "bike"
                    ? "bike rental"
                    : "item listing"
              }. Feel free to ask questions or send a voice message.`,
              time: "Just now",
            },
          ],
        };
        currentConvs = [newChat, ...currentConvs];
        try {
          localStorage.setItem("campus_stitch_conversations", JSON.stringify(currentConvs));
        } catch {}
        setSelectedId(newChat.id);
      } else {
        setSelectedId(existing.id);
      }
    } else if (currentConvs.length > 0) {
      setSelectedId(currentConvs[0].id);
    }

    setConversations(currentConvs);
  }, [contextParam, idParam]);

  const activeConv = conversations.find((c) => c.id === selectedId);

  // Auto-scroll on chat change and new message arrival
  React.useEffect(() => {
    scrollToBottom(false);
  }, [selectedId, scrollToBottom]);

  React.useEffect(() => {
    scrollToBottom(true);
  }, [activeConv?.messages.length, scrollToBottom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedId) return;

    const newMsg: Message = {
      id: "m_" + Date.now(),
      sender: "user",
      type: "text",
      text: inputMsg.trim(),
      time: "Just now",
    };

    const updated = conversations.map((c) => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: newMsg.text || "",
          lastTime: "Just now",
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    setConversations(updated);
    try {
      localStorage.setItem("campus_stitch_conversations", JSON.stringify(updated));
    } catch {}

    setInputMsg("");
    setTimeout(() => scrollToBottom(true), 50);
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      // Emit chunk every 200ms continuously so buffer is never empty
      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access notice:", err);
      simulateVoiceNote();
    }
  };

  const stopVoiceRecording = (send: boolean) => {
    if (!isRecording) return;
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);

    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (!send || !selectedId) {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      return;
    }

    const durationSeconds = Math.max(1, recordingSeconds);
    const durationStr = `0:${durationSeconds < 10 ? "0" + durationSeconds : durationSeconds}`;

    // Handle recorder stop asynchronously so all dataavailable chunks are collected
    recorder.onstop = () => {
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });

      const finalizeAndSend = (finalAudioUrl: string) => {
        const newMsg: Message = {
          id: "m_" + Date.now(),
          sender: "user",
          type: "voice",
          audioUrl: finalAudioUrl,
          duration: durationStr,
          text: "Voice message",
          time: "Just now",
        };

        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id === selectedId) {
              return {
                ...c,
                lastMessage: "🎤 Voice message",
                lastTime: "Just now",
                messages: [...c.messages, newMsg],
              };
            }
            return c;
          });
          try {
            localStorage.setItem("campus_stitch_conversations", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        setTimeout(() => scrollToBottom(true), 50);
      };

      if (blob.size > 0) {
        // Convert Blob to Base64 data URL so it never expires and survives page refreshes!
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          finalizeAndSend(base64Audio);
        };
        reader.onerror = () => {
          finalizeAndSend(createSynthesizedVoiceWav(durationSeconds));
        };
        reader.readAsDataURL(blob);
      } else {
        finalizeAndSend(createSynthesizedVoiceWav(durationSeconds));
      }

      audioChunksRef.current = [];
    };

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
    setRecordingSeconds(0);
  };

  const simulateVoiceNote = () => {
    if (!selectedId) return;
    const durationSeconds = 4;
    const audioUrl = createSynthesizedVoiceWav(durationSeconds);

    const newMsg: Message = {
      id: "m_" + Date.now(),
      sender: "user",
      type: "voice",
      audioUrl: audioUrl,
      duration: `0:0${durationSeconds}`,
      text: "Voice message",
      time: "Just now",
    };

    const updated = conversations.map((c) => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: "🎤 Voice message",
          lastTime: "Just now",
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    setConversations(updated);
    try {
      localStorage.setItem("campus_stitch_conversations", JSON.stringify(updated));
    } catch {}

    setTimeout(() => scrollToBottom(true), 50);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#F9F9FB] text-zinc-900 select-none overflow-hidden">
      {/* Header - Fixed Top */}
      <header className="flex items-center justify-between px-4 py-3 flex-none bg-white border-b border-zinc-200">
        <div>
          <div className="font-bold text-lg tracking-tight text-black">
            Messages
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            Text & Voice Chat with Verified Students
          </div>
        </div>
        <span className="text-[11px] text-zinc-600 font-semibold bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
          Verified Only
        </span>
      </header>

      {/* Main Content Area */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <MessageSquare size={36} className="text-zinc-400 stroke-[1.5px]" />
          <div className="text-sm font-bold text-black">No active conversations</div>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            When you contact a ride organizer, bike owner, or marketplace seller, your chat will automatically appear here.
          </p>
          <div className="flex gap-2 pt-1">
            <Link
              href="/commute"
              className="h-8 px-3.5 bg-black text-white rounded-lg text-xs font-semibold flex items-center hover:bg-zinc-800 transition-colors"
            >
              Browse Rides
            </Link>
            <Link
              href="/market"
              className="h-8 px-3.5 border border-zinc-300 rounded-lg text-xs font-semibold text-black hover:bg-zinc-100 flex items-center transition-colors"
            >
              Explore Market
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Conversation List (Sidebar) */}
          <aside
            className={cn(
              "w-full md:w-80 border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto h-full",
              selectedId ? "hidden md:flex" : "flex"
            )}
          >
            <div className="p-3 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Active Chats ({conversations.length})
            </div>
            <div className="divide-y divide-zinc-100">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-zinc-100/80 border-l-4 border-black"
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {conv.contactName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-black flex items-center gap-1">
                          <span>{conv.contactName}</span>
                          <ShieldCheck
                            size={12}
                            className="stroke-[2.5px] text-black"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {conv.lastTime}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 font-semibold truncate mt-0.5">
                        {conv.contextTitle}
                      </div>
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Active Conversation Chat Pane */}
          {activeConv ? (
            <main
              className={cn(
                "flex-1 min-h-0 flex flex-col bg-[#F9F9FB] h-full overflow-hidden",
                !selectedId ? "hidden md:flex" : "flex"
              )}
            >
              {/* Context Banner - Fixed Header */}
              <div className="p-3 bg-white border-b border-zinc-200 flex items-center justify-between flex-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-1.5 -ml-1 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors shrink-0"
                    title="Back to chats"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black shrink-0">
                    {activeConv.contextType === "ride" && <Compass size={16} />}
                    {activeConv.contextType === "listing" && <Tag size={16} />}
                    {activeConv.contextType === "bike" && <Bike size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-black flex items-center gap-1.5 truncate">
                      <span>{activeConv.contactName}</span>
                      <ShieldCheck size={12} className="stroke-[2.5px] text-black shrink-0" />
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {activeConv.contextTitle} &middot; {activeConv.contextSubtitle}
                    </div>
                  </div>
                </div>
                <Link
                  href={activeConv.contextLink}
                  className="text-xs font-semibold text-black hover:underline shrink-0 ml-2"
                >
                  View Details →
                </Link>
              </div>

              {/* Messages Stream - Smooth Internal Scroll */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain"
              >
                {activeConv.messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-400">
                    Send a text or voice note to start chatting with {activeConv.contactName}.
                  </div>
                ) : (
                  activeConv.messages.map((m) => {
                    const isMe = m.sender === "user";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end ml-auto" : "items-start mr-auto"} max-w-[320px]`}
                      >
                        {m.type === "voice" ? (
                          <VoiceMessageBubble message={m} isMe={isMe} />
                        ) : (
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? "bg-black text-white rounded-tr-xs shadow-xs font-medium"
                                : "bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-2xs"
                            }`}
                          >
                            {m.text}
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-400 mt-1 px-1 flex items-center gap-1 font-medium">
                          <span>{m.time}</span>
                          {isMe && (
                            <CheckCheck size={12} className="text-black" />
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                {/* Scroll-to-bottom Anchor */}
                <div ref={messagesEndRef} className="h-1 shrink-0" />
              </div>

              {/* Chat Input Bar - Pinned to Bottom, Always Visible */}
              <div className="p-3 bg-white border-t border-zinc-200 flex-none shrink-0 sticky bottom-0 z-10">
                {isRecording ? (
                  <div className="flex items-center justify-between gap-3 h-10 px-3 bg-zinc-100 rounded-xl border border-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-xs font-bold text-black font-mono">
                        Recording 0:{recordingSeconds < 10 ? "0" + recordingSeconds : recordingSeconds}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stopVoiceRecording(false)}
                        className="p-1.5 text-zinc-500 hover:text-black transition-colors"
                        title="Cancel recording"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => stopVoiceRecording(true)}
                        className="px-3 py-1 rounded-lg bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Send Audio</span>
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      title="Record Voice Note"
                      className="w-10 h-10 shrink-0 rounded-lg border border-zinc-300 hover:border-black bg-white hover:bg-zinc-50 text-black flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Mic size={17} />
                    </button>

                    <input
                      aria-label="Type message"
                      placeholder={`Message ${activeConv.contactName}...`}
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      className="flex-1 min-w-0 h-10 px-3 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black"
                    />

                    <button
                      type="submit"
                      aria-label="Send message"
                      disabled={!inputMsg.trim()}
                      className="w-10 h-10 shrink-0 rounded-lg bg-black hover:bg-zinc-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </main>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <MobileShell className="h-full min-h-0 overflow-hidden">
      <React.Suspense fallback={<div className="p-6 text-xs text-zinc-500">Loading messages...</div>}>
        <MessagesContent />
      </React.Suspense>
    </MobileShell>
  );
}
