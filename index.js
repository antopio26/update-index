const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');

try {
    const paths = JSON.parse(core.getInput('paths'));
    const payload = github.context.payload;
    const commit = payload.commits[0];
    const author = commit.author.name;
    const timestamp = commit.timestamp;

    var index_path = path.join(path.dirname(paths[0]), 'index.json');
    var index = fs.readFileSync(index_path);

    console.log(`Author name: ${author}`)
    console.log(`Date: ${timestamp}`)
    console.log(`Files: ${path}`)
    console.log(`Index content: ${index}`)
} catch (error) {
    core.setFailed(error.message);
}