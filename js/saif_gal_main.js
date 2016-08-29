var currentYPos = null;


var locationData = {
  nearestBranch : null,
  userCoordinates : null,
  showNearBranch : function () {
    var branch = document.querySelector('[data-coordinates="'+this.nearestBranch[2]+'"]');
    alert(branch.children[0].innerHTML);
  },
  getHandler : function() {
    var ele = document.querySelector(".nearestBranchHandler");
    ele.addEventListener("click", function() {
      locationData.getUserPosition();
    });
  },
  coordinates : [],
  getUserPosition : function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.successCallBack, this.errorCallBack, {enableHighAccuracy: true});
    }
  },
  errorCallBack : function() {
    alert("Sorry, no position available.");
  },
  successCallBack : function (position){
    locationData.calculateNearestBranch(position, locationData.coordinates);
  },
  calculateNearestBranch : function (locationObject, coordinatesArray) {
    this.userCoordinates = locationObject;
    var userLat = this.userCoordinates.coords.latitude;
    var userLong = this.userCoordinates.coords.longitude;
    var arrayLat;
    var arrayLong;
    var latDistance;
    var longDistance;
    var branchDistance;
    var distanceArray = [];
    var smallestVal;
    coordinatesArray.forEach(function (currentValue, index, arr) {
      arrayLat = currentValue[0];
      arrayLong = currentValue[1];
      latDistance = arrayLat-userLat;
      longDistance = arrayLong-userLong;
      branchDistance = Math.sqrt(latDistance*latDistance) + (longDistance*longDistance);
      if (index == 0) {
        smallestVal = [branchDistance, index, arrayLat+","+arrayLong];
      }
      else {
        if (branchDistance < smallestVal[0]) {
          smallestVal = [branchDistance, index, arrayLat+","+arrayLong];
        }
      }
    });
    this.nearestBranch = smallestVal;
    locationData.showNearBranch();
  }
};



var mainContent = {
    jsonData: contentData,
    childSelected: null,
    container: document.querySelector(".content_container"),
    fadeColor: function() {
        this.container.classList.add("inside_opacity_half");
    },
    bringBackNormalColor: function() {
        if ((window.scrollY > currentYPos || window.scrollY < currentYPos) && currentYPos != null) {
            this.container.classList.remove("inside_opacity_half");
            this.toggleNormalColorChild();
            currentYPos = null;
            childSelected = null;
        }
    },
    toggleNormalColorChild: function(ele) {
        this.childSelected.classList.toggle("opacity_full");
    }
};

mainContent.viewableContent = function(cityDataJson) {
    var contentString = "";
    for (var area in cityDataJson) {
        var areaString = "";
        for (var city in cityDataJson[area]) {
            var titleString = '<div class="city_branch_title" ><h3 class="branch_title all_zero ">' + cityDataJson[area][city].arabicName + '</h3></div>';
            var branchString = "";
            for (var branch in cityDataJson[area][city]["branches"]) {
                var cityName = 'فرع ' + cityDataJson[area][city]["branches"][branch].cityName;
                var add = cityDataJson[area][city]["branches"][branch].add;
                var phone = '0' + cityDataJson[area][city]["branches"][branch].phone;
                var lat = cityDataJson[area][city]["branches"][branch].lat;
                var long = cityDataJson[area][city]["branches"][branch].long;
                var index = branch;
                branchString += '<div class="city_branch_container" data-coordinates="'+lat+','+long+'">'+
                     '<h3 class="branch_content_name all_zero font_weight_300">' + cityName + '</h3>' +
                    '<h3 class="branch_content_add all_zero font_weight_300">' + add + '</h3>' +
                    '<h3 class="branch_content_phone all_zero font_weight_300 ">' +
                    '<a class="brach_content_call_link" href="tel:' + phone + '" dir="ltr">' + phone + '</a>' +
                    '</h3>'+
                    '</div>';
              locationData.coordinates.push([lat,long]);

            }
            titleString += '<div class="city_branch_container_wrapper ">' + branchString + '</div>';
            var innerString = '<div class="city_branch_outer_container" id="' + city + '">' + titleString + '</div>';
            areaString += innerString;
        }
        contentString += areaString;
    }
    return contentString;
};

var cityNavigate = {
    areaBtn: [].slice.call(document.querySelectorAll(".area_list")[0].children),
    currentCityList: null,
    cityListContainer: document.querySelector(".city_list"),
    cityList: [],
    activeAreaBtn: null,
    areaBtnClickEv: function(callback) {
        this.areaBtn.forEach(callback);
    },
    areaBtnClickFunc: function(currentVal, index, array) {
        currentVal.addEventListener("click", function() {
            cityNavigate.toggleAreaListAtiveBtn(currentVal);
            cityNavigate.createCityList({
                btnElement: currentVal,
                btnIndex: index
            });
            cityNavigate.currentCityList = [].slice.call(cityNavigate.cityListContainer.children);
            cityNavigate.cityListBtnClick(cityNavigate.cityListBtnClickFunc);
        });
    },
    cityListBtnClick: function(callback) {
        this.currentCityList.forEach(callback);
    },
    cityListBtnClickFunc: function(cv, ind, arr) {
        cv.addEventListener("click", function() {
            cityNavigate.branchSelect({
                ele: cv,
                index: ind
            });
        });
    },
    branchSelect: function(eleVal) {
        cityNavigate.showCityBranch(eleVal);
        mainContent.fadeColor();
        mainContent.toggleNormalColorChild();
    },
    showCityBranch: function(dataObj) {
        var hashValue;
        if (dataObj.hash) {
            hashValue = dataObj.hash;
        } else {
            hashValue = '#' + dataObj.ele.dataset.city;
        }
        changeHeader(hashValue);
        ele = document.querySelector(hashValue);
        mainContent.childSelected = ele;
        currentYPos = window.scrollY;
    },
    createCityList: function(btnObject) {
        if (this.cityList[btnObject.btnIndex] == null) {
            var cityListView = "";
            var area = btnObject.btnElement.dataset.area;
            var areaData = mainContent.jsonData[area];
            for (var prop in areaData) {
                cityListView += '<li class="area_name" data-city="' + prop + '">' + areaData[prop].arabicName + '</li>';
            }
            this.cityList[btnObject.btnIndex] = cityListView;
        }
        this.cityListContainer.innerHTML = this.cityList[btnObject.btnIndex];
    },
    toggleAreaListAtiveBtn: function(btn) {
        btn.parentElement.classList.remove("area_list_normal_color");
        if (this.activeAreaBtn != null) {
            this.activeAreaBtn.classList.toggle("active_area_btn");
        }
        btn.classList.toggle("active_area_btn");
        this.activeAreaBtn = btn;
    },
};

var scrollUpBtn = {
    affectHeight: document.querySelector("#wrapper").clientHeight,
    btnEle: document.querySelector(".go_up_btn_container"),
    btnState: false,
    btnShowFunction: function() {
        if (window.scrollY >= this.affectHeight && this.btnState == false) {
            this.btnEle.classList.remove("display_none");
            this.btnState = true;
        } else if (window.scrollY < this.affectHeight && this.btnState == true) {
            this.btnEle.classList.add("display_none");
            this.btnState = false;
        }
    }
};



function initWindowScrollEvent() {
    window.addEventListener("scroll", function() {
        scrollUpBtn.btnShowFunction();
        mainContent.bringBackNormalColor();
    });
};

window.onload = function() {
    if (location.hash != "") {
        cityNavigate.branchSelect({
            hash: location.hash
        });
    }
};


$(function() {
    $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, scrollTiming(500) );
                return false;
            }
        }
    });
});

function scrollTiming(penetrate) {
    window.scrollY * (penetrate / (document.body.scrollHeight - document.body.clientHeight));
}


function changeHeader(value) {
    window.location.href = value;
}

(function() {
    mainContent.container.insertAdjacentHTML("beforeend", mainContent.viewableContent(mainContent.jsonData));
    initWindowScrollEvent();
    cityNavigate.areaBtnClickEv(cityNavigate.areaBtnClickFunc);
    locationData.getHandler();
})();

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-83247063-1', 'auto');
  ga('send', 'pageview');
