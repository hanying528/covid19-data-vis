import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './../styles/HistoricCoverage.css';


export default function HistoricCoverage(props) {
    const [dailyData, setDailyData] = useState(null);
    const ref = useRef();

    useEffect(() => {
        // Request daily data
        const requestDaily = {
            method: 'GET',
        };
        fetch(`${props.backendUrl}/covid-usa-hist-daily`, requestDaily)
            .then(response => response.json())
            .then(data => {
                // Parse date time
                let parseTime = d3.timeParse("%Y-%m-%d");
                data.forEach(datum => {
                    datum.date = parseTime(datum.date)
                });
                setDailyData(data);
            })
            .catch(error => console.log(error));
    }, []);

    useEffect(() => {
        if (dailyData) {
            createGraph(dailyData);
        }
    }, [dailyData]);

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
        var x = d3.scaleTime()
            .domain(d3.extent(data, datum => datum.date))
            .range([0, width]);
        var xAxis = SVG.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        var yAxis = SVG.append("g")
            .call(d3.axisLeft(y));
        
        SVG.append('g')
            .attr('transform', 'translate(-50, ' + height / 2 + ')')
            .append('text')
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .style('font-family', 'Helvetica')
            .style('font-size', 12)
            .text('Vaccination Rate (%)');

        // Add a clipPath
        var clip = SVG.append("defs")
            .append("SVG:clipPath")
                .attr("id", "clip")
            .append("SVG:rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

        var scatter = SVG.append('g')
            .attr("clip-path", "url(#clip)");

        // Add the line
        var line = d3.line()
                     .x(datum => x(datum.date))
                     .y(datum => y(datum.avg_vaccination_rate_pct));

        var path = SVG.append("path")
            .data([data])
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add the points
        scatter.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", datum => x(datum.date))
                .attr("cy", datum => y(datum.avg_vaccination_rate_pct))
                .attr("r", 3)
                .attr("fill", "#69b3a2");

        // Set zoom and pan
        var zoom = d3.zoom().scaleExtent([1, 5])
            .extent([[0, 0], [width, height]])
            .on("zoom", updateGraph);

        SVG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .call(zoom);

        function updateGraph(event) {
            // Get new scale
            var newX = event.transform.rescaleX(x);
            var newY = event.transform.rescaleY(y);

            // Update axes
            xAxis.call(d3.axisBottom(newX))
            yAxis.call(d3.axisLeft(newY))

            // Update the points
            scatter.selectAll("circle")
                .attr('cx', datum => newX(datum.date))
                .attr('cy', datum => newY(datum.avg_vaccination_rate_pct));

            // Update the line
            var line = d3.line()
                .x(datum => newX(datum.date))
                .y(datum => newY(datum.avg_vaccination_rate_pct));

            path.attr("d", line);    
        }
    }

    return (
        <div className="historic-container">
            <h1>Historic Coverage</h1>
            <div ref={ref} />
        </div>
    )
}
