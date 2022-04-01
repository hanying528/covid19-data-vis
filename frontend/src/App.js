import './styles/App.css';
import GeographicCoverage from './components/GeographicCoverage.js';
import HistoricCoverage from './components/HistoricCoverage.js';

function App() {
  return (
    <div className="App">
      <GeographicCoverage />
      <HistoricCoverage />
    </div>
  );
}

export default App;
