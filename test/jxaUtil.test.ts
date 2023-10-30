import { jxaUtil } from '../src/core/jxa/jxaUtil';
import MacacaMacOS from '../src/macaca-macos';
import assert from 'assert';

describe.skip('jxaUtil unit testing', function() {

  it('focusApp should be ok', async () => {
    await jxaUtil.focusApp('Notes');
    const win = await new MacacaMacOS().getAppSizePosition('Notes');
    assert(win);
  });

});
