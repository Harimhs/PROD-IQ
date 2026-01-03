"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Plus,
  Menu,
  Settings,
  LogOut,
  Sun,
  Moon,
  Trash2,
  MessageSquare,
  BookOpen,
  Search,
  Sparkles,
  X,
  Wrench,
  Mic,
  MicOff,
} from "lucide-react";
import { useTheme } from "next-themes";

const API_URL = "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tools?: string[];
  hasCharts?: boolean;
}

interface ChatHistory {
  user: string;
  assistant: string;
  turn: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  sessionId: string;
  chatHistory: ChatHistory[];
}

interface ChartData {
  name: string;
  data: string;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const AVAILABLE_TOOLS: Tool[] = [
  {
    id: "journey_simulator",
    name: "Journey Simulator",
    icon: <BookOpen className="h-4 w-4" />,
    description: "Explore possible future scenarios",
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    icon: <Search className="h-4 w-4" />,
    description: "Analyze market competition",
  },
];

export default function Chat() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Analysis",
      sessionId: `session_${Date.now()}`,
      chatHistory: [],
      messages: [
        {
          id: "m1",
          role: "assistant",
          content:
            "👋 Hey! I'm PROD-IQ, your AI startup analyst. Ask me about your metrics, predictions, or use the tools above for deep dives.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);

  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("connected");
  const [generatingCharts, setGeneratingCharts] = useState<{
    [key: string]: boolean;
  }>({});
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>(
    {}
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [needsExtraPadding, setNeedsExtraPadding] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null); // Ref for the messages div
  const bottomRef = useRef<HTMLDivElement>(null); // New ref for bottom anchor
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const isDark = theme === "dark";
  const selectedTool = AVAILABLE_TOOLS.find((tool) => tool.id === activeTool);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        console.log("Speech Recognition API is available");

        try {
          const recognitionInstance = new SpeechRecognition();

          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = true;
          recognitionInstance.maxAlternatives = 1;
          recognitionInstance.lang = "en-US";

          recognitionInstance.onstart = () => {
            console.log("🎤 Speech recognition started");
            setIsRecording(true);
          };

          recognitionInstance.onresult = (event: any) => {
            console.log("Speech result received");

            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;

              if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              setInput((prev) => prev + finalTranscript);
              console.log("Final transcript added:", finalTranscript);
            }

            if (interimTranscript) {
              console.log("Interim:", interimTranscript);
            }
          };

          recognitionInstance.onerror = (event: any) => {
            console.error(" Speech error:", event.error);

            if (event.error === "no-speech" || event.error === "aborted") {
              return;
            }

            setIsRecording(false);

            if (event.error === "not-allowed") {
              alert(
                "Microphone permission denied. Please allow microphone access."
              );
            } else if (event.error === "audio-capture") {
              alert("No microphone found. Please connect a microphone.");
            } else if (event.error === "network") {
              alert(
                "Network error. Speech recognition requires internet connection."
              );
            }
          };

          recognitionInstance.onend = () => {
            console.log("Speech recognition ended");
            if (isRecording) {
              console.log(" Auto-restarting recognition...");
              try {
                recognitionInstance.start();
              } catch (error) {
                console.error("Failed to restart:", error);
                setIsRecording(false);
              }
            } else {
              setIsRecording(false);
            }
          };

          setRecognition(recognitionInstance);
          console.log("Speech recognition initialized");
        } catch (error) {
          console.error("Failed to initialize speech recognition:", error);
          setSpeechSupported(false);
        }
      } else {
        console.warn(" Speech Recognition not supported");
        setSpeechSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
  }, []);

  useEffect(() => {
    setNeedsExtraPadding(isLoading || input.trim().length > 0);
  }, [isLoading, input]);

  // Improved scroll using scrollIntoView on bottom ref - more reliable for dynamic content
  useLayoutEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [currentConversation?.messages, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        // Re-scroll on viewport resize (keyboard, etc.)
        setTimeout(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }
        }, 150);
      };
      window.visualViewport?.addEventListener("resize", handleResize);
      return () =>
        window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setToolDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      console.log(" API Connected:", data.service);
      setApiStatus("connected");
    } catch (error) {
      console.error(" API Offline:", error);
      setApiStatus("disconnected");
    }
  };

  const toggleTool = (toolId: string) => {
    setActiveTool((prev) => (prev === toolId ? null : toolId));
    setToolDropdownOpen(false);
  };

  const clearTool = () => {
    setActiveTool(null);
  };

  const toggleRecording = () => {
    console.log(" Toggle recording clicked");

    if (!speechSupported || !recognition) {
      alert(
        "Speech recognition is not supported in your browser.\n\nPlease use Chrome, Edge, or Safari on HTTPS/localhost."
      );
      return;
    }

    if (isRecording) {
      console.log("Stopping recording");
      setIsRecording(false);
      try {
        recognition.stop();
      } catch (error) {
        console.error("Error stopping:", error);
      }
    } else {
      console.log(" Starting recording");
      setIsRecording(true);
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting:", error);
        setIsRecording(false);
        alert(
          "Failed to start speech recognition. Please refresh and try again."
        );
      }
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /###\s(.+)/g,
        '<h3 style="margin-top: 15px; color: #10b981; font-size: 1.1em; font-weight: 600;">$1</h3>'
      )
      .replace(
        /##\s(.+)/g,
        '<h2 style="margin-top: 20px; color: #10b981; font-size: 1.2em; font-weight: 700;">$1</h2>'
      )
      .replace(/⚠️/g, '<span style="color: #f59e0b;">⚠️</span>')
      .replace(/✅/g, '<span style="color: #10b981;">✅</span>')
      .replace(/\n/g, "<br>");
  };

  const generateCharts = async (messageId: string, responseText: string) => {
    setGeneratingCharts((prev) => ({ ...prev, [messageId]: true }));

    try {
      const response = await fetch(`${API_URL}/generate_charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText }),
      });

      const result = await response.json();

      if (result.success && result.charts && result.charts.length > 0) {
        setChartData((prev) => ({ ...prev, [messageId]: result.charts }));
        return result.charts;
      }
    } catch (error) {
      console.error("Chart generation error:", error);
    } finally {
      setGeneratingCharts((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      tools: activeTool ? [activeTool] : undefined,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    const messageContent = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: messageContent,
          active_tool: activeTool || null,
          chat_history: currentConversation.chatHistory,
          session_id: currentConversation.sessionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantContent = result.response;
        const hasCodeBlocks = assistantContent.includes("```");

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
          tools: result.tools_called,
          hasCharts:
            hasCodeBlocks &&
            (activeTool === "journey_simulator" ||
              activeTool === "competitor_analysis"),
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === currentConversationId) {
              const updatedMessages = [...conv.messages, assistantMessage];
              const updatedChatHistory = [
                ...conv.chatHistory,
                {
                  user: messageContent,
                  assistant: assistantContent,
                  turn: conv.chatHistory.length + 1,
                },
              ];

              let updatedTitle = conv.title;
              if (conv.messages.length === 1) {
                updatedTitle =
                  messageContent.slice(0, 30) +
                  (messageContent.length > 30 ? "..." : "");
              }

              return {
                ...conv,
                messages: updatedMessages,
                chatHistory: updatedChatHistory,
                title: updatedTitle,
              };
            }
            return conv;
          })
        );
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${result.error}`,
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, errorMessage] }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("API Error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: ` Connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New Analysis",
      sessionId: `session_${Date.now()}`,
      chatHistory: [],
      messages: [
        {
          id: "m1",
          role: "assistant",
          content:
            "👋 Hey! I'm PROD-IQ, your AI startup analyst. Ask me about your metrics, predictions, or use the tools above for deep dives.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setActiveTool(null);
  };

  const deleteConversation = (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (currentConversationId === id && remaining.length > 0) {
      setCurrentConversationId(remaining[0].id);
    } else if (remaining.length === 0) {
      createNewConversation();
    }
  };

  const getPlaceholder = () => {
    if (activeTool === "journey_simulator") {
      return "Ask about your possible futures...";
    } else if (activeTool === "competitor_analysis") {
      return "Ask about competition...";
    }
    return "Ask about your startup metrics...";
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`flex h-screen relative overflow-hidden ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-50"
        }`}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgxMDAsIDEwMCwgMTAwLCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          sidebarOpen ? "w-72" : "md:w-16"
        } fixed md:relative h-full backdrop-blur-xl flex flex-col transition-all duration-300 overflow-hidden z-50 ${
          isDark
            ? "bg-slate-900/95 border-r border-slate-800"
            : "bg-white/95 border-r border-slate-200"
        }`}
      >
        <div className="md:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {sidebarOpen && (
          <div className="hidden md:block p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className={`rounded-xl transition-all duration-200 ${
                isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        {sidebarOpen && (
          <>
            <div
              className={`p-4 ${
                isDark
                  ? "border-b border-slate-800"
                  : "border-b border-slate-200"
              }`}
            >
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 rounded-xl gap-2 justify-start transition-all duration-300 hover:scale-[1.02]"
                size="sm"
                onClick={createNewConversation}
                data-testid="button-new-chat"
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span>New Chat</span>
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {conversations.map((conv) => (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => setCurrentConversationId(conv.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                        currentConversationId === conv.id
                          ? isDark
                            ? "bg-emerald-600/20 text-emerald-400 font-medium shadow-lg border border-emerald-600/30"
                            : "bg-emerald-50 text-emerald-700 font-medium shadow-lg border border-emerald-200"
                          : isDark
                          ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                      data-testid={`button-conversation-${conv.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </div>
                    </button>
                    {conversations.length > 1 && (
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-red-500/20 rounded-lg"
                        data-testid={`button-delete-${conv.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {!sidebarOpen && <div className="flex-1" />}

        <div
          className={`p-4 space-y-2 ${
            isDark ? "border-t border-slate-800" : "border-t border-slate-200"
          }`}
        >
          <Button
            variant="ghost"
            className={`${
              sidebarOpen
                ? "w-full justify-start"
                : "w-8 h-8 p-0 justify-center"
            } gap-3 rounded-xl transition-all duration-200 ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            size="sm"
            title={!sidebarOpen ? "Settings" : ""}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={`${
              sidebarOpen
                ? "w-full justify-start"
                : "w-8 h-8 p-0 justify-center"
            } gap-3 rounded-xl transition-all duration-200 ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            size="sm"
            onClick={() => router.push("/")}
            data-testid="button-back-home"
            title={!sidebarOpen ? "Back to Home" : ""}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>Back to Home</span>}
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header
          className={`backdrop-blur-xl px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-20 ${
            isDark
              ? "bg-slate-900/50 border-b border-slate-800"
              : "bg-white/80 border-b border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden rounded-xl transition-all duration-200 ${
                isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className={`hidden md:block rounded-xl transition-all duration-200 ${
                  isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                }`}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/30">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <img src="/logo.png" alt="Logo" className="h-5 w-5" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg">PROD-IQ</span>
                <p className="text-xs text-slate-500">AI Startup Analyst</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {apiStatus === "connected" && (
              <div
                className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm border ${
                  isDark
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                    : "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDark ? "bg-emerald-400" : "bg-emerald-500"
                  }`}
                />
                Connected
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`rounded-xl transition-all duration-200 ${
                isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
              }`}
              data-testid="button-theme-toggle"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1" ref={messagesContainerRef}>
          <div
            className={`p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full pt-4 ${
              needsExtraPadding ? "pb-[500px]" : "pb-[250px]"
            }`}
          >
            {currentConversation?.messages.map((message, index) => {
              const isAssistant = message.role === "assistant";
              const isLast = index === currentConversation.messages.length - 1;

              return (
                <div
                  key={message.id}
                  className={`flex w-full mb-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`relative max-w-[70%] rounded-2xl px-4 py-3 text-sm
                    ${
                      isAssistant
                        ? "bg-slate-800 text-slate-100"
                        : "bg-emerald-600 text-white"
                    }
                    break-words whitespace-pre-wrap overflow-hidden
                    ${isAssistant && isLast ? "animate-fade-in" : ""}`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <Avatar className="h-10 w-10 flex-shrink-0 mt-1 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xs font-bold">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`backdrop-blur-xl rounded-2xl px-6 py-4 flex gap-2 shadow-lg ${
                    isDark
                      ? "bg-slate-800/50 text-slate-100 border border-slate-700"
                      : "bg-white text-slate-900 border border-slate-200"
                  }`}
                >
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" />
                  <div
                    className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            {/* Bottom anchor for reliable scrolling */}
            <div ref={bottomRef} className="h-0" />
          </div>
        </ScrollArea>

        <div
          className={`backdrop-blur-xl p-4 fixed bottom-0 right-0 left-0 md:left-16 transition-all duration-300 z-20 ${
            sidebarOpen ? "md:left-72" : "md:left-16"
          }`}
        >
          <div
            className="max-w-5xl mx-auto"
            style={{ minHeight: "100px", maxHeight: "110px" }}
          >
            {selectedTool && (
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
                    isDark
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {selectedTool.icon}
                  <span className="font-medium">{selectedTool.name}</span>
                  <button
                    onClick={clearTool}
                    className="ml-1 hover:bg-emerald-600/20 rounded p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <div
                className={`flex items-center gap-2 rounded-2xl border transition-all duration-300 p-2 ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700 focus-within:border-emerald-600"
                    : "bg-white border-slate-300 focus-within:border-emerald-500"
                }`}
              >
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setToolDropdownOpen(!toolDropdownOpen)}
                    className="h-[90px] flex items-center px-2" // match textarea height
                  >
                    <div
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200"
                    >
                      <img
                        src="/icons/page_info.svg"
                        alt="Gemini tools"
                        className="w-4 h-4 invert"
                      />
                      <span>Tools</span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {toolDropdownOpen && (
                    <div
                      className={`absolute bottom-full left-0 mb-2 w-72 rounded-xl shadow-2xl border overflow-hidden ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 border-b text-xs font-semibold ${
                          isDark
                            ? "border-slate-700 text-slate-400"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        Select a tool
                      </div>
                      <div className="py-1">
                        {AVAILABLE_TOOLS.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => toggleTool(tool.id)}
                            className={`w-full px-3 py-2.5 text-left flex items-start gap-3 transition-all duration-200 ${
                              activeTool === tool.id
                                ? isDark
                                  ? "bg-emerald-600/20 text-emerald-400"
                                  : "bg-emerald-50 text-emerald-700"
                                : isDark
                                ? "hover:bg-slate-700 text-slate-300"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="mt-0.5">{tool.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {tool.name}
                              </div>
                              <div
                                className={`text-xs mt-0.5 ${
                                  isDark ? "text-slate-500" : "text-slate-500"
                                }`}
                              >
                                {tool.description}
                              </div>
                            </div>
                            {activeTool === tool.id && (
                              <div className="mt-0.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onFocus={() => {
                    setTimeout(() => {
                      if (bottomRef.current) {
                        bottomRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "end",
                        });
                      }
                    }, 100);
                  }}
                  placeholder={
                    isRecording ? "🎤 Listening..." : getPlaceholder()
                  }
                  className={`flex-1 resize-none border-0 bg-transparent focus:outline-none px-3 h-[90px] overflow-y-auto ${
                    isDark
                      ? "text-slate-100 placeholder:text-slate-500"
                      : "text-slate-900 placeholder:text-slate-500"
                  }`}
                  data-testid="input-message"
                />

                {/* Voice and Send buttons */}
                <div className="flex-shrink-0 flex gap-2 pr-[5px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    disabled={!speechSupported}
                    title={
                      !speechSupported
                        ? "Speech recognition not supported"
                        : isRecording
                        ? "Stop recording"
                        : "Start recording"
                    }
                    className={`rounded-xl transition-all duration-200 ${
                      isRecording
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        : !speechSupported
                        ? "opacity-50 cursor-not-allowed"
                        : isDark
                        ? "hover:bg-slate-700"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5 animate-pulse" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30"
                    data-testid="button-send"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
