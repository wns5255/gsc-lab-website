// Function to initialize the map
async function initMap() {
    // Initialize Google Maps
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 },
        zoom: 14,
    });

    // Array to store each waterway's path and name
    const waterwayPaths = [];

    // Load and parse each XML file (you can add more XML files as needed)
    const samcheongWays = await parseOSMData("/data/samcheong.xml");
    const baegunWays = await parseOSMData("/data/baekun.xml");
    const hereWays = await parseOSMData("/data/here.xml");

    // Process each XML data and store paths with their respective names
    processWaterway(baegunWays, "백운동천", map, waterwayPaths);
    processWaterway(samcheongWays, "삼청동천", map, waterwayPaths);
    processWaterway(hereWays, "학교", map, waterwayPaths);

    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Add a marker for the user's location
            new google.maps.Marker({
                position: userLocation,
                map,
                title: "내 위치",
            });

            // Check if the user is on any waterway
            waterwayPaths.forEach(waterway => {
                checkIfLocationOnPath(userLocation, waterway.path, waterway.name);
            });
        }, function() {
            alert("현재 위치를 가져오는 데 실패했습니다.");
        });
    }
}

// Function to process each waterway and add it to the map
function processWaterway(ways, name, map, waterwayPaths) {
    ways.forEach(way => {
        const path = way.nodes
            .filter(node => node)
            .map(node => ({ lat: node.lat, lng: node.lon }));

        if (way.tags.waterway === "stream") {
            // Draw the waterway on the map
            new google.maps.Polyline({
                path,
                map,
                strokeColor: "#0000FF",
                strokeOpacity: 0.7,
                strokeWeight: 3,
            });
            // Store the path and name in waterwayPaths array
            waterwayPaths.push({ path, name });
        }
    });
}

// Function to check if the user's location is near a specific path
function checkIfLocationOnPath(location, path, name) {
    const threshold = 0.0008;

    let isOnPath = false;

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(p1.lat, p1.lng),
            new google.maps.LatLng(p2.lat, p2.lng)
        );

        const userDist1 = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(location.lat, location.lng),
            new google.maps.LatLng(p1.lat, p1.lng)
        );
        const userDist2 = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(location.lat, location.lng),
            new google.maps.LatLng(p2.lat, p2.lng)
        );

        if (userDist1 < dist + threshold || userDist2 < dist + threshold) {
            isOnPath = true;
            break;
        }
    }

    if (isOnPath) {
        alert(`내 위치는 ${name} 위에 있습니다.`);
        // window.location.href = `contents.ejs?name=${encodeURIComponent(name)}`; //새로운 화면 불러오기
        window.location.href = '/ply/next/'
    } else {
       alert("내 위치는 파란 선 위에 없습니다.");
    }
}

// Initialize the map on window load
window.onload = initMap;
