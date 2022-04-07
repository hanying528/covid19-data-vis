import './styles/App.css';
import GeographicCoverage from './components/GeographicCoverage.js';
import HistoricCoverage from './components/HistoricCoverage.js';

function App() {
  const url = "http://127.0.0.1:8088";

  return (
    <div className="App">
      <GeographicCoverage backendUrl={url} />
      <HistoricCoverage backendUrl={url} />
    </div>
  );
}

export default App;
