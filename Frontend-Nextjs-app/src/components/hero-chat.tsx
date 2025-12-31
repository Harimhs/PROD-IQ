'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Sparkles } from 'lucide-react'


export default function HeroChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI assistant. Ask me anything!`,
    },
  ])
  const [input, setInput] = useState('')


  const demoMessages = [
    'What can you help me with?',
    'Tell me about AI',
    'How does this work?',
  ]


  const sendMessage = (text: string) => {
    if (!text.trim()) return


    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      {
        role: 'assistant',
        content: `Great question! "${text}" - This is a demo response. Try the full chat for real interactions!`,
      },
    ])
    setInput('')
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground">
            Live Demo
          </span>
        </div>
      </CardHeader>


      <CardContent>
        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-500">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}


              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>


              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>


        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {demoMessages.map((msg, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(msg)}
              className="text-xs"
            >
              {msg}
            </Button>
          ))}
        </div>


        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 
