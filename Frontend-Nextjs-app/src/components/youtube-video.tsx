"use client"

interface YouTubeVideoProps {
  videoId: string
  title?: string
}

export default  function YouTubeVideo({ videoId, title = "Product demo" }: YouTubeVideoProps) {
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/50 bg-black/80">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
