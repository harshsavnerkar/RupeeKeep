# RupeeKeep - Premium Daily Savings Tracker 💰

RupeeKeep is a high-end, mobile-first web application designed to help you track your daily savings in Rupees. With a focus on motivation and sleek design, it features monthly goal milestones and interactive celebrations to keep you on track.

![RupeeKeep Preview](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Tech-Vite](https://img.shields.io/badge/Tech-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tech-Firebase](https://img.shields.io/badge/Tech-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## ✨ Features

- **🏆 Monthly Goal System**: Set and achieve savings goals in ₹500 increments every month.
- **🎉 Milestone Celebrations**: Experience "crackers and puffs" (confetti) animations whenever you reach a savings goal!
- **📅 Interactive Calendar**: 
  - Browse your savings history across different months and years.
  - View daily saving details with a simple click.
  - Restricted future dates to ensure accurate tracking.
- **🔐 Secure Authentication**: Create your personal account to keep your data isolated and secure.
- **☁️ Cloud Sync**: Integrated with Firebase Firestore to ensure your data is accessible from any device.
- **🎨 Premium UI**: Modern dark-mode aesthetic with glassmorphism, smooth transitions, and Outfit typography.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3
- **Build Tool**: Vite
- **Backend/DB**: Firebase (Firestore & Auth)
- **Icons**: Lucide Icons
- **Animations**: Canvas-Confetti

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- A Firebase project (for cloud storage).

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harshsavnerkar/RupeeKeep.git
   cd RupeeKeep
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Use the template from `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   ...
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/main.js`: Core application logic, goal calculation, and Firebase sync.
- `src/style.css`: Design system and premium styling components.
- `index.html`: Main application structure and SDK integrations.
- `.env`: (Local only) Secure storage for API keys.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements or new features you'd like to see!

## 📝 License

This project is licensed under the MIT License.

---
Built with ❤️ for better financial habits.
