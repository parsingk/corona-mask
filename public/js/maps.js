const markImageSrc = "http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
const apiUrl = 'https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json';
// ?lat=37.3501761&lng=127.1151262&m=1000

let centerLat = 37.394914;
let centerLng = 127.1100797;
let container = document.getElementById('map');
let options = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(centerLat, centerLng), //지도의 중심좌표.
    level: 5 //지도의 레벨(확대, 축소 정도)
};

let map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

function setCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            centerLat = position.coords.latitude; // 위도
            centerLng = position.coords.longitude; // 경도

            let locPosition = new kakao.maps.LatLng(centerLat, centerLng);
            let query = `?lat=${centerLat}&lng=${centerLng}&m=1000`;

            httpGetAsync(apiUrl + query, displayMarker);
            map.setCenter(locPosition);
        });
    }
}

kakao.maps.event.addListener(map, 'dragend', function() {
    let latlng = map.getCenter();
    centerLat = latlng.getLat();
    centerLng = latlng.getLng();

    let query = `?lat=${centerLat}&lng=${centerLng}&m=1000`;
    httpGetAsync(apiUrl + query, displayMarker);
});

function displayMarker(obj) {
    let stores = obj['stores'];
    stores.forEach(function (store) {
        // if(store.remain_cnt > 0) {
            let imageSize = new kakao.maps.Size(24, 35);
            let markerImage = new kakao.maps.MarkerImage(markImageSrc, imageSize);
            let marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(store.lat, store.lng),
                image : markerImage
            });

            let overlay = new kakao.maps.CustomOverlay({
                position: marker.getPosition()
            });

            let content = getOverlayContent(store, overlay);

            overlay.setContent(content);
            kakao.maps.event.addListener(marker, 'click', function() {
                overlay.setMap(map);
            });
        // }
    });
}

function getOverlayContent(store, overlay) {
    let content = document.createElement('div');
    content.classList.add('wrap');

    let info = document.createElement('div');
    info.classList.add('info');

    let title = document.createElement('div');
    title.classList.add('title');
    title.appendChild(document.createTextNode(store.name));

    let closeBtn = document.createElement('div');
    closeBtn.classList.add('close');
    closeBtn.onclick = function() { overlay.setMap(null); };

    let body = document.createElement('div');
    body.classList.add('body');

    let stock = document.createElement('div');
    stock.appendChild(document.createTextNode(`입고 : ${store.stock_cnt}개`));
    let remain = document.createElement('div');
    remain.appendChild(document.createTextNode(`재고 : ${store.remain_cnt}개`));

    content.appendChild(info);
    info.appendChild(title);
    info.appendChild(body);

    title.appendChild(closeBtn);
    body.appendChild(stock);
    body.appendChild(remain);

    return content;
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