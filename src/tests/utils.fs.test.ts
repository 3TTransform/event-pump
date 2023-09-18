import test from 'ava';
import fs from 'fs';
import sinon from 'sinon';
import { createFolderFromPath, blankFileIfExists } from '../utils';

let existsSyncStub;
let mkdirSyncStub;
let writeFileSyncStub;

test.beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync');
    mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
});
test.afterEach(() => {
    existsSyncStub.restore();
    mkdirSyncStub.restore();
    writeFileSyncStub.restore();
});

test.serial(
    '🍏 createFolderFromPath should create the folder if it does not exist',
    t => {
        existsSyncStub.returns(false);
        createFolderFromPath('path/to/file.txt');
        t.true(existsSyncStub.calledOnceWithExactly('path/to'));
        t.true(
            mkdirSyncStub.calledOnceWithExactly('path/to', { recursive: true }),
        );
    },
);
test.serial(
    '🍎 createFolderFromPath should not create the folder if it already exists',
    t => {
        existsSyncStub.returns(true);
        createFolderFromPath('existing/folder/file.txt');
        t.true(existsSyncStub.calledOnceWithExactly('existing/folder'));
        t.true(mkdirSyncStub.notCalled);
    },
);
test.serial(
    '🍎 createFolderFromPath should not create the folder if the filename does not contain any slashes',
    t => {
        createFolderFromPath('filename.txt');
        t.true(existsSyncStub.notCalled);
        t.true(mkdirSyncStub.notCalled);
    },
);
test.serial(
    '🍎 createFolderFromPath should not create the folder if the filename is null',
    t => {
        createFolderFromPath(null);
        t.true(existsSyncStub.notCalled);
        t.true(mkdirSyncStub.notCalled);
    },
);
test.serial(
    '🍎 createFolderFromPath should not create the folder if the filename is undefined',
    t => {
        createFolderFromPath(undefined);
        t.true(existsSyncStub.notCalled);
        t.true(mkdirSyncStub.notCalled);
    },
);
test.serial(
    '🍎 createFolderFromPath should not create the folder if the filename is empty',
    t => {
        createFolderFromPath('');
        t.true(existsSyncStub.notCalled);
        t.true(mkdirSyncStub.notCalled);
    },
);

test.serial(
    '🍏 blankFileIfExists should blank the file and return true if it exists',
    t => {
        const filename = 'path/to/file.txt';
        existsSyncStub.returns(true);
        const result = blankFileIfExists(filename);
        t.true(existsSyncStub.calledOnceWithExactly(filename));
        t.true(writeFileSyncStub.calledOnceWithExactly(filename, ''));
        t.true(result);
    },
);

test.serial(
    '🍎 blankFileIfExists should return false if the file does not exist',
    t => {
        const filename = 'nonexistent/file.txt';
        existsSyncStub.returns(false);
        const result = blankFileIfExists(filename);
        t.true(existsSyncStub.calledOnceWithExactly(filename));
        t.true(writeFileSyncStub.notCalled);
        t.false(result);
    },
);
test.serial(
    '🍎 blankFileIfExists should return false if the filename is null',
    t => {
        const filename = null;
        existsSyncStub.returns(false);
        const result = blankFileIfExists(filename);
        t.true(existsSyncStub.calledOnceWithExactly(filename));
        t.true(writeFileSyncStub.notCalled);
        t.false(result);
    },
);
test.serial(
    '🍎 blankFileIfExists should return false if the filename is undefined',
    t => {
        const filename = undefined;
        existsSyncStub.returns(false);
        const result = blankFileIfExists(filename);
        t.true(existsSyncStub.calledOnceWithExactly(filename));
        t.true(writeFileSyncStub.notCalled);
        t.false(result);
    },
);
test.serial(
    '🍎 blankFileIfExists should return false if the filename is empty',
    t => {
        const filename = '';
        existsSyncStub.returns(false);
        const result = blankFileIfExists(filename);
        t.true(existsSyncStub.calledOnceWithExactly(filename));
        t.true(writeFileSyncStub.notCalled);
        t.false(result);
    },
);
