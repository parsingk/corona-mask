const greenMarker = "/img/greenMarker.png";
const yellowMarker = "/img/yellowMarker.png";
const redMarker = "/img/redMarker.png";
const greyMarker = "/img/greyMarker.png";

const green = 'lawngreen';
const yellow = '#ffc400';
const red = 'red';
const grey = 'grey';

const apiUrl = 'https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json';
const range = '1000';

let centerLat = 37.394914;
let centerLng = 127.1100797;
let container = document.getElementById('map');
let options = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(centerLat, centerLng), //지도의 중심좌표.
    level: 5 //지도의 레벨(확대, 축소 정도)
};

let map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
let markers = [];

function setCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            centerLat = position.coords.latitude; // 위도
            centerLng = position.coords.longitude; // 경도

            let locPosition = new kakao.maps.LatLng(centerLat, centerLng);
            // let query = `?lat=${centerLat}&lng=${centerLng}&m=1000`;
            let query = '?lat=' + centerLat + '&lng=' + centerLng + '&m=' + range;

            httpGetAsync(apiUrl + query, displayMarker);
            map.setCenter(locPosition);
        });
    }
}

kakao.maps.event.addListener(map, 'dragend', function() {
    let latlng = map.getCenter();
    centerLat = latlng.getLat();
    centerLng = latlng.getLng();

    // let query = `?lat=${centerLat}&lng=${centerLng}&m=1000`;
    let query = '?lat=' + centerLat + '&lng=' + centerLng + '&m=' + range;
    httpGetAsync(apiUrl + query, displayMarker);
});

function isMarkerOnMap(lat, lng, arr = []) {
    let find = arr.find(o => o.lat == lat && o.lng == lng);
    if(find !== undefined) {
        lng = lng + 0.000065;
        return isMarkerOnMap(lat, lng, arr);
    }

    return parseFloat(lng.toFixed(7));
}

function displayMarker(obj) {
    let stores = obj['stores'];
    let latLngArray = [];
    let lat = null;
    let lng = null;

    markers.forEach(function (m) {
        m.setMap(null);
    });

    markers = [];

    stores.forEach(function (store) {
        lat = store.lat;
        lng = store.lng;
        lng = isMarkerOnMap(lat, lng, latLngArray);

        let markerPath = getMarker(store.remain_stat);
        let imageSize = new kakao.maps.Size(24, 35);
        let markerImage = new kakao.maps.MarkerImage(markerPath, imageSize);
        let marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(lat, lng),
            image : markerImage
        });

        let overlay = new kakao.maps.CustomOverlay({
            position: marker.getPosition()
        });

        let content = getOverlayContent(store, overlay);
        overlay.setContent(content);

        latLngArray.push({
            lat : lat,
            lng : lng
        });
        markers.push(marker);
        kakao.maps.event.addListener(marker, 'click', function() {
            overlay.setMap(map);
        });
    });
}

function getColor(str) {
    switch (str) {
        case 'plenty' :
            return green;
        case 'some' :
            return yellow;
        case 'few' :
            return red;
        case 'empty' :
        default :
            return grey;
    }
}

function getMarker(str) {
    switch (str) {
        case 'plenty' :
            return greenMarker;
        case 'some' :
            return yellowMarker;
        case 'few' :
            return redMarker;
        case 'empty' :
        default :
            return greyMarker;
    }
}

function getOverlayContent(store, overlay) {
    let content = document.createElement('div');
    content.classList.add('wrap');

    let info = document.createElement('div');
    info.classList.add('info');

    let title = document.createElement('div');
    let color = getColor(store.remain_stat);
    title.classList.add('title');
    title.style.backgroundColor = color;
    title.style.color = color === grey || color === red ? 'white' : 'black';
    title.appendChild(document.createTextNode(store.name));

    let closeBtn = document.createElement('div');
    closeBtn.classList.add('close');
    closeBtn.onclick = function() { overlay.setMap(null); };

    let body = document.createElement('div');
    body.classList.add('body');
    body.appendChild(document.createTextNode('입고 시간 : ' + getStockAt(store.stock_at)));

    content.appendChild(info);
    info.appendChild(title);
    info.appendChild(body);

    title.appendChild(closeBtn);

    return content;
}

function getStockAt(stockAt) {
    if(stockAt == null || stockAt == 'null' || stockAt === undefined)
        return '입고 대기';

    return stockAt;
}

function httpGet(theUrl)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send();

    return JSON.parse(xmlHttp.responseText);
}

function httpGetAsync(theUrl, callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();
}

document.addEventListener("DOMContentLoaded", function(event) {
    setCurrentPosition();
});