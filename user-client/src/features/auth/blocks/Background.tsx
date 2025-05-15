export const Background = () => (
  <>
    {/* Video Background */}
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      >
        <source
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"/>
    </div>
  </>
);