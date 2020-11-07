const core = require('@actions/core');
const github = require('@actions/github');

try {
    const path = core.getInput('path');
    const payload = github.context.payload;
    const commit = payload.commits[0];
    const author = commit.author.name;
    const timestamp = commit.timestamp;

    console.log(`Author name: ${author}`)
    console.log(`Date: ${timestamp}`)
    console.log(`Files: ${path}`)
} catch (error) {
    core.setFailed(error.message);
}