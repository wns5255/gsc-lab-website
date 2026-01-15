//osm-parser.js
async function parseOSMData(xmlFilePath) {
    const response = await fetch(xmlFilePath);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    // 노드 정보를 저장할 객체와 경로 정보를 담을 배열
    const nodes = {};
    const ways = [];

    // 각 노드를 파싱하여 노드 ID와 좌표 정보 (예: lat, lon)를 저장
    xmlDoc.querySelectorAll("node").forEach(node => {
        const id = node.getAttribute("id");
        const lat = parseFloat(node.getAttribute("lat"));
        const lon = parseFloat(node.getAttribute("lon"));
        nodes[id] = { lat, lon };
    });

    // 각 웨이를 파싱하여 노드 ID 리스트와 태그 정보를 저장
    xmlDoc.querySelectorAll("way").forEach(way => {
        const nodeRefs = [];
        way.querySelectorAll("nd").forEach(nd => {
            nodeRefs.push(nodes[nd.getAttribute("ref")]); // 각 참조 노드 추가
        });

        // 웨이의 태그 정보
        const tags = Array.from(way.querySelectorAll("tag")).reduce((acc, tag) => {
            acc[tag.getAttribute("k")] = tag.getAttribute("v");
            return acc;
        }, {});

        ways.push({ nodes: nodeRefs, tags });
    });

    return ways;
}