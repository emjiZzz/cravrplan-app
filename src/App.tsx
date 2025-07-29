// src/App.tsx

import Header from './components/Header/Header'; // Import the Header component

function App() {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <h2>Welcome to CravrPlan!</h2>
        <p>This is where my main content will appear.</p>
      </main>
    </div>
  );
}

export default App;