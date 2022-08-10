import { MacacaMacOS } from '../src/macaca-macos';

const assert = require('power-assert');

describe('unit testing', function() {
  const driver = new MacacaMacOS();

  it('macOS driver should be ok', () => {
    assert(driver);
  });
});
