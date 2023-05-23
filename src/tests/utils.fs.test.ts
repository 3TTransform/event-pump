import test from 'ava';
import fs from 'fs';
import sinon from 'sinon';
import { createFolderFromPath, blankFileIfExists } from '../utils';

test.serial('🍏 createFolderFromPath should create the folder if it does not exist', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('path/to/file.txt');

  t.true(existsSyncStub.calledOnceWithExactly('path/to'));
  t.true(mkdirSyncStub.calledOnceWithExactly('path/to', { recursive: true }));

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if it already exists', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('existing/folder/file.txt');

  t.true(existsSyncStub.calledOnceWithExactly('existing/folder'));
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename does not contain any slashes', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('filename.txt');

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is null', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath(null);

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is undefined', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath(undefined);

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});
test.serial('🍎 createFolderFromPath should not create the folder if the filename is empty', (t) => {
  const existsSyncStub = sinon.stub(fs, 'existsSync');
  const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');

  createFolderFromPath('');

  t.true(existsSyncStub.notCalled);
  t.true(mkdirSyncStub.notCalled);

  existsSyncStub.restore();
  mkdirSyncStub.restore();
});

test.serial('🍏 blankFileIfExists should blank the file and return true if it exists', (t) => {
  const filename = 'path/to/file.txt';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.calledOnceWithExactly(filename, ''));
  t.true(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the file does not exist', (t) => {
  const filename = 'nonexistent/file.txt';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});

test.serial('🍎 blankFileIfExists should return false if the filename is null', (t) => {
  const filename = null;
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the filename is undefined', (t) => {
  const filename = undefined;
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});
test.serial('🍎 blankFileIfExists should return false if the filename is empty', (t) => {
  const filename = '';
  const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

  const result = blankFileIfExists(filename);

  t.true(existsSyncStub.calledOnceWithExactly(filename));
  t.true(writeFileSyncStub.notCalled);
  t.false(result);

  existsSyncStub.restore();
  writeFileSyncStub.restore();
});