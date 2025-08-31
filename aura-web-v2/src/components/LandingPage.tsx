import { useState, useEffect } from 'react';
import { LoginModal } from './auth/LoginModal';
import { RegisterModal } from './auth/RegisterModal';
import './LandingPage.css';

const AuraAsciiLogo = () => (
  <pre className="aura-ascii-logo">
    {`
    █████╗ ██╗   ██╗██████╗  █████╗
   ██╔══██╗██║   ██║██╔══██╗██╔══██╗
   ███████║██║   ██║██████╔╝███████║
   ██╔══██║██║   ██║██╔══██╗██╔══██║
   ██║  ██║╚██████╔╝██║  ██║██║  ██║
   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
    `}
  </pre>
);

const TAGLINES = [
  "Stop fixing trivial bugs.",
  "Build with architectural integrity.",
  "Delegate the details.",
  "Ship features, not fixes."
];
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_DURATION = 2000;

export const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // State for the typing animation
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const currentTagline = TAGLINES[taglineIndex];

      // Determine if we are typing or deleting
      if (isDeleting) {
        // Deleting logic
        setDisplayedText(currentTagline.substring(0, displayedText.length - 1));
      } else {
        // Typing logic
        setDisplayedText(currentTagline.substring(0, displayedText.length + 1));
      }

      // Logic to switch between typing, pausing, and deleting
      if (!isDeleting && displayedText === currentTagline) {
        // Pause at the end of typing
        setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
      } else if (isDeleting && displayedText === '') {
        // Move to the next tagline after deleting
        setIsDeleting(false);
        setTaglineIndex((prevIndex) => (prevIndex + 1) % TAGLINES.length);
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);

    // Cleanup timeout on component unmount or re-render
    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, taglineIndex]);


  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-nav">
          <span className="landing-brand">AURA</span>
          <div className="landing-nav-right">
            <button
              className="landing-nav-button"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-logo">
          <AuraAsciiLogo />
          <p className="hero-tagline">A U T O N O M O U S  V I R T U A L  M A C H I N E</p>
        </div>

        <div className="hero-content">
          <h2 className="hero-headline">
            {displayedText}<span className="cursor">|</span>
          </h2>

          <p className="hero-description">
            AI code generators create impressive snippets, but fail at building real-world software.
            They lack architectural integrity, can't test their own work, and are unable to self-correct.
            <strong> Aura is different.</strong>
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">&gt;&gt; Architectural Integrity</h3>
              <p className="feature-description">
                Aura acts as a Senior Software Architect, not just a coder. It
                designs projects with a clean, modular structure, avoiding
                the monolithic "God files" that plague simple AI wrappers and
                ensuring your codebase is maintainable from day one.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">&gt;&gt; Advanced Tool-Based Execution</h3>
              <p className="feature-description">
                Instead of relying on vague prompts, Aura uses a powerful
                "Foundry" of precise, deterministic tools. This reduces errors,
                lowers API costs, and ensures higher quality code by using the
                right tool for every job—from writing a file to surgically
                modifying your codebase.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">&gt;&gt; Transparent Agentic Planning</h3>
              <p className="feature-description">
                Aura deconstructs your high-level goal into a detailed, step-by-step
                mission plan that you can see and approve. You have full transparency
                into the AI's strategy before the first line of code is written.
              </p>
            </div>
          </div>

          <div className="hero-cta">
            <button
              className="launch-button"
              onClick={() => setShowRegisterModal(true)}
            >
              LAUNCH AURA
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};