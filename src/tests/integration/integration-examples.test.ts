import test from 'ava';
import sinon from 'sinon';
import { processEvents } from '../../index';
import fs from 'fs';
import path from 'path';

const EXAMPLES_LOCATION = 'examples';

let consoleErrorStub;
let consoleLogStub;
let consoleInfoStub;
let consoleWarnStub;
let consoleTimeStub;
let consoleTimeEndStub;
test.beforeEach(() => {
    sinon.restore();
    consoleTimeStub = sinon.stub(console, 'time');
    consoleTimeEndStub = sinon.stub(console, 'timeEnd');
    consoleErrorStub = sinon.stub(console, 'error');
    consoleLogStub = sinon.stub(console, 'log');
    consoleInfoStub = sinon.stub(console, 'info');
    consoleWarnStub = sinon.stub(console, 'warn');
});
test.afterEach(() => {
    sinon.restore();
    consoleErrorStub.restore();
    consoleLogStub.restore();
    consoleInfoStub.restore();
    consoleWarnStub.restore();
    consoleTimeStub.restore();
    consoleTimeEndStub.restore();
});

test('🍏 Integration Tests', t => {
    t.pass();
});

if (process.env.GITHUB_ACTIONS) {
    test.skip('🍏 Integration Tests for examples', t => t.pass());
} else {
    fs.readdirSync(EXAMPLES_LOCATION)
        .filter(file => path.extname(file) === '.yml')
        .forEach(file => {
            test.serial.skip(`🍏 ${file} completes succesfully`, async t => {
                t.timeout(60000);

                try {
                    await processEvents({
                        yml: path.join(EXAMPLES_LOCATION, file),
                    });
                    t.pass();
                } catch (err) {
                    if (err.code === 'UnrecognizedClientException') {
                        t.fail('No credentials');
                    } else {
                        t.fail(err.message);
                    }
                }
            });
        });
}
