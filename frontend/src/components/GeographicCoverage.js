import USAMap from 'react-usa-map';
import './../styles/GeographicCoverage.css';


export default function GeographicCoverage(props) {
    function mapHandler(event) {
        alert(event.target.dataset.name);
    };

    function statesCustomConfig() {
        return {
            "NJ": {
                fill: "navy",
                clickHandler: (event) => console.log('Custom handler for NJ', event.target.dataset)
            },
            "NY": {
                fill: "#CC0000"
            }
        };
    };

    return (
        <div>
            <h1>Geographic Coverage</h1>
            <USAMap customize={statesCustomConfig()} onClick={mapHandler} />
        </div>
    );
}