# 🎮 Trickal - Wake Up Ner Slap Game

A hilarious interactive web game where you wake up a sleepy Ner with epic slaps! Built for pure entertainment and good vibes.

![Trickal Game Preview](./public/img/meta.png)

## 🚀 Live Demo

Visit [slapner.com](https://slapner.vercel.app/) to play now!

## 🎯 Game Features

- **Interactive Slapping**: Click anywhere or press any key to slap
- **Responsive Animations**: Different animations for normal vs rapid clicking
- **Sound Effects**: Multiple slap sounds with random selection
- **Background Music**: Atmospheric music with toggle controls
- **Click Counter**: Track your slaps with persistent localStorage
- **Mobile Optimized**: Touch-friendly interface for mobile devices
- **Fullscreen Mode**: Immersive gaming experience
- **Credits Panel**: Slide-up panel with game information

## 🎮 How to Play

### Desktop
- **Press any key** or **click anywhere** to wake up the Ner
- Rapid clicking triggers special fast animations
- Use the music button (top-right) to toggle background music
- Click fullscreen button (bottom-right) for immersive mode

### Mobile
- **Tap anywhere** on the screen to slap
- All buttons are touch-optimized for mobile devices
- Responsive design adapts to different screen sizes

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Audio**: HTML5 Audio API
- **Video**: HTML5 Video with multiple formats
- **Storage**: localStorage for persistent data
- **Responsive**: Mobile-first design approach

## 📁 Project Structure

```
trickal/
├── public/
│   ├── audio/           # Sound effects and music
│   │   ├── slap1-5.mp3  # Random slap sounds
│   │   └── trickal.mp3  # Background music
│   ├── vdo/             # Video files
│   │   ├── loop.mp4     # Background loop video
│   │   ├── vdo_slap_full.mp4  # Full slap animation
│   │   ├── vdo_slap1.mp4      # Quick slap 1
│   │   └── vdo_slap2.mp4      # Quick slap 2
│   └── img/             # Image assets
│       ├── arm1.png     # Animation frame 1
│       ├── img2.png     # Animation frame 2
│       ├── arm3.png     # Animation frame 3
│       └── meta.png     # Social media preview image
├── src/
│   ├── App.jsx          # Main game component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles and animations
└── index.html           # HTML template with meta tags
```

## 🎨 Game Mechanics

### Click Detection
- **Normal Clicks**: Plays full slap video with sound
- **Rapid Clicks**: Triggers fast frame sequence animation
- **Spam Threshold**: 200ms between clicks to detect rapid clicking

### Audio System
- **Random Sound Selection**: 5 different slap sounds
- **Audio Cloning**: Allows overlapping sounds for rapid clicks
- **Background Music**: Looping ambient music with volume control

### Visual Effects
- **Video Overlays**: Seamless video switching based on click speed
- **Frame Animations**: Quick 3-frame sequence for rapid interactions
- **Responsive Design**: Adapts to desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trickal.git
   cd trickal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎵 Audio Files

Make sure to include these audio files in `/public/audio/`:
- `slap1.mp3` - `slap5.mp3`: Various slap sound effects
- `trickal.mp3`: Background ambient music

## 🎬 Video Files

Required video files in `/public/vdo/`:
- `loop.mp4`: Background loop video
- `vdo_slap_full.mp4`: Full slap animation
- `vdo_slap1.mp4` & `vdo_slap2.mp4`: Quick slap animations

## 🖼️ Image Assets

Animation frames in `/public/img/`:
- `arm1.png`: Wind-up frame
- `img2.png`: Impact frame  
- `arm3.png`: Follow-through frame

## 📊 Performance Features

- **Preloading**: Critical video and audio assets
- **Lazy Loading**: Non-critical resources loaded on demand
- **Optimized Animations**: CSS transforms for smooth performance
- **Memory Management**: Proper cleanup of audio and video elements

## 🎮 Game Statistics

- **Click Counter**: Persistent across browser sessions
- **localStorage**: Saves your slap count automatically
- **Real-time Updates**: Instant feedback on every interaction

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Credits

- **Game Development**: Trickal Team
- **Audio & Music**: Sound Design Studio
- **Graphics & Animation**: Visual Arts Team
- **Special Thanks**: All the players who enjoy slapping for good vibes!

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 🌟 Show Your Support

Give a ⭐️ if you enjoyed slapping the Ner and this project brought you good vibes!

---

**Made with ❤️ for entertainment and good vibes only!**

*Wake up, Ner! The slaps await! 👋*