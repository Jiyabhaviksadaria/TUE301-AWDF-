import React, { useState } from 'react';

function Contact() {
  // Form states (controlled inputs)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // UI visibility state (help tooltip)
  const [showHelp, setShowHelp] = useState(false);
  
  // Submit state
  const [isSubmitted, setIsSubmitted] = useState(false);

  const characterLimit = 200;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate successful form submission
    setIsSubmitted(true);
    
    // Clear inputs
    setName('');
    setEmail('');
    setMessage('');
    
    // Hide notification after 4 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <section id="contact" className="section contact-container">
      <div className="contact-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Contact Me</h2>
        <button 
          className="help-btn"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? 'Hide Tips' : 'Need Help?'}
        </button>
      </div>

      {/* Conditionally rendered UI tip using useState */}
      {showHelp && (
        <div className="info-bubble">
          <strong>💡 Quick Tips:</strong>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
            <li>Please enter a valid email address so I can write back.</li>
            <li>Keep messages concise under 200 characters.</li>
            <li>Alternatively, send an email directly to <u>student@example.com</u>.</li>
          </ul>
        </div>
      )}

      {/* Submission Success Alert */}
      {isSubmitted && (
        <div className="success-alert">
          🎉 Thank you! Your message has been sent successfully. I will get back to you soon!
        </div>
      )}

      <form className="glass-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input 
            type="text" 
            id="name" 
            className="form-input" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Jiya Sadaria" 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input 
            type="email" 
            id="email" 
            className="form-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com" 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">Your Message</label>
          <textarea 
            id="message" 
            className="form-textarea" 
            value={message} 
            onChange={(e) => setMessage(e.target.value.slice(0, characterLimit))}
            placeholder="Write your message here..." 
            maxLength={characterLimit}
            required 
          />
          <div className={`char-counter-row ${message.length >= characterLimit - 20 ? 'warning' : ''}`}>
            <span>Max limit: {characterLimit} characters</span>
            <span>{message.length} / {characterLimit}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={!name || !email || !message}
        >
          Send Message
        </button>
      </form>
    </section>
  );
}

export default Contact;
