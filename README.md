# Pushup Alarm App 💪

A smart alarm app that requires you to complete pushups to dismiss alarms, featuring AI-powered pushup detection and real-time form analysis.

## 🚀 Features

### Core Functionality
- ⏰ **Custom Alarms**: Set personalized alarms with specific pushup targets
- 🔐 **Authentication**: Secure user accounts with Supabase Auth
- 📊 **Progress Tracking**: Comprehensive workout history and statistics
- 🎯 **Goal Setting**: Customizable pushup targets for each alarm

### AI-Powered Pushup Detection
- 🤖 **Machine Learning**: Advanced pose estimation using MediaPipe
- 📹 **Real-time Analysis**: Live camera feed with pose detection overlay
- 📐 **Form Analysis**: Monitors elbow angles, body alignment, and range of motion
- ✅ **Accurate Counting**: Intelligent detection of complete pushup movements
- 💬 **Form Feedback**: Real-time coaching to improve pushup technique

### Technical Features
- 🔒 **Row Level Security**: Secure data access with Supabase RLS
- 📱 **Responsive Design**: Works on mobile and desktop
- 🎨 **Modern UI**: Clean interface with Tailwind CSS and shadcn/ui
- ⚡ **Real-time Updates**: Live progress tracking and notifications

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Tanstack Query** for data fetching

### AI & Computer Vision
- **MediaPipe Pose** for pose estimation
- **Advanced pose analysis** algorithms
- **Real-time video processing**
- **Form validation** and movement tracking

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database with RLS
- **Supabase Auth** for authentication
- **Real-time subscriptions**

## 🧠 How the AI Pushup Detection Works

The AI pushup counter uses advanced computer vision and pose estimation to accurately count pushups:

### 1. Pose Estimation
- Uses MediaPipe Pose to detect 33 key body landmarks
- Tracks shoulder, elbow, wrist, hip, and knee positions
- Monitors landmark visibility and confidence scores

### 2. Form Analysis
- **Elbow Angle Calculation**: Monitors arm bending throughout movement
- **Body Alignment**: Ensures proper plank position
- **Range of Motion**: Tracks vertical movement for complete reps
- **Stability Checks**: Validates consistent form across frames

### 3. Movement Detection
- **State Machine**: Tracks UP/DOWN positions with hysteresis
- **Calibration**: Auto-adjusts to user's range of motion
- **Frame Consistency**: Requires multiple consecutive frames for state changes
- **False Positive Prevention**: Advanced filtering to avoid miscounts

### 4. Real-time Feedback
- Visual pose overlay on video feed
- Live form coaching and suggestions
- Progress bars showing range of motion
- Instant validation of pushup completion

## 📱 Usage

### Setting Up Your First Alarm
1. **Sign up/Login** to create your account
2. **Create an alarm** with your desired time and pushup target
3. **Enable the alarm** and wait for it to trigger

### Using the AI Pushup Counter
1. **Grant camera permissions** when prompted
2. **Position yourself** in a plank position facing the camera
3. **Ensure your full body** is visible in the frame
4. **Follow the real-time feedback** for proper form
5. **Complete pushups** - the AI will automatically count valid reps

### Understanding the Feedback
- **Green skeleton**: Good pose detection and form
- **Yellow skeleton**: Pose detected but form needs adjustment
- **Elbow angle display**: Shows arm bend throughout movement
- **Progress bar**: Indicates range of motion completion
- **Position status**: Shows UP/DOWN state detection

---

## Project Info

**Lovable Project URL**: https://lovable.dev/projects/32f3b3be-e0c0-47fb-9d35-9c284204da32

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/32f3b3be-e0c0-47fb-9d35-9c284204da32) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **MediaPipe** - AI pose detection
- **Supabase** - Backend and database

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/32f3b3be-e0c0-47fb-9d35-9c284204da32) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)