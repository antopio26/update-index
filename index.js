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
    const paragraphRe = /^[^#\n\r]{1,150}[., ]/gm;
    const imgRe = /^!\[[\w\W]*\]\(([\w\W]+) "[\w\W]+"\)/gm;

    added.forEach(_path => {
        var text = fs.readFileSync(_path);

        var _title = titleRe.exec(text)[0].substring(2);
        var _tease = paragraphRe.exec(text)[0];
        var _image = imgRe.exec(text) || [null, null];
        
        edit_index(_path, index => {
            var article = {
                // Images // ID
                path: _path,
                title: _title,
                author: _author,
                timestamp: _timestamp,
                tease: _tease,
                img: _image[1]
                // Add hash to optimize loading or maybe use timestamp
            };

            index.unshift(article);
            return index;
        });
    });

    removed.forEach(_path => {
        edit_index(_path, index => {
            var rem = _.findIndex(index, { path: _path });
            if(rem + 1) {
                _.pullAt(index, [rem]);
                return index;
            } else {
                throw `ERROR REMOVING: ${_path} not found in index`;
            }
        });
    });

    // TODO: flag modified

    modified.forEach(_path => {
        edit_index(_path, index => {
            var edt = _.findIndex(index, { path: _path });

            if(edt + 1) {
                var text = fs.readFileSync(_path);

                var _title = titleRe.exec(text)[0].substring(2);
                var _tease = paragraphRe.exec(text)[0];
                var _image = imgRe.exec(text) || [null, null];

                index[edt].title = _title;
                index[edt].tease = _tease;
                index[edt].image = _image[1];

                return index;
            } else {
                throw `ERROR UPDATING: ${_path} not found in index`;
            }
        });
    }); // HASHING

    // ERROR DELETING UNREGISTERED FILE CAUSES JSON TO GO NULL

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