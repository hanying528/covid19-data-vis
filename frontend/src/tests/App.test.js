import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import App from './../App.js';
import { act } from "react-dom/test-utils";


let container = null;
beforeEach(async () => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('renders home page', async () => {
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
      render(<App />, container);
  });

  expect(container.querySelectorAll('.geographic-container')).toBeTruthy();
  expect(container.querySelectorAll('.historic-container')).toBeTruthy();
  expect(container.querySelectorAll('.race-container')).toBeTruthy();

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockClear();
  delete global.fetch;
});
