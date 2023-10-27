import { jxaUtil } from '../src/core/jxa/jxaUtil';
import MacacaMacOS from '../src/macaca-macos';
import assert from 'assert';
import os from 'os';

describe.skip('jxaUtil unit testing', function() {

  it('console arch', async function() {
    this.timeout(0);
    console.log(os.arch());
  });

  it('focusApp should be ok', async () => {
    await jxaUtil.focusApp('Notes');
    const win = await new MacacaMacOS().getAppSizePosition('Notes');
    assert(win);
  });

});
