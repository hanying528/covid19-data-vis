import { useEffect, useState, useRef } from 'react';
import { Form } from 'react-bootstrap';
import * as d3 from 'd3';
import './../styles/OtherCoverage.css';


export default function HistoricCoverage(props) {
    const [raceData, setRaceData] = useState(null);
    const [raceDate, setRaceDate] = useState(null);
    const [ageData, setAgeData] = useState(null);
    const [showAge, setShowAge] = useState(false);
    const ref = useRef();

    useEffect(() => {
        // Request race data
        const requestRace = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-usa-snap-race`, requestRace)
            .then(response => response.json())
            .then(data => {
                setRaceData(data);
                setRaceDate(data[0].date);
            })
            .catch(error => console.log(error));

        // Request age data
        const requestAge = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-usa-snap-age`, requestAge)
            .then(response => response.json())
            .then(data => {
                setAgeData(data);
            })
            .catch(error => console.log(error));
    }, []);

    function _removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    useEffect(() => {
        _removeAllChildNodes(ref.current); // remove current graph
        if(!showAge && raceData){
            createGraph(raceData);
        }else if(showAge && ageData){
            createGraph(ageData);
        }
    }, [raceData, ageData, showAge]);

    function createGraph(data) {
        // Set the dimensions and margins of the graph
        var margin = { top: 20, right: 20, bottom: 50, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        // Append svg object
        let SVG = d3.select(ref.current)
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("class", "chart")
                .attr("transform", `translate(${margin.left},${margin.top})`);


        // Add X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map((s) => showAge ? s.age_group.split('_')[1] : s.race_group.split('_')[2]))
            .padding(0.4)

        let max = 0;
        data.map(s => max = Math.max(s.people_had_does1_per_hundred,max))

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, max+5])
            .range([height, 0]);

        SVG.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        SVG.append('g')
            .call(d3.axisLeft(y));

        const barGroups = SVG.selectAll()
            .data(data)
            .enter()
            .append('g')

        barGroups
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (g) => x(showAge ? g.age_group.split('_')[1] : g.race_group.split('_')[2]))
            .attr('y', (g) => y(g.people_had_does1_per_hundred))
            .attr('height', (g) => height - y(g.people_had_does1_per_hundred))
            .attr('width', x.bandwidth())
    
        barGroups
            .append('text')
            .attr('class', 'value')
            .attr('x', (a) => x(showAge ? a.age_group.split('_')[1] :a.race_group.split('_')[2]) + x.bandwidth() / 2)
            .attr('y', (a) => a.people_had_does1_per_hundred > 5 ? y(a.people_had_does1_per_hundred) + 30 : y(a.people_had_does1_per_hundred)-10)
            .attr('text-anchor', 'middle')
            .attr('fill', (a) => a.people_had_does1_per_hundred > 5 ? 'white' : 'black')
            .text((a) => `${a.people_had_does1_per_hundred}%`)
        
        SVG.append('g')
            .attr('transform', 'translate(-50, ' + height / 2 + ')')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Vaccination Rate (%)');

        SVG.append('text')
            .attr('class', 'label')
            .attr('x', width / 2)
            .attr('y', height + 50)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text(showAge ? 'Age' : 'Race')

    }

    return (
        <div className="race-container">
            <h1>Other Coverage</h1>
            <h5>Vaccination Rate in USA ({raceDate})</h5>
            <div className="switch-wrapper">
                <span>Race</span><Form.Switch
                    id="race-switch"
                    checked={showAge}
                    onChange={() => setShowAge(!showAge)}
                    label="Age"
                />
            </div>
            <div ref={ref} />
        </div>
    )
}
