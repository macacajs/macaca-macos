import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import { Helper } from '../helper';

const shell = require('shelljs');

const executeInOsa = async (code: string, args: any[]): Promise<any> => {
  // 检查并更新lib
  if (code.includes('Library(')) {
    const scptdDir = `${Helper.getResourcePath()}/applescript/scptd/*`;
    const userLibDir = `${os.homedir()}/Library/Script\ Libraries`;
    const versionFile = `${userLibDir}/macaca-macos.txt`;
    const version = Helper.getPkgVersion();
    if (!fs.existsSync(userLibDir)) {
      shell.mkdir('-p', userLibDir);
    }
    if (fs.existsSync(versionFile)) {
      const userVersion = fs.readFileSync(versionFile, 'utf-8').toString().trim();
      if (userVersion !== version) {
        shell.cp('-R', scptdDir, userLibDir);
        shell.rm('-rf', versionFile);
        fs.writeFileSync(versionFile, version);
      }
    } else {
      shell.cp('-R', scptdDir, userLibDir);
      fs.writeFileSync(versionFile, version);
    }
  }
  const envs: any = {
    OSA_ARGS: JSON.stringify(args),
  };
  return new Promise((resolve, reject) => {
    const child = execFile(
      '/usr/bin/osascript',
      [ '-l', 'JavaScript' ],
      {
        env: envs,
        maxBuffer: 1E8,
      },
      (err: Error, stdout: any, stderr: any) => {
        if (err) {
          return reject(err);
        }
        if (stderr) {
          console.error(stderr);
        }

        if (!stdout) {
          resolve(undefined);
        }

        try {
          const result = JSON.parse(stdout.toString().trim()).result;
          resolve(result);
        } catch (errorOutput) {
          resolve(stdout.toString().trim());
        }
      },
    );
    child.stdin.write(code);
    child.stdin.end();
  });
};

const requireFunc = `
ObjC.import('Foundation');
var fm = $.NSFileManager.defaultManager;
var requireHack = function (path) {
    var contents = fm.contentsAtPath(path.toString()); // NSData
    contents = $.NSString.alloc.initWithDataEncoding(contents, $.NSUTF8StringEncoding);

    var module = {exports: {}};
    var exports = module.exports;
    eval(ObjC.unwrap(contents));

    return module.exports;
};
`;

export const execJxa = async (jxaCodeFunction: (...args: any[]) => void, args: any[] = []) => {
  const code = `
ObjC.import('stdlib');
${requireFunc}
var args = JSON.parse($.getenv('OSA_ARGS'));
var fn   = (${jxaCodeFunction.toString()});
var out  = fn.apply(null, args);
JSON.stringify({ result: out });
`;
  return executeInOsa(code, args).catch(e => {
    console.warn(e.message);
  });
};
