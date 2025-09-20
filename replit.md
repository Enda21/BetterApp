# Be Better Man - Mobile App

## Overview

"Be Better Man" is a React Native mobile application built with Expo that serves as a comprehensive fitness and wellness platform. The app functions as a companion tool for members of a fitness coaching program, providing access to educational courses, nutrition resources, weekly check-ins, and integrations with external fitness platforms like TrueCoach. The app is designed to support men's fitness journeys by centralizing resources, tracking progress, and maintaining engagement with coaching services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7 with bottom tab navigation and stack navigation
- **UI Components**: Native React Native components with custom styling
- **Icons**: Expo Vector Icons (Ionicons, MaterialCommunityIcons, Feather)
- **TypeScript**: Full TypeScript support with strict mode enabled

### Navigation Structure
The app uses a hybrid navigation pattern combining bottom tabs with stack navigation:
- **Bottom Tab Navigator**: Primary navigation with 5 tabs (Home, Courses, External Links, Check In, Nutrition)
- **Stack Navigator**: Nested within Home tab for modal-like screens (ReportIssue)
- **Deep Linking**: Configured for external URL handling and app-to-app communication

### State Management
- **Local State**: React hooks (useState, useEffect) for component-level state
- **Async Storage**: @react-native-async-storage for local data persistence
- **No Global State**: Simple architecture without Redux or Context API

### Data Storage
- **Local Storage**: AsyncStorage for user preferences and cached data
- **File System**: Expo FileSystem for downloading and caching PDF documents
- **Remote Data**: GitHub API integration for dynamic content fetching
- **No Database**: App operates primarily with external APIs and local storage

### External Integrations Architecture
The app integrates with multiple external platforms through custom schemes and web views:
- **TrueCoach Integration**: Deep linking with custom URL schemes and package detection
- **Skool Platform**: Web-based course content delivery through external browser
- **Typeform**: Check-in forms handled via web browser integration
- **GitHub API**: Dynamic PDF content fetching and caching

## External Dependencies

### Core Expo Services
- **Expo Updates**: Over-the-air update delivery system
- **Expo Device**: Device information and hardware detection
- **Expo Linking**: URL scheme handling and deep linking
- **Expo Web Browser**: In-app browser functionality
- **Expo Mail Composer**: Native email composition
- **Expo Image Picker**: Camera and gallery access for issue reporting
- **Expo Sharing**: File sharing capabilities for PDF documents

### Third-Party Platforms
- **TrueCoach**: Fitness coaching platform integration via custom URL schemes
- **Skool**: Educational content platform for course delivery
- **Typeform**: Form platform for weekly check-ins and progress tracking
- **GitHub API**: Content management system for PDF resources

### Build and Distribution
- **EAS Build**: Expo Application Services for native app compilation
- **EAS Submit**: App store submission pipeline
- **EAS Update**: Runtime update distribution
- **Development Build**: Custom development client with native features

### Custom Plugins
- **TrueCoach Queries Plugin**: Custom Expo config plugin for Android package visibility and iOS URL scheme queries
- **Manifest Modifications**: Dynamic Android manifest updates for deep linking support

### HTTP and Networking
- **Axios**: HTTP client for API communications
- **React Native WebView**: Embedded web content rendering
- **Date-fns**: Date manipulation and formatting utilities

The architecture prioritizes simplicity and external platform integration over complex internal data management, making it ideal for a companion app that connects users to existing coaching infrastructure.