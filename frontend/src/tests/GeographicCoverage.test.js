import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { act } from "react-dom/test-utils";

import GeographicCoverage from "./../components/GeographicCoverage.js";


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
    const fakeUsaData = [{
        state: "CA",
        people_vaccinated_per_hundred: 80.0
    }, {
        state: "PA",
        people_vaccinated_per_hundred: 70.0
    }];

    const fakeWorldData = [{
        country_name: "China",
        people_vaccinated_per_hundred: 80.0
    }, {
        country_name: "Canada",
        people_vaccinated_per_hundred: 70.0
    }];

    global.fetch = jest.fn()
        .mockImplementation((url) => Promise.resolve({
            json: () => Promise.resolve(url === "http://localhost:5000/covid-usa-snap" ? fakeUsaData : fakeWorldData)
        }));

    // Use the asynchronous version of act to apply resolved promises
    await act(async () => {
        render(<GeographicCoverage backendUrl="http://localhost:5000" />, container);
    });
}

it("renders correct color for covid usa map", async () => {  
    // Test color code based on vaccination number
    expect(container.querySelector("[data-name='CA']").getAttribute("fill")).toEqual("#ff0000");
    expect(container.querySelector("[data-name='PA']").getAttribute("fill")).toEqual("#ffc0cb");
});

it("display correct data when state clicked on usa map", async () => {  
    // Click on CA
    var state = document.querySelector("[data-name='CA']");  
    act(() => {
        state.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[id='geographic-coverage-text']").textContent).toBe("CA 80%");

    // Click on PA
    state = document.querySelector("[data-name='PA']");  
    act(() => {
        state.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[id='geographic-coverage-text']").textContent).toBe("PA 70%");
});

it("switches between usa and world maps on toggle", async () => {
    // Before toggle, show usa map
    expect(container.querySelector('.usa-map')).toBeTruthy();
    expect(container.querySelector('.worldmap__figure-container')).toBeFalsy();

    // Click on geographic-switch
    var toggle = document.querySelector("[id='geographic-switch']");  
    act(() => {
        toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // After toggle, show world map
    expect(container.querySelector('.usa-map')).toBeFalsy();
    expect(container.querySelector('.worldmap__figure-container')).toBeTruthy();
});

it("renders correct data for covid world map", async () => {
    // Click on geographic-switch to show world map
    var toggle = document.querySelector("[id='geographic-switch']");  
    act(() => {
        toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Verify that only two countries are colored
    let paths = container.querySelectorAll('path');
    var totalColoredCountry = 0;
    const attr = "fill-opacity: ";
    for (var i=0; i < paths.length; i++) {
        let index = paths[i].getAttribute("style").indexOf(attr);
        let opacity = paths[i].getAttribute("style").substring(index + attr.length, index + attr.length + 3);
        if (opacity.charAt(1) !== ';') {
            totalColoredCountry++;
        }
    }
    expect(totalColoredCountry).toBe(2);
});
