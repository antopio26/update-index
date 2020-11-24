const core = require('@actions/core');
const github = require('@actions/github');

const _ = require('lodash');
const path = require('path');
const fs = require('fs');

var indices = [];

try {
    const added = JSON.parse(core.getInput('added'));
    const removed = JSON.parse(core.getInput('removed'));
    const modified = JSON.parse(core.getInput('modified'));

    const commit = github.context.payload.commits[0];
    const _author = commit.author.name;
    const _timestamp = commit.timestamp;

    const titleRe = /^# [^\n\r\[\]]+/gm;
    const paragraphRe = /^[^#\n\r]{1,200} /gm;

    added.forEach(_path => {
        var text = fs.readFileSync(_path);

        var _title = titleRe.exec(text)[0].substring(2);
        var _tease = paragraphRe.exec(text)[0];
        
        edit_index(_path, index => {
            var article = {
                // Images
                path: _path,
                title: _title,
                author: _author,
                timestamp: new Date(_timestamp),
                tease: _tease
                // Add hash to optimize loading or maybe use timestamp
            };

            index.push(article);
            return index;
        });
    });

    removed.forEach(_path => {
        edit_index(_path, index => {
            var rem = _.findIndex(index, { path: _path });
            if(rem + 1) {
                _.pullAt(index, [rem]);
            }
            return index;
        });
    });

    // TODO: MODIFY TITLE, TIMESTAM, TEASE

    /*edited.forEach(_path => {
        edit_index(_path, index => {

        });
    });*/ // HASHING

    // ERROR DELETING UNREGISTERED FILE CAUSES JSON TO GO NULL

    console.log(indices[0].data);

    indices.forEach(index => {
        fs.writeFileSync(index.path, JSON.stringify(index.data));
    });

} catch (error) {
    core.setFailed(error.message);
}

function edit_index(file_path, callback){
    var index;
    var index_path = path.join(path.dirname(file_path), 'index.json');

    var search = _.findIndex(indices, { 'path': index_path }); 
    if (search + 1) {
        index = indices[search].data;
    } else {
        index = JSON.parse(fs.readFileSync(index_path));
    }

    index = callback(index);

    if (search + 1) {
        indices[search].data = index;
    } else {
        indices.push({ path: index_path, data: index });
    }
}