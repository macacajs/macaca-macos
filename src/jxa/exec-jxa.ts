import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import { Helper } from '../helper';

const shell = require('shelljs');

const executeInOsa = async (code: string, args: any[]): Promise<any> => {
  if (code.includes('Library(')) {
    const myAsLibDir = `${Helper.getResourcePath()}/applescript/*`;
    const libDir = `${os.homedir()}/Library/Script\ Libraries`;
    const libFile = `${libDir}/window.scptd`;
    if (!fs.existsSync(libDir)) {
      shell.mkdir('-p', libDir);
    }
    if (!fs.existsSync(libFile)) {
      shell.cp('-R', myAsLibDir, libDir);
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
