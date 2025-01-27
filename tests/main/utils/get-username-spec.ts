import { getUsername } from '../../../src/main/utils/get-username';

jest.mock('os', () => ({
  userInfo: () => ({
    username: 'test-user',
  }),
}));

describe('get-username', () => {
  it('returns the OS username', () => {
    expect(getUsername()).toBe('test-user');
  });
});
