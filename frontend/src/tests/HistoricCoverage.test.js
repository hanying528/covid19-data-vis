import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { act } from "react-dom/test-utils";

import HistoricCoverage from "./../components/HistoricCoverage.js";


configure({ adapter: new Adapter() });

let container = null;
beforeEach(async () => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    fetchData();
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockClear();
  delete global.fetch;
});

async function fetchData() {
    // Mock fetch 
    const fakeDailyData = [{
        date: "2022-01-01",
        avg_vaccination_rate_pct: 10.0
    }, {
        date: "2022-01-02",
        avg_vaccination_rate_pct: 11.0
    }, {
        date: "2022-01-03",
        avg_vaccination_rate_pct: 12.0
    }, {
        date: "2022-01-04",
        avg_vaccination_rate_pct: 13.0
    }];

    const fakeMonthlyData = [{
        year_month: "2022-02",
        avg_vaccination_rate_pct: 30.0
    }, {
        year_month: "2022-03",
        avg_vaccination_rate_pct: 40.0
    }];

    global.fetch = jest.fn()
        .mockImplementation((url) => Promise.resolve({
            json: () => Promise.resolve(url === "http://localhost:5000/covid-usa-hist-daily" ? fakeDailyData : fakeMonthlyData)
        }));

    // Use the asynchronous version of act to apply resolved promises
    await act(async () => {
        render(<HistoricCoverage backendUrl="http://localhost:5000" />, container);
    });
}

it("renders correct data for daily graph", async () => {
    // Hover mouse over each point and check data
    var circles = container.querySelectorAll('circle');
    act(() => {
        circles.forEach((circle, i) => {
            circle.dispatchEvent(new Event("mouseover"));
            if (i == 0) {
                expect(container.querySelector('.tooltip').textContent).toContain("10% on January 1, 2022");
            } else if (i == 1) {
                expect(container.querySelector('.tooltip').textContent).toContain("11% on January 2, 2022");
            } else if (i == 2) {
                expect(container.querySelector('.tooltip').textContent).toContain("12% on January 3, 2022");
            } else if (i == 3) {
                expect(container.querySelector('.tooltip').textContent).toContain("13% on January 4, 2022");
            }
        });
    });
});

it("switches between daily and monthly graphs on toggle", async () => {
    // Before toggle, show daily graph
    var circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(4);

    // Click on geographic-switch
    var toggle = document.querySelector("[id='historic-switch']");  
    act(() => {
        toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // After toggle, show monthly graph
    circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
});

it("renders correct data for monthly graph", async () => {
    // Click on geographic-switch
    var toggle = document.querySelector("[id='historic-switch']");  
    act(() => {
        toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });


    // Hover mouse over each point and check data
    var circles = container.querySelectorAll('circle');
    act(() => {
        circles.forEach((circle, i) => {
            circle.dispatchEvent(new Event("mouseover"));
            if (i == 0) {
                expect(container.querySelector('.tooltip').textContent).toContain("30% on February 2022");
            } else if (i == 1) {
                expect(container.querySelector('.tooltip').textContent).toContain("40% on March 2022");
            }
        });
    });
});

it("zooms on graph", async () => {
    act(() => {
        let rect = container.querySelector('rect');
        rect.dispatchEvent(new MouseEvent('wheel', {
            clientX: 200,
            clientY: 200,
            deltaY: -500
        }));
    });

    // After zoom, less data shows
    let circles = container.querySelectorAll('circle');
    expect(circles.length).toBeLessThan(4);
});
