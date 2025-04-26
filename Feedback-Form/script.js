// FireBase Integration
const firebaseConfig = {
    databaseURL: "https://feedback-form-masai-default-rtdb.firebaseio.com/",
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database().ref('feedbacks');
  
  // Theme Toggle Component
  function ThemeToggle({ theme, setTheme }) {
    function toggleTheme() {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  
    return (
      <button onClick={toggleTheme} className="theme-toggle">
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    );
  }
  
  // Feedback Form Component
  function FeedbackForm({ fetchFeedbacks }) {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [message, setMessage] = React.useState('');
  
    function validateEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
    }
  
    function handleSubmit(e) {
      e.preventDefault();
      if (!name || !email || !comment) {
        setMessage('All fields are required.');
        return;
      }
      if (!validateEmail(email)) {
        setMessage('Invalid email format.');
        return;
      }
  
      const feedback = {
        name,
        email,
        comment,
        timestamp: new Date().toLocaleString(),
      };
  
      db.push(feedback)
        .then(() => {
          setMessage('Feedback submitted successfully!');
          setName('');
          setEmail('');
          setComment('');
          fetchFeedbacks();
          setTimeout(() => setMessage(''), 3000);
        })
        .catch(err => {
          setMessage('Error submitting feedback.');
          console.error(err);
        });
    }
  
    return (
      <form className="feedback-form" onSubmit={handleSubmit}>
        <h2>Submit Feedback</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Comments" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
        <button type="submit">Submit</button>
        {message && <p className="message">{message}</p>}
      </form>
    );
  }
  
  // Feedback Item Component
  function FeedbackItem({ feedback, id, fetchFeedbacks }) {
    function handleDelete() {
      db.child(id).remove()
        .then(fetchFeedbacks)
        .catch(console.error);
    }
  
    return (
      <div className="feedback-card">
        <h3>{feedback.name}</h3>
        <p>{feedback.comment}</p>
        <p><small>{feedback.email}</small></p>
        <p><small>{feedback.timestamp}</small></p>
        <button onClick={handleDelete} className="delete-btn">Delete</button>
      </div>
    );
  }
  
  // Feedback List Component
  function FeedbackList({ feedbacks, fetchFeedbacks }) {
    return (
      <div className="feedback-list">
        {Object.entries(feedbacks).map(([id, feedback]) => (
          <FeedbackItem key={id} id={id} feedback={feedback} fetchFeedbacks={fetchFeedbacks} />
        ))}
      </div>
    );
  }
  
  // App Component
  function App() {
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
    const [feedbacks, setFeedbacks] = React.useState({});
  
    React.useEffect(() => {
      document.body.className = theme;
    }, [theme]);
  
    function fetchFeedbacks() {
      db.once('value', snapshot => {
        setFeedbacks(snapshot.val() || {});
      });
    }
  
    React.useEffect(() => {
      fetchFeedbacks();
    }, []);
  
    return (
      <div className="container">
        <header className="header">
          <h1>Feedback Form</h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>
        <main className="main">
          <FeedbackForm fetchFeedbacks={fetchFeedbacks} />
          <FeedbackList feedbacks={feedbacks} fetchFeedbacks={fetchFeedbacks} />
        </main>
      </div>
    );
  }
  
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  
