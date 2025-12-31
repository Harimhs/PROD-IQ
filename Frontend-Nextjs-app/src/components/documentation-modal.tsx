import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, AlertCircle, Clock, MessageSquare, Code, Shield } from "lucide-react";

interface DocumentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentationModal({ open, onOpenChange }: DocumentationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            ProdIQ Documentation
          </DialogTitle>
          <DialogDescription>
            Learn how to use ProdIQ Product Analyzer effectively
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Beta Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Beta Version 0.0
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This is a beta release. Features and responses may change as we improve the platform. Your feedback helps us improve faster.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Getting Started
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  ProdIQ analyzes your product by asking key questions about your business metrics, customer feedback, and market positioning.
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Start Analysis Free" to begin</li>
                  <li>Answer questions about your product (metrics, customers, features)</li>
                  <li>Receive AI-powered insights and recommendations</li>
                  <li>Share feedback to help us improve</li>
                </ol>
              </div>
            </div>

            {/* Limitations */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Known Limitations
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>
                  <span className="font-semibold text-foreground">Response Time:</span> Responses may take up to 3 minutes due to current resource constraints
                </li>
                <li>
                  <span className="font-semibold text-foreground">Limited Context:</span> AI has access only to information you provide in the chat
                </li>
                <li>
                  <span className="font-semibold text-foreground">Session Duration:</span> Conversations are stored locally and may not persist across sessions
                </li>
                <li>
                  <span className="font-semibold text-foreground">Accuracy:</span> While AI provides insights, verify critical business decisions with your team
                </li>
              </ul>
            </div>

            {/* Best Practices */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Best Practices</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">📊 Provide Specific Metrics</p>
                  <p className="text-muted-foreground">
                    Share actual numbers: customer count, churn rate, MRR, growth rate. More data = better insights.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">🎯 Ask Specific Questions</p>
                  <p className="text-muted-foreground">
                    Instead of "How can I improve?", ask "How can I reduce churn?" or "What features should I prioritize?"
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">💬 Follow Up Questions</p>
                  <p className="text-muted-foreground">
                    Ask clarifying questions to get deeper insights. Each follow-up helps ProdIQ understand your context better.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Core Features</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ <span className="font-semibold text-foreground">Product Analysis</span> - Deep dive into your product metrics and performance</p>
                <p>✅ <span className="font-semibold text-foreground">Market Insights</span> - Understand competitive positioning and market trends</p>
                <p>✅ <span className="font-semibold text-foreground">Feature Recommendations</span> - Get prioritized suggestions based on data</p>
                <p>✅ <span className="font-semibold text-foreground">Pricing Strategy</span> - Explore pricing models and revenue opportunities</p>
                <p>✅ <span className="font-semibold text-foreground">Growth Analysis</span> - Identify growth bottlenecks and opportunities</p>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Support & Feedback
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your feedback is crucial for improving ProdIQ. Please report:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Bugs or unexpected behavior</li>
                <li>Feature requests or suggestions</li>
                <li>Analysis that seems inaccurate</li>
                <li>General user experience improvements</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Use the feedback form on the homepage to share your thoughts.
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold text-lg mb-3">FAQ</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">Is my data stored?</p>
                  <p className="text-muted-foreground">
                    Currently conversations are stored locally. We recommend not sharing sensitive data in beta.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Can I export my analysis?</p>
                  <p className="text-muted-foreground">
                    In future releases, we'll add export options for PDF and CSV formats.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Will this cost money?</p>
                  <p className="text-muted-foreground">
                    Beta access is free. Pricing will be announced when we move out of beta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
