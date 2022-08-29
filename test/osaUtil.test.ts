import { osaUtil } from '../src/core/jxa/osaUtil';
import MacacaMacOS from '../src/macaca-macos';
import assert from 'power-assert';

describe('osaUtil unit testing', function() {

  it('getAllAppSizePosition should be ok', async () => {
    const res = await osaUtil.getAllAppSizePosition();
    console.log(res);
    assert(res);
  });

  it('focusApp should be ok', async () => {
    await osaUtil.focusApp('Notes');
    const win = await new MacacaMacOS().getAppSizePosition('Notes');
    console.log(win);
    assert(win);
  });

});
