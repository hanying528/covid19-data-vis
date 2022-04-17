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
  global.fetch = jest.fn()
      .mockImplementation(() => Promise.resolve({
          json: () => Promise.resolve({})
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

it('handles fetch error', async () => {
    // Mock fetch 
    global.fetch = jest.fn()
        .mockImplementation(() => Promise.resolve({}));
  
    // Use the asynchronous version of act to apply resolved promises
    // const consoleSpy = jest.spyOn(global.console, 'log');
    console.log = jest.fn();
    await act(async () => {
        render(<App />, container);
    });
  
    expect(console.log).toHaveBeenCalledTimes(6);
  
    // remove the mock to ensure tests are completely isolated
    global.fetch.mockClear();
    delete global.fetch;
  });
