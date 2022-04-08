import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import USAMap from 'react-usa-map';
import WorldMap from 'react-svg-worldmap';
import './../styles/GeographicCoverage.css';

const { overwrite, getCode } = require('country-list');
overwrite([{
    code: 'US',
    name: 'United States'
}, {
    code: 'KR',
    name: 'South Korea'
}, {
    code: 'TW',
    name: 'Taiwan'
}, {
    code: 'GB',
    name: 'United Kingdom'
}, {
    code: 'CD',
    name: 'Democratic Republic of Congo'
}, {
    code: 'TZ',
    name: 'Tanzania'
}, {
    code: 'IR',
    name: 'Iran'
}, {
    code: 'VN',
    name: 'Vietnam'
}, {
    code: 'LA',
    name: 'Laos'
}, {
    code: 'RU',
    name: 'Russia'
}, {
    code: 'BO',
    name: 'Bolivia'
}, {
    code: 'VE',
    name: 'Venezuela'
}, {
    code: 'RS',
    name: 'Serbia'
}, {
    code: 'BN',
    name: 'Brunei'
}, {
    code: "CV",
    name: "Cape Verde"
}, {
    code: "CI",
    name: "Cote d'Ivoire"
}, {
    code: "CW",
    name: "Curacao"
}, {
    code: "BQ",
    name: "Bonaire Sint Eustatius and Saba"
}, {
    code: "VG",
    name: "British Virgin Islands"
}, {
    code: "FK",
    name: "Falkland Islands"
}, {
    code: "FM",
    name: "Micronesia (country)"
}, {
    code: "MD",
    name: "Moldova"
}, {
    code: "PS",
    name: "Palestine"
}, {
    code: "SH",
    name: "Saint Helena"
}, {
    code: "SY",
    name: "Syria"
}, {
    code: "TL",
    name: "Timor"
}, {
    code: "VA",
    name: "Vatican"
}])

function rgbToHex(r, g, b) {
    const rgb = (r << 16) | (g << 8) | (b << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

export default function GeographicCoverage(props) {
    const [usaData, setUsaData] = useState(null);
    const [worldData, setWorldData] = useState(null);
    const [maxCase, setMaxCase] = useState(null);
    const [minCase, setMinCase] = useState(null);
    const [showWorldMap, setShowWorldMap] = useState(false);

    useEffect(() => {
        // Request usa data
        const requestUsa = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-usa-snap`, requestUsa)
            .then(response => response.json())
            .then(data => {
                setUsaData(data);
                
                // set max and min case number
                let total_usa_cases = data.map(datum => datum.people_vaccinated_per_hundred);
                setMaxCase(Math.max.apply(null, total_usa_cases));
                setMinCase(Math.min.apply(null, total_usa_cases));
            })
            .catch(error => console.log(error));

        // Request world data
        const requestWorld = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-world-snap`, requestWorld)
            .then(response => response.json())
            .then(data => {
                setWorldData(data);
            })
            .catch(error => console.log(error));
    }, []);

    function _getColorByCaseNum(caseNum) {
        const maxProportion = 1;
        const minProportion = 0;
        const proportion = (maxProportion - minProportion) * (caseNum - minCase) / (maxCase - minCase) + minProportion;
        return rgbToHex(255, 192 * (1 - proportion), 203 * (1 - proportion));
    }

    function mapHandler(event) {
        const stateData = usaData.filter(datum => datum.state === event.target.dataset.name)[0];
        const display = document.getElementById("geographic-coverage-text");
        display.textContent = `${stateData.state} ${stateData.people_vaccinated_per_hundred}%`;
    };

    function getStatesCustomConfig() {
        var config = {};
        if (usaData) {
            for (var i = 0; i < usaData.length; i++) {
                config[usaData[i].state] = { fill: _getColorByCaseNum(usaData[i].people_vaccinated_per_hundred) }
            }
        }
        return config;
    };

    function getWorldData() {
        var data = [];
        if (worldData) {
            for (var i = 0; i < worldData.length; i++) {
                let countryCode = getCode(worldData[i].country_name);
                if (countryCode) {
                    data.push({country: countryCode, value: worldData[i].people_vaccinated_per_hundred });
                }
            }
        }
        return data;
    };

    return (
        <div className="geographic-container">
            <h1>Geographic Coverage</h1>
            <h5>Vaccination Rate</h5>
            <div className="switch-wrapper">
                <span>USA</span><Form.Switch 
                    id="geographic-switch"
                    checked={showWorldMap}
                    onChange={() => setShowWorldMap(!showWorldMap)}
                    label="World"
                />
            </div>
            { 
                showWorldMap ?
                <WorldMap
                    color="red"
                    valueSuffix="%"
                    size="xxl"
                    data={getWorldData()}
                /> :
                <div className="usa-map">
                    <p id="geographic-coverage-text">Click on a state.</p> 
                    <USAMap customize={getStatesCustomConfig()} onClick={mapHandler} />
                </div>
            }     
        </div>
    );
}