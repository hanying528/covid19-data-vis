import { useEffect, useState } from 'react';
import USAMap from 'react-usa-map';
import './../styles/GeographicCoverage.css';


function rgbToHex(r, g, b) {
    const rgb = (r << 16) | (g << 8) | (b << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

export default function GeographicCoverage(props) {
    const [usaData, setUsaData] = useState(null);
    const [maxCase, setMaxCase] = useState(null);
    const [minCase, setMinCase] = useState(null);

    useEffect(() => {
        // Request usa data
        const requestUsa = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-usa-snap`, requestUsa)
            .then(response => response.json())
            .then(data => {
                setUsaData(data);
                
                // set max usa case number
                let total_usa_cases = data.map(datum => datum.total_cases);
                setMaxCase(Math.max.apply(null, total_usa_cases));
                setMinCase(Math.min.apply(null, total_usa_cases));
            })
            .catch(error => console.log(error));
    }, []);

    function _getColorByCaseNum(caseNum) {
        const maxProportion = 1;
        const minProportion = 0.2;
        const proportion = (maxProportion - minProportion) * (caseNum - minCase) / (maxCase - minCase) + minProportion;
        return rgbToHex(255 * proportion, 0, 0);
    }

    function mapHandler(event) {
        const stateData = usaData.filter(datum => datum.state === event.target.dataset.name)[0];
        const display = document.getElementById("geographic-coverage");
        display.textContent = `${stateData.total_cases} total COVID cases in ${stateData.state}`;
    };

    function statesCustomConfig() {
        var config = {}

        if (usaData) {
            for (var i = 0; i < usaData.length; i++) {
                config[usaData[i].state] = { fill: _getColorByCaseNum(usaData[i].total_cases) }
            }
        }

        return config;
    };

    return (
        <div>
            <h1>Geographic Coverage</h1>
            <USAMap customize={statesCustomConfig()} onClick={mapHandler} />
            <p id="geographic-coverage"></p>
        </div>
    );
}