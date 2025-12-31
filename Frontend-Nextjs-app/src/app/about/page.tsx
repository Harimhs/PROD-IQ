"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Linkedin,
  Mail,
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden dark:bg-zinc-950 light:bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 dark:border-white/5 light:border-black/10 bg-background/5 dark:bg-zinc-950/5 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Nova</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/#feedback" className="hover:text-foreground transition-colors">
              Feedback
            </a>
            <a href="/about" className="hover:text-foreground transition-colors text-primary font-semibold">
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </Button>
            <Button
              size="sm"
              className="rounded-full px-5"
              onClick={() => router.push("/")}
            >
              Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 rounded-full border-primary/20 bg-primary/5 text-primary px-4 py-1.5">
            Our Story
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Solving Product Intelligence,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-500">
              One Analysis at a Time
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
           ProdIQ was born from frustration with fragmented product analytics. We're building the AI-powered intelligence platform that product teams deserve.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 bg-muted/10 dark:bg-white/5 light:bg-black/5 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">The Problem We're Solving</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
                <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-lg mb-3">Fragmented Analytics</h3>
                <p className="text-muted-foreground">
                  Product teams use 5-10 different tools to track metrics, customer feedback, and market trends. There's no unified source of truth.
                </p>
              </Card>

              <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
                <Target className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="font-semibold text-lg mb-3">No Smart Insights</h3>
                <p className="text-muted-foreground">
                  Raw data exists, but turning numbers into actionable strategy requires expertise that not all teams have in-house.
                </p>
              </Card>

              <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
                <Lightbulb className="h-8 w-8 text-yellow-400 mb-4" />
                <h3 className="font-semibold text-lg mb-3">Manual Effort</h3>
                <p className="text-muted-foreground">
                  Analyzing SEO performance, sentiment analysis, and competitive positioning takes weeks of manual research.
                </p>
              </Card>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-4">Our Research</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We surveyed 50+ product teams and found a shocking gap: <span className="font-semibold text-foreground">there is no specific, integrated product that combines real-time analytics, SEO analysis, sentiment analysis, and AI-powered strategic recommendations in one place.</span>
              </p>
              <p className="text-muted-foreground">
                Teams are stuck choosing between:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground list-disc list-inside">
                <li>Specialized tools that don't talk to each other</li>
                <li>Expensive consulting that they can't afford regularly</li>
                <li>Building custom dashboards with limited insights</li>
                <li>Guessing and hoping their decisions are right</li>
              </ul>
              <p className="text-lg font-semibold text-foreground mt-6">
                That's why we builtProdIQ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-24 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Solution</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
              <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Product Analytics</h3>
              <p className="text-muted-foreground">
                Deep analysis of your product metrics, customer behavior, and performance indicators to identify growth opportunities.
              </p>
            </Card>

            <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
              <Zap className="h-8 w-8 text-yellow-400 mb-4" />
              <h3 className="font-semibold text-lg mb-3">SEO Analysis</h3>
              <p className="text-muted-foreground">
                Intelligent analysis of your SEO performance, keyword opportunities, and competitive positioning in search.
              </p>
            </Card>

            <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
              <Users className="h-8 w-8 text-pink-400 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Sentiment Analysis</h3>
              <p className="text-muted-foreground">
                Understand customer sentiment across feedback, reviews, and social media to improve satisfaction and retention.
              </p>
            </Card>

            <Card className="p-8 border-white/10 bg-white/5 dark:bg-white/5 light:bg-black/5">
              <Lightbulb className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-3">Strategic Recommendations</h3>
              <p className="text-muted-foreground">
                AI-powered insights and actionable recommendations to guide your product strategy and business decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-24 bg-muted/10 dark:bg-white/5 light:bg-black/5 border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-16 text-center">Meet the Founders</h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Hariharasudhan */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  HS
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Hariharasudhan</h3>
              <p className="text-primary font-semibold mb-4">Co-Founder & Developer</p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A passionate full-stack developer from Coimbatore with 5+ years of experience building scalable products. Hariharasudhan saw firsthand how teams struggle with product analytics and decided to build a better solution.
              </p>
              <a
                href="https://linkedin.com/in/hariharasudhan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                <Linkedin className="h-5 w-5" />
                Connect on LinkedIn
              </a>
            </div>

            {/* Elango */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold">
                  EL
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Elango</h3>
              <p className="text-primary font-semibold mb-4">Co-Founder & Developer</p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                An innovative developer and entrepreneur from Coimbatore with deep expertise in AI and data analysis. Elango brings technical excellence and a vision for how AI can revolutionize product decision-making.
              </p>
              <a
                href="https://linkedin.com/in/elango"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
              >
                <Linkedin className="h-5 w-5" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>

          <div className="space-y-8">
            {[
              {
                stage: "The Discovery",
                description:
                  "While working on multiple SaaS projects, we realized we were constantly switching between 8-10 tools to get a complete picture of our products. We knew there had to be a better way.",
              },
              {
                stage: "The Research",
                description:
                  "We interviewed 50+ product managers and founders. 89% said they needed smarter analytics but were frustrated with fragmented tools. This validated our vision.",
              },
              {
                stage: "BuildingProdIQ",
                description:
                  "We started buildingProdIQ to solve this exact problem. By combining product analytics, SEO analysis, and sentiment analysis powered by AI, we created the unified platform we always wanted.",
              },
              {
                stage: "The Beta",
                description:
                  "We're now in Beta 0.0, learning from early users and refining the platform based on real feedback. Your input shapes whereProdIQ goes next.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="h-12 w-0.5 bg-primary/30 my-2" />}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold mb-2">{item.stage}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-muted/10 dark:bg-white/5 light:bg-black/5 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Join Us on This Journey</h2>
            <p className="text-xl text-muted-foreground mb-10">
              We're excited to collaborate with partners, early users, and visionaries who believe in the power of AI-driven product intelligence. Whether you want to tryProdIQ, share feedback, or explore partnership opportunities, we'd love to hear from you.
            </p>

            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8 mb-10">
              <h3 className="text-lg font-semibold mb-6">Let's Connect</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://linkedin.com/in/hariharasudhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  <Linkedin className="h-5 w-5" />
                  Hariharasudhan's LinkedIn
                </a>
                <a
                  href="https://linkedin.com/in/elango"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  <Linkedin className="h-5 w-5" />
                  Elango's LinkedIn
                </a>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">
              Or reach out to us directly at:{" "}
              <a
                href="mailto:hello@nova.ai"
                className="text-primary hover:underline font-semibold"
              >
                hello@prodIQ.ai
              </a>
            </p>

            <Button
              size="lg"
              className="rounded-full h-12 px-8"
              onClick={() => router.push("/")}
            >
              Explore ProdIQ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-background/50 dark:bg-zinc-950/50 light:bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with <span className="text-primary">♥</span> by Hariharasudhan & Elango
          </p>
          <p className="mt-2">© 2024ProdIQ AI Inc. From Coimbatore to the world.</p>
        </div>
      </footer>
    </div>
  );
}
