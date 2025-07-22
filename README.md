# 📝 Interactive Digital Exam

A web-based application that allows students to upload test paper images and answer them digitally using Apple Pencil or touch input, with a realistic book-like page flipping experience.

## ✨ Features

### 🎯 Core Functionality
- **Image Upload**: Support for multiple image formats (JPG, PNG, PDF)
- **Apple Pencil Support**: Full pressure-sensitive drawing with smooth strokes
- **Touch Drawing**: Compatible with finger touch and stylus input
- **Book Navigation**: Realistic page flipping animations
- **Multi-page Support**: Handle multiple test pages seamlessly

### 🎨 Drawing Tools
- **Digital Pen**: Multiple colors and brush sizes
- **Eraser Tool**: Clean removal of drawings
- **Undo/Redo**: Full history management
- **Pressure Sensitivity**: Natural writing experience with Apple Pencil

### 💾 Save & Export
- **Auto-save**: Automatic progress saving every 30 seconds
- **JSON Export**: Save complete exam with drawings
- **Image Export**: Download pages as PNG files
- **PDF Export**: Create PDF with annotations (requires jsPDF library)

### 📱 Responsive Design
- **Mobile-first**: Optimized for tablets and smartphones
- **Cross-platform**: Works on iOS, Android, and desktop
- **Keyboard Shortcuts**: Arrow keys for navigation, Ctrl+Z/Y for undo/redo

## 🚀 Getting Started

### Quick Start
1. Clone or download this repository
2. Open `index.html` in a web browser
3. Upload your test paper images
4. Start answering with Apple Pencil or touch input!

### GitHub Pages Deployment
This project is ready for GitHub Pages deployment:

1. **Fork/Clone** this repository to your GitHub account
2. **Enable GitHub Pages** in repository settings
3. **Select source** as main branch / root
4. **Access** your deployed site at `https://yourusername.github.io/exam-website`

## 📁 Project Structure

```
exam-website/
├── index.html          # Main application page
├── css/
│   └── styles.css      # Complete styling with animations
├── js/
│   ├── app.js         # Main application controller
│   ├── canvas.js      # Drawing canvas with Apple Pencil support
│   ├── flipbook.js    # Page navigation and animations
│   └── storage.js     # Save/load and export functionality
└── README.md          # This file
```

## 🎨 How to Use

### 1. Upload Test Papers
- Drag and drop image files or click to browse
- Supports multiple images for multi-page exams
- PDF support (treated as single images)

### 2. Drawing Tools
- **Select Pen/Eraser** from the sidebar
- **Choose Colors** from the palette
- **Adjust Brush Size** with the slider
- **Use Undo/Redo** for corrections

### 3. Navigation
- **Mouse/Touch**: Click navigation buttons
- **Keyboard**: Use arrow keys
- **Swipe Gestures**: Swipe left/right on touch devices

### 4. Save Your Work
- **Auto-save**: Automatically saves progress
- **Manual Save**: Click save button for export options
- **Multiple Formats**: JSON, images, or PDF

## 🍎 Apple Pencil Features

This application is optimized for Apple Pencil and provides:
- **Pressure Sensitivity**: Line thickness varies with pressure
- **Palm Rejection**: Natural writing experience
- **Low Latency**: Responsive drawing with minimal delay
- **Tilt Support**: Enhanced shading (where supported)

## 🔧 Technical Features

### Canvas Drawing Engine
- HTML5 Canvas with optimized performance
- Pointer Events API for enhanced stylus support
- Touch Events with gesture recognition
- Smooth curve interpolation for natural strokes

### Page Flip Animations
- CSS3 transforms for smooth transitions
- 3D perspective effects for realistic book feel
- Touch gesture support for intuitive navigation
- Keyboard and button navigation

### Data Management
- LocalStorage for automatic saving
- JSON serialization for portability
- Export options for different use cases
- Import functionality for restoring sessions

## 🌐 Browser Compatibility

### Recommended Browsers
- **Safari** (iOS/macOS) - Best Apple Pencil support
- **Chrome** (Android/Desktop) - Full feature support
- **Edge** (Windows) - Touch and stylus support
- **Firefox** - Basic functionality

### Device Compatibility
- **iPad** with Apple Pencil (recommended)
- **iPhone** with touch input
- **Android tablets** with stylus support
- **Windows tablets** with pen input
- **Desktop computers** with mouse input

## 📋 Requirements

### Minimum Browser Features
- HTML5 Canvas support
- CSS3 transforms and animations
- JavaScript ES6+ features
- LocalStorage API
- File API for image upload

### Optional Enhancements
- Pointer Events API (for better stylus support)
- Touch Events API (for gesture recognition)
- Web Workers (for background processing)

## 🛠️ Customization

### Styling
Edit `css/styles.css` to customize:
- Color schemes and themes
- Animation timing and effects
- Responsive breakpoints
- Tool layouts

### Functionality  
Modify JavaScript files for:
- Additional drawing tools
- Custom export formats
- Enhanced gestures
- Integration with external services

## 📚 Dependencies

### Core (Included)
- Pure HTML5, CSS3, and JavaScript
- No external dependencies for basic functionality

### Optional Enhancements
- **jsPDF** - for PDF export functionality
- **JSZip** - for bulk image export
- **PDF.js** - for multi-page PDF support

## 🔒 Privacy & Security

- **Client-side only**: No data sent to servers
- **Local storage**: All data stays on the device
- **No tracking**: No analytics or external scripts
- **Offline capable**: Works without internet connection

## 🐛 Troubleshooting

### Common Issues

1. **Apple Pencil not working**
   - Ensure you're using Safari on iOS
   - Check Pencil battery and pairing
   - Try refreshing the page

2. **Drawing feels laggy**
   - Close other browser tabs
   - Ensure device has sufficient battery
   - Try reducing brush size for better performance

3. **Images not uploading**
   - Check file format (JPG, PNG supported)
   - Ensure file size is reasonable (<10MB)
   - Try uploading one image at a time

### Performance Tips
- Use smaller image files when possible
- Clear browser cache if experiencing issues
- Close unnecessary browser tabs
- Ensure device has adequate memory

## 🤝 Contributing

This is an open-source educational project. Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Test thoroughly on multiple devices
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for educational purposes, modify it, and distribute it.

## 🎓 Educational Use

Perfect for:
- **Remote learning** environments
- **Digital classrooms** and tablets
- **Accessibility** needs
- **Paperless** exam solutions
- **Interactive** homework assignments

---

**Built with ❤️ for digital education**