import Header from './Header/Header';

function App() {
  return (
    <div>
      {/* We render the Header component here, which will display at the top of our app. */}
      <Header />
      {/* This 'main' section is where the primary content of your pages will go. */}
      <main style={{ padding: '20px' }}>
        <h2>Welcome to CravrPlan!</h2>
        <p>This is where my main content will appear.</p>
      </main>
    </div>
  );
}

export default App;