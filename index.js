const core = require('@actions/core');
const github = require('@actions/github');

try {
    const path = core.getInput('path');
    const payload = github.context.payload;
    console.log(`Event Payload: ${JSON.stringify(payload, undefined, 2)}`)
} catch (error) {
    core.setFailed(error.message);
}