#target premierepro

/**
 * ExtendScript host script for Premiere File Browser
 */

function jsonResponse(status, message, data) {
    var response = {
        status: status,
        message: message || '',
        data: data || null
    };
    return "{\"status\":\"" + response.status + "\",\"message\":\"" + (response.message.replace(/\\/g, "\\\\").replace(/"/g, '\\"')) + "\"}";
}

function getFilesInFolder(dirPath) {
    try {
        var clean = dirPath.replace(/\\/g, '/');
        var f = new Folder(clean);
        if (!f.exists) return "[]";
        var files = f.getFiles();
        var arr = [];
        for (var i = 0; i < files.length; i++) {
            var item = files[i];
            var isDir = (item instanceof Folder);
            arr.push({
                name: item.name,
                fsName: item.fsName,
                isDir: isDir,
                length: isDir ? 0 : (item.length || 0)
            });
        }
        return JSON.stringify(arr);
    } catch (e) {
        return "[]";
    }
}

function importFilesToProject(filePathsJson) {
    try {
        if (!app.project) {
            return jsonResponse("error", "No active Premiere project found.");
        }
        
        var paths = [];
        if (typeof filePathsJson === "string") {
            var cleaned = filePathsJson.replace(/^\\[/, '').replace(/\\]$/, '');
            paths = cleaned.split('|||');
        }
        
        if (!paths || paths.length === 0) {
            return jsonResponse("error", "No file paths provided.");
        }
        
        var fileList = [];
        for (var i = 0; i < paths.length; i++) {
            var p = paths[i].replace(/^"|"$/g, '').trim();
            if (p.length > 0) {
                fileList.push(p);
            }
        }
        
        if (fileList.length > 0) {
            var suppressUI = true;
            var targetBin = app.project.getInsertionBin();
            app.project.importFiles(fileList, suppressUI, targetBin, false);
            return jsonResponse("success", "Imported " + fileList.length + " files successfully.");
        }
        
        return jsonResponse("error", "Invalid file list.");
    } catch (e) {
        return jsonResponse("error", "Exception in importFilesToProject: " + e.toString());
    }
}

function insertClipAtPlayhead(filePath, inSecondsStr, outSecondsStr) {
    try {
        if (!app.project) {
            return jsonResponse("error", "No active Premiere project found.");
        }
        
        var seq = app.project.activeSequence;
        if (!seq) {
            return jsonResponse("error", "No active sequence found in timeline.");
        }
        
        var targetFile = new File(filePath);
        if (!targetFile.exists) {
            return jsonResponse("error", "File does not exist: " + filePath);
        }
        
        var suppressUI = true;
        var targetBin = app.project.getInsertionBin();
        app.project.importFiles([filePath], suppressUI, targetBin, false);
        
        var foundItem = null;
        function searchBin(bin) {
            if (!bin || !bin.children) return;
            for (var i = 0; i < bin.children.numItems; i++) {
                var item = bin.children[i];
                if (item.type === ProjectItemType.BIN) {
                    searchBin(item);
                } else if (item.getMediaPath && item.getMediaPath() === filePath) {
                    foundItem = item;
                    return;
                }
            }
        }
        searchBin(app.project.rootItem);
        
        if (!foundItem) {
            return jsonResponse("success", "File imported to project (could not locate item reference for auto-insert).");
        }
        
        var inSec = parseFloat(inSecondsStr);
        var outSec = parseFloat(outSecondsStr);
        if (!isNaN(inSec) && inSec >= 0) {
            foundItem.setInPoint(inSec, 4);
        }
        if (!isNaN(outSec) && outSec > (inSec || 0)) {
            foundItem.setOutPoint(outSec, 4);
        }
        
        var playheadTime = seq.getPlayerPosition();
        var isAudioOnly = (filePath.match(/\\.(mp3|wav|aac|m4a|ogg|flac)$/i) !== null);
        
        if (isAudioOnly) {
            if (seq.audioTracks && seq.audioTracks.numTracks > 0) {
                var targetAudioTrack = seq.audioTracks[0];
                targetAudioTrack.insertClip(foundItem, playheadTime);
                return jsonResponse("success", "Audio clip inserted at playhead (" + playheadTime.seconds + "s)");
            }
        } else {
            if (seq.videoTracks && seq.videoTracks.numTracks > 0) {
                var targetVideoTrack = seq.videoTracks[0];
                targetVideoTrack.insertClip(foundItem, playheadTime);
                return jsonResponse("success", "Clip inserted at playhead (" + playheadTime.seconds + "s)");
            }
        }
        
        return jsonResponse("success", "File imported to project successfully.");
    } catch (e) {
        return jsonResponse("error", "Exception in insertClipAtPlayhead: " + e.toString());
    }
}

function getActiveSequenceInfo() {
    try {
        if (!app.project || !app.project.activeSequence) {
            return jsonResponse("error", "No active sequence.");
        }
        var seq = app.project.activeSequence;
        var pos = seq.getPlayerPosition();
        var info = "Sequence: " + seq.name + " | Playhead: " + pos.seconds.toFixed(2) + "s";
        return jsonResponse("success", info);
    } catch (e) {
        return jsonResponse("error", e.toString());
    }
}
