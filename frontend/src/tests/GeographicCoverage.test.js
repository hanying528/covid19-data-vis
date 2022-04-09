import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { shallow } from 'enzyme';

import GeographicCoverage from "./../components/GeographicCoverage.js";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);

  // Mock fetch 
  const fakeUsaData = [{
    state: "CA",
    people_vaccinated_per_hundred: 80.0
  }, {
      state: "PA",
      people_vaccinated_per_hundred: 70.0
  }];

  const fakeWorldData = [{
      country_name: "United States",
      people_vaccinated_per_hundred: 80.0
    }, {
        country_name: "Canada",
        people_vaccinated_per_hundred: 70.0
    }];

  const makeFetchResponse = value => ({ json: async() => value });
  const mockFetch = jest.fn()
      .mockReturnValueOnce(makeFetchResponse(fakeUsaData))
      .mockReturnValueOnce(makeFetchResponse(fakeWorldData));
  global.fetch = mockFetch;

  let wrapper = shallow(<GeographicCoverage backendUrl="http://localhost:5000" />);

  // await flushPromises();
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockRestore();
});

it("renders correct color for covid usa map", async () => {  
    // Test color code based on vaccination number
    expect(container.querySelector("[data-name='CA']")).getAttribute("fill").toEqual("ff0000");
    expect(container.querySelector("[data-name='PA']")).getAttribute("fill").toEqual("#ffc0cb");
});

it("display correct data when state clicked on usa map", () => {  
    // Click on CA
    var state = document.querySelector("[data-name='CA']");  
    act(() => {
        state.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[id='geographic-coverage-text']").textContent).toBe("CA 80.0%");

    // Click on PA
    state = document.querySelector("[data-name='PA']");  
    act(() => {
        state.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[id='geographic-coverage-text']").textContent).toBe("PA 70.0%");
});

it("renders correct data for covid world map", async () => {
    var expectedWorldData = [{
        country: "US",
        value: 80.0
    }, {
        country: "CA",
        value: 70.0
    }];
    expect(container.instance().getWorldData()).equals(expectedWorldData);
});

it("switches between usa and world maps on toggle", async () => {
    // Before toggle, show usa map
    expect(container.instance().showWorldMap).toBeFalsy();
    expect(document.querySelector("WorldMap")).toBeFalsy();
    expect(document.querySelector("USAMap")).toBeTruthy();

    // Click on geographic-switch
    var toggle = document.querySelector("[id='geographic-switch']");  
    act(() => {
        toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // After toggle, show world map
    expect(container.instance().showWorldMap).toBeTruthy();
    expect(document.querySelector("WorldMap")).toBeTruthy();
    expect(document.querySelector("USAMap")).toBeFalsy();
});
