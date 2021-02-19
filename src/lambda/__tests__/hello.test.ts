import { helloWorld } from '../helloWorld';

describe('Hello World', () => {
  it('should say hello world', () => {
    expect(helloWorld()).toBe('Hello World');
  });
});
