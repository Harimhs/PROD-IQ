"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DocumentationModal } from "@/components/documentation-modal";
import {
  ArrowRight,
  Bot,
  Shield,
  Zap,
  Code,
  Globe,
  Sparkles,
  User,
  Sun,
  Moon,
  Send,
  BookOpen,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import YouTubeVideo from "@/components/youtube-video";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ProdIQ, your AI product analyst. I can help you analyze your products, understand market trends, optimize pricing, identify feature gaps, and much more. What product would you like to analyze today?",
    },
    {
      id: "2",
      role: "user",
      content:
        "I want to analyze my SaaS product and understand how to improve it",
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Great! To provide you with meaningful insights, let me ask a few questions:\n\n1. What's your product category (e.g., project management, CRM, analytics)?\n2. How many customers do you currently have?\n3. What's your monthly churn rate?\n4. What are your top 3 customer complaints?\n\nWith this information, I can identify growth opportunities.",
    },
    {
      id: "4",
      role: "user",
      content:
        "It's a project management tool, 500 customers, 5% churn, and customers want better mobile experience",
    },
    {
      id: "5",
      role: "assistant",
      content:
        "Excellent! Here's my analysis:\n\n📊 **Market Position**: With 5% churn, you're in a healthy range.\n\n1. **Mobile App Development** - 87% of successful project management tools have native mobile apps. This could reduce churn by 2-3%.\n\n2. **Feature Priorities**:\n   • Task assignment on mobile\n   • Real-time notifications\n   • Offline task viewing\n\n3. **Revenue Opportunities**:\n   • Mobile-exclusive tier: $50k/month\n   • Premium support for enterprise\n\n4. **Competitive Advantage**:\n   • Focus on team collaboration\n   • Slack/Teams integration\n\nWould you like me to dive deeper?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        "That's an insightful question. Let me analyze this aspect of your product...",
        "Based on market trends and your current metrics, here's what I recommend...",
        "I can see how this relates to your overall product strategy. Here are my thoughts...",
        "This is a critical area for improvement. Consider implementing...",
        "Great observation. This aligns with industry best practices for SaaS products.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSending(true);
    setFeedbackError(false);

    // Get current timestamp
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    try {
      // 1. Send feedback to admin/team
      const adminEmailResult = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID",
        {
          from_name: feedbackName,
          name: feedbackName,
          email: feedbackEmail,
          message: feedbackMessage,
          time: currentTime,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
      );

      console.log("✅ Admin email sent successfully:", adminEmailResult);
      
      // 2. Send auto-reply confirmation to user
      const userEmailResult = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
        process.env.NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID || "YOUR_AUTO_REPLY_TEMPLATE_ID",
        {
          from_name: feedbackName,
          name: feedbackName,
          email: feedbackEmail,
          message: feedbackMessage,
          time: currentTime,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
      );

      console.log("✅ Auto-reply sent successfully:", userEmailResult);
      
      setFeedbackSubmitted(true);
      setFeedbackName("");
      setFeedbackEmail("");
      setFeedbackMessage("");
      
      setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("❌ Failed to send feedback:", error);
      setFeedbackError(true);
      
      setTimeout(() => {
        setFeedbackError(false);
      }, 5000);
    } finally {
      setFeedbackSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-emerald-600/20 selection:text-emerald-600 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900">
      <DocumentationModal open={docOpen} onOpenChange={setDocOpen} />

      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950 dark:from-emerald-900/30 light:from-emerald-50/50 light:via-slate-50 light:to-slate-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b dark:border-slate-800/50 light:border-slate-200/50 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <img src="/logo.png" alt="Logo" className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">ProdIQ</span>
            {/* <Badge className="ml-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 rounded-full px-2.5 py-0.5">
              Beta 0.0
            </Badge> */}
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium dark:text-slate-400 light:text-slate-600">
            <a href="#features" className="hover:text-emerald-500 transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-emerald-500 transition-colors">
              See It In Action
            </a>
            <button
              onClick={() => setDocOpen(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </button>
            <a href="/about" className="hover:text-emerald-500 transition-colors">
              About
            </a>
            <a href="#feedback" className="hover:text-emerald-500 transition-colors">
              Feedback
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
              data-testid="button-theme-toggle-nav"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              size="sm"
              className="rounded-full px-5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/chat")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Beta Banner */}
      <div className="fixed top-16 w-full z-40 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Beta Notice:</span> This is version 0.0. Responses may take up to 3 minutes due to resource constraints.{" "}
            <button
              onClick={() => setDocOpen(true)}
              className="underline hover:opacity-80"
            >
              Read limitations
            </button>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 md:pt-56 md:pb-32 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="max-w-2xl">
            {/* <Badge
              variant="outline"
              className="mb-6 rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-1.5 hover:bg-amber-500/15 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-2" />
              Beta Version 0.0 - Early Access
            </Badge> */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Analyze Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
                Products with AI
              </span>
            </h1>
            <p className="text-xl dark:text-slate-400 light:text-slate-600 mb-10 leading-relaxed max-w-lg">
              Get instant insights on product performance, market positioning, pricing strategy, and competitive advantages. See how ProdIQ can transform your product decisions.
            </p>
            {/* <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-semibold">Please note:</span> Responses may take up to 3 minutes due to current resource constraints as we scale the infrastructure.
                </span>
              </p>
            </div> */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="rounded-full h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/chat")}
                data-testid="button-start-chatting"
              >
                Start Analysis Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-8 text-base dark:border-slate-700 light:border-slate-300 dark:hover:bg-slate-800/50 light:hover:bg-slate-100 backdrop-blur-sm transition-all duration-300"
                onClick={() => setDocOpen(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-4 text-sm dark:text-slate-400 light:text-slate-600">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 dark:border-slate-950 light:border-slate-50 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-800 light:from-slate-200 light:to-slate-300 flex items-center justify-center text-xs text-white dark:text-white light:text-slate-700 shadow-lg"
                  >
                    <User className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <p>Early access - Help shape the future</p>
            </div>
          </div>

          {/* Live Chat Demo */}
          <div id="demo" className="relative sticky top-40">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-[2rem] blur-3xl opacity-40 animate-pulse" />
            <div className="relative dark:bg-slate-900/50 light:bg-white backdrop-blur-xl border dark:border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b dark:border-slate-800 light:border-slate-200 flex items-center gap-3 dark:bg-slate-900/30 light:bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xs font-bold">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium dark:text-slate-400 light:text-slate-600">
                    ProdIQ Product Analyst
                  </span>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xs font-bold">
                            P
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-xl px-3 py-2 max-w-xs text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-600/20"
                            : "dark:bg-slate-800/50 light:bg-slate-100 dark:text-slate-100 light:text-slate-900 border dark:border-slate-700 light:border-slate-200 rounded-bl-none shadow-lg"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xs font-bold">
                          P
                        </AvatarFallback>
                      </Avatar>
                      <div className="dark:bg-slate-800/50 light:bg-slate-100 border dark:border-slate-700 light:border-slate-200 rounded-xl rounded-bl-none px-3 py-2 flex gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t dark:border-slate-800 light:border-slate-200 dark:bg-slate-900/30 light:bg-slate-50">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about your product..."
                    className="flex-1 dark:bg-slate-800/50 light:bg-white border dark:border-slate-700 light:border-slate-300 rounded-full py-2 pl-3 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-slate-100 light:text-slate-900"
                    disabled={isLoading}
                    data-testid="input-message-demo"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="p-1.5 bg-emerald-600 rounded-full text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-emerald-600/30"
                    data-testid="button-send-demo"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 py-24 dark:bg-slate-900/30 light:bg-slate-100/50 border-t dark:border-slate-800 light:border-slate-200"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Supercharged Analysis Capabilities
            </h2>
            <p className="dark:text-slate-400 light:text-slate-600 text-lg">
              Built for product managers, founders, and teams who need actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-emerald-500" />,
                title: "Instant Insights",
                description:
                  "Get real-time analysis of your product metrics and market positioning with comprehensive data visualization.",
              },
              {
                icon: <Code className="w-6 h-6 text-teal-500" />,
                title: "Data-Driven",
                description:
                  "Analyzes your numbers to identify growth opportunities and risks with precision algorithms.",
              },
              {
                icon: <Shield className="w-6 h-6 text-emerald-600" />,
                title: "Competitive Intelligence",
                description:
                  "Understand your competitive advantages and market positioning through industry benchmarks.",
              },
              {
                icon: <Globe className="w-6 h-6 text-teal-600" />,
                title: "Market Trends",
                description:
                  "Stay informed on industry trends and emerging opportunities across global markets.",
              },
              {
                icon: <Bot className="w-6 h-6 text-emerald-400" />,
                title: "Strategy Builder",
                description:
                  "Get strategic recommendations for pricing, features, and expansion backed by data.",
              },
              {
                icon: <Sparkles className="w-6 h-6 text-teal-400" />,
                title: "Revenue Optimization",
                description:
                  "Discover new revenue streams and optimize your pricing model for maximum growth.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border dark:border-slate-800 light:border-slate-200 dark:bg-slate-900/50 light:bg-white dark:hover:bg-slate-800/50 light:hover:bg-slate-50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-600/10 hover:border-emerald-600/30"
              >
                <div className="mb-4 h-12 w-12 rounded-xl dark:bg-slate-800 light:bg-slate-100 flex items-center justify-center border dark:border-slate-700 light:border-slate-200 group-hover:scale-110 group-hover:border-emerald-600/30 transition-all duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-slate-100 light:text-slate-900">{feature.title}</h3>
                <p className="dark:text-slate-400 light:text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video */}
      <section className="flex flex-col items-center z-10 py-24 container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-center">
          See ProdIQ in Action
        </h2>
        <p className="text-center dark:text-slate-400 light:text-slate-600 text-lg mb-12 max-w-2xl">
          Watch a comprehensive walkthrough of how ProdIQ analyzes real product data and delivers actionable insights.
        </p>
        <div className="w-full max-w-4xl">
          <YouTubeVideo videoId="E7wJTI-1dvQ" />
        </div>
      </section>

      {/* Feedback Section */}
      <section
        id="feedback"
        className="relative z-10 py-24 container mx-auto px-4 dark:bg-slate-900/30 light:bg-slate-100/50 border-t dark:border-slate-800 light:border-slate-200"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
              <MessageSquare className="h-8 w-8 text-emerald-600" />
              Share Your Feedback
            </h2>
            <p className="dark:text-slate-400 light:text-slate-600 text-lg">
              Your feedback directly shapes ProdIQ's future. As a beta user, your input is invaluable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <div className="rounded-2xl border dark:border-slate-800 light:border-slate-200 dark:bg-slate-900/50 light:bg-white backdrop-blur-sm p-8 shadow-xl">
              <h3 className="text-xl font-semibold mb-6">Send us feedback</h3>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Name</label>
                  <Input
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={feedbackSending}
                    className="dark:bg-slate-800/50 light:bg-slate-50 dark:border-slate-700 light:border-slate-200 focus:ring-2 focus:ring-emerald-500/50"
                    data-testid="input-feedback-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Email</label>
                  <Input
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    type="email"
                    placeholder="your@email.com"
                    required
                    disabled={feedbackSending}
                    className="dark:bg-slate-800/50 light:bg-slate-50 dark:border-slate-700 light:border-slate-200 focus:ring-2 focus:ring-emerald-500/50"
                    data-testid="input-feedback-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Feedback</label>
                  <Textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Share your thoughts, bugs, or feature requests..."
                    rows={5}
                    required
                    disabled={feedbackSending}
                    className="dark:bg-slate-800/50 light:bg-slate-50 dark:border-slate-700 light:border-slate-200 focus:ring-2 focus:ring-emerald-500/50"
                    data-testid="input-feedback-message"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={feedbackSending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 disabled:opacity-50"
                  data-testid="button-submit-feedback"
                >
                  {feedbackSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </form>

              {/* Success Message */}
              {feedbackSubmitted && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Thank you!
                    </p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Your feedback has been sent successfully. Check your email for confirmation!
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {feedbackError && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">
                      Oops! Something went wrong
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Failed to send feedback. Please try again or email us directly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Types */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6">We value your input on:</h3>
              <div className="space-y-3">
                {[
                  "🐛 Bugs or errors you encountered",
                  "💡 Feature requests and ideas",
                  "⏱️ Performance and response time issues",
                  "🎯 Accuracy of the analysis provided",
                  "👤 User experience and interface improvements",
                  "🔒 Data privacy or security concerns",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl dark:bg-slate-900/50 light:bg-slate-50 border dark:border-slate-800 light:border-slate-200 hover:border-emerald-600/30 transition-all duration-300">
                    <span className="text-lg flex-shrink-0">{item.split(" ")[0]}</span>
                    <p className="dark:text-slate-400 light:text-slate-600 text-sm">{item.substring(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden border dark:border-slate-800 light:border-slate-200 bg-gradient-to-br from-emerald-950/80 via-teal-950/80 to-slate-950 dark:from-emerald-950/80 dark:via-teal-950/80 dark:to-slate-950 light:from-emerald-50 light:via-teal-50 light:to-slate-50 p-12 md:p-24 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight dark:text-slate-100 light:text-slate-900">
              Start Analyzing Your Products Today
            </h2>
            <p className="text-xl dark:text-slate-300 light:text-slate-600 mb-10">
              Join our beta community shaping the future of AI-powered product analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/chat")}
                data-testid="button-get-started-cta"
              >
                Start Free Analysis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full h-14 px-8 text-lg dark:border-slate-700 light:border-slate-300 dark:hover:bg-slate-800/50 light:hover:bg-white backdrop-blur-sm transition-all duration-300"
                onClick={() => setDocOpen(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Read Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t dark:border-slate-800 light:border-slate-200 py-12 dark:bg-slate-950/50 light:bg-white backdrop-blur-xl">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">ProdIQ</span>
              {/* <Badge className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">Beta</Badge> */}
            </div>
            <p className="text-sm dark:text-slate-400 light:text-slate-600">
              AI-powered product analysis for smarter decisions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-slate-100 light:text-slate-900">Product</h4>
            <ul className="space-y-2 text-sm dark:text-slate-400 light:text-slate-600">
              <li>
                <a href="#features" className="hover:text-emerald-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <button onClick={() => setDocOpen(true)} className="hover:text-emerald-500 transition-colors">
                  Documentation
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-slate-100 light:text-slate-900">Support</h4>
            <ul className="space-y-2 text-sm dark:text-slate-400 light:text-slate-600">
              <li>
                <a href="#feedback" className="hover:text-emerald-500 transition-colors">
                  Feedback
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-slate-100 light:text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm dark:text-slate-400 light:text-slate-600">
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t dark:border-slate-800 light:border-slate-200 text-center text-sm dark:text-slate-400 light:text-slate-600">
          © 2024 ProdIQ AI Inc. Beta Version 0.0 - All rights reserved.
        </div>
      </footer>
    </div>
  );
}
