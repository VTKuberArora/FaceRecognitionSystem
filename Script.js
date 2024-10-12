// Get camera feed element
const cameraFeed = document.getElementById('camera-feed');

// Request access to camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        cameraFeed.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing camera:', error);
    });

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login credentials to server for verification
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Login successful, redirect to attendance page
            window.location.href = '/attendance';
        } else {
            // Login failed, display error message
            alert('Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Error logging in:', error);
    });
});

// Handle face recognition
faceapi.load('tiny_face_detector', 'face_landmark_68_tiny', 'face_recognition')
    .then(() => {
        console.log('Face API loaded');

        // Get video feed and detect faces
        const video = document.getElementById('camera-feed');
        const canvas = faceapi.createCanvasFromMedia(video);
        faceapi.detectAllFaces(video, new faceapi.TinyFaceDetector())
            .withFaceLandmarks()
            .withFaceDescriptors()
            .then(detections => {
                console.log('Faces detected:', detections);

                // Extract face descriptors and send to server for recognition
                const faceDescriptors = detections.map(detection => detection.descriptor);
                fetch('/api/recognize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ faceDescriptors })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Recognition result:', data);

                    // Update attendance log
                    const attendanceList = document.getElementById('attendance-list');
                    data.forEach(result => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `Recognized ${result
