function onOpenCvReady() {
    console.log('OpenCV.js is ready');

    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasOutput');
    const ctx = canvas.getContext('2d');

    // Get access to the camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.srcObject = stream;
            video.play();
        }).catch(function(err) {
            console.error("Error accessing the camera: " + err);
        });
    } else {
        console.error("getUserMedia not supported in this browser.");
    }

    // Define the ArUco dictionary and detector parameters
    const arucoDict = new cv.Dictionary(cv.DICT_6X6_250);
    const detectorParams = new cv.DetectorParameters();

    video.addEventListener('play', () => {
        const fps = 30;
        function processVideo() {
            if (video.paused || video.ended) {
                return;
            }

            let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
            let gray = new cv.Mat();
            let markers = new cv.MatVector();
            let ids = new cv.Mat();
            let rejected = new cv.MatVector();

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            src.data.set(imageData.data);

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            cv.detectMarkers(gray, arucoDict, markers, ids, detectorParams, rejected);

            if (ids.rows > 0) {
                cv.drawDetectedMarkers(src, markers, ids);
            }

            cv.imshow('canvasOutput', src);

            src.delete();
            gray.delete();
            markers.delete();
            ids.delete();
            rejected.delete();

            setTimeout(processVideo, 1000 / fps);
        }
        processVideo();
    });
}
