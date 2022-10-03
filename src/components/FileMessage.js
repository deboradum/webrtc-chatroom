function FileMessage({ blob, time, fileNameExt }) {
    function saveToDisk(fileUrl) {
        var save = document.createElement('a');
        save.href = fileUrl;
        save.target = '_blank';
        if (fileNameExt) {
            save.download = fileNameExt || fileUrl;
        } else {
            save.download = "file" || fileUrl;
        }
        save.click();
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }

    function download() {
        let reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onload = function (event) {
            let fileDataURL = event.target.result;
            saveToDisk(fileDataURL, 'file');
        };
    }

    return (
        <div className="p-2 my-2 ml-9 max-w-lg w-fit break-words rounded-lg bg-yellow-100 text-base hover:cursor-pointer" onClick={download}><span className="underline">Click to download file, see file extension above.</span><div className="text-xs text-left italic no-underline">{time}</div></div>
    )
};

export default FileMessage;