import './styles/App.css';
import GeographicCoverage from './components/GeographicCoverage.js';
import HistoricCoverage from './components/HistoricCoverage.js';
import RaceCoverage from './components/RaceCoverage.js';

function App() {
  // const url = "http://127.0.0.1:8088";
  const url = "http://127.0.0.1:5000";

  return (
    <div className="App">
      <GeographicCoverage backendUrl={url} />
      <HistoricCoverage backendUrl={url} />
      <RaceCoverage backendUrl={url} />
    </div>
  );
}

export default App;
