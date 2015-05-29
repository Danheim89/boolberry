(function() {
    'use strict';
    var module = angular.module('app.market',[]);

    module.controller('marketCtrl',['backend','$rootScope','$scope','informer','$routeParams','$filter','$location','market','$timeout',
        function(backend,$rootScope,$scope,informer,$routeParams,$filter,$location, market, $timeout){
            
            // TODO refactor code with using services ex. offer.isFav(), offer.getFav(), etc 
            var is_currency_offer = function(offer){
                if(offer.offer_type == 2 || offer.offer_type == 3){
                    return true;
                }
                return false;
            };

            var is_goods_offer = function(offer){
                if(offer.offer_type == 0 || offer.offer_type == 1){
                    return true;
                }
                return false;
            };

            $scope.fav_offers_hash = [];

            var is_fav = function(offer){
                if($scope.fav_offers_hash.indexOf(offer.tx_hash) > -1){
                    return true;
                }
                return false;
            };

            $scope.is_fav = is_fav;

            $scope.toggleFav = function(offer){
                var index = $scope.fav_offers_hash.indexOf(offer.tx_hash);
                if(index > -1){
                    $scope.fav_offers_hash.splice(index,1);
                }else{
                    $scope.fav_offers_hash.push(offer.tx_hash);
                }
                loadFavorites();
                $scope.favOffersFilterChange();
            };

            var loadFavorites = function(){
                $scope.fav_offers = $filter('filter')($rootScope.offers, is_fav);
                $scope.fav_currency_offers = $filter('filter')($scope.fav_offers, is_currency_offer);
                $scope.fav_goods_offers    = $filter('filter')($scope.fav_offers, is_goods_offer);
                $scope.f_fav_currency_offers = $scope.fav_currency_offers;
                $scope.f_fav_goods_offers = $scope.fav_goods_offers;
            };

            

            // GET LIST OF OFFERS
            backend.get_all_offers(function(data){
                if(angular.isDefined(data.offers)){
                    $rootScope.offers = $filter('orderBy')(data.offers,'-timestamp');
                    

                    $scope.currency_offers = $filter('filter')($rootScope.offers, is_currency_offer);
                    $scope.goods_offers = $filter('filter')($rootScope.offers, is_goods_offer);
                    

                    $scope.f_currency_offers = $scope.currency_offers; // filtered currency offers by default
                    $scope.f_goods_offers    = $scope.goods_offers; // filtered goods offers by default

                    $scope.my_offers = [];


                    angular.forEach($rootScope.offers,function(item){
                        var result = $filter('filter')($rootScope.safes, item.tx_hash);

                        if(result.length){
                            $scope.my_offers.push(item);
                            
                        }
                    });

                    $rootScope.offers_count = $scope.my_offers.length;

                    $scope.my_currency_offers = $filter('filter')($scope.my_offers, is_currency_offer);
                    $scope.my_goods_offers    = $filter('filter')($scope.my_offers, is_goods_offer);
                    $scope.f_my_currency_offers = $scope.my_currency_offers;
                    $scope.f_my_goods_offers = $scope.my_goods_offers;

                    loadFavorites();
                }
            });

            $scope.goods_interval_values = [
                { key: -1, value : "не важно"},
                { key: 3600, value : "час"},
                { key: 10800, value : "3 часа"},
                { key: 86400, value : "день"},
                { key: 172800, value : "два дня"},
                { key: 259200, value : "три дня"},
                { key: 604800, value : "неделя"},
                // { key: 604801, value : "больше недели"}, // ?
                { key: -2, value : "другой период"}
            ];

            $scope.payment_types = market.paymentTypes;
            $scope.currencies = angular.copy(market.currencies);
            $scope.currencies.unshift({code: 'Не важно', title : 'Не важно'});
            $scope.hide_calendar   = true;
            $scope.cf_hide_calendar = true;
            $scope.gf_opened = {};
            $scope.gf_opened.start   = false;
            $scope.gf_opened.end   = false;
            $scope.gf_opened.cur_start   = false;
            $scope.gf_opened.cur_end   = false;

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.format = 'dd/MM/yyyy';

            $scope.gf_open = function($event,name) {
                $event.preventDefault();
                $event.stopPropagation();
                $timeout(function(){
                    if(name == 'start'){
                        $scope.gf_opened.start = !$scope.gf_opened.start;
                    }else if(name == 'end'){
                        $scope.gf_opened.end = !$scope.gf_opened.end;
                    }else if(name == 'cur_start'){
                        $scope.gf_opened.cur_start = !$scope.gf_opened.cur_start;
                    }else if(name == 'cur_end'){
                        $scope.gf_opened.cur_end = !$scope.gf_opened.cur_end;
                    }    
                });
            };

            // CURRENCY FILTER

            $scope.currency_filter = {
                offer_type: 'all', //all, in, out
                keywords: '',
                country_keywords: '',
                city_keywords: '',
                interval : $scope.goods_interval_values[0].key,
                currency : $scope.currencies[0].code,
                payment_types : []
            };

            $scope.currency_offer_date = {};

            $scope.currencyFilterChange = function(){
                $scope.pf_currency_offers = angular.copy($scope.currency_offers); // prefiltered goods offers

                var cf = $scope.currency_filter; 

                if(cf.interval == -2){
                    $scope.cf_hide_calendar = false;

                    if(angular.isDefined($scope.currency_offer_date.start) && angular.isDefined($scope.currency_offer_date.end)){
                        var start = $scope.currency_offer_date.start.getTime()/1000;
                        var end   = $scope.currency_offer_date.end.getTime()/1000 + 60*60*24;

                        var currency_in_range = function(item){
                            if((start < item.timestamp) && (item.timestamp < end)){
                                return true;
                            }
                            return false;
                        }

                        if(start < end){
                            $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,currency_in_range);
                        }
                    }
                }else{
                    $scope.cf_hide_calendar = true;

                }

                if(cf.interval > 0){
                    var now = new Date().getTime();
                    now = now/1000;

                    var in_interval = function(item){
                        
                        if(item.timestamp > (now - cf.interval)){
                            return true;
                        }
                        return false;
                    }
                    
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,in_interval);
                }

                if(cf.keywords != ''){
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,cf.keywords);
                }

                if(cf.country_keywords != ''){
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers, {location : cf.country_keywords});
                }

                if(cf.city_keywords != ''){
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers, {location : cf.city_keywords});
                }

                if(cf.offer_type != 'all'){
                    var condition = { offer_type: (cf.offer_type == 'sell') ? 2 : 3};
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,condition);
                }

                if(cf.currency != $scope.currencies[0].code){
                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,{target : cf.currency});
                }

                if(cf.payment_types.length){
                    var in_types = function(item){
                        var result = false;
                        angular.forEach(item.payment_types.split(','),function(type){
                            if(cf.payment_types.indexOf(type) > -1){
                                result =  true;
                            }    
                        });
                        
                        return result;
                    }

                    $scope.pf_currency_offers = $filter('filter')($scope.pf_currency_offers,in_types);
                }

                $scope.f_currency_offers = $scope.pf_currency_offers;
            };

            // GOODS FILTER

            

            $scope.goods_filter = {
                offer_type: 'all', //all, in, out
                keywords: '',
                country_keywords: '',
                city_keywords: '',
                interval : $scope.goods_interval_values[0].key
            };

            $scope.goods_offer_date = {};

            $scope.goodsFilterChange = function(){
                $scope.pf_goods_offers = angular.copy($scope.goods_offers); // prefiltered goods offers

                var gf = $scope.goods_filter; 

                if(gf.interval == -2){
                    $scope.hide_calendar = false;

                    if(angular.isDefined($scope.goods_offer_date.start) && angular.isDefined($scope.goods_offer_date.end)){
                        var start = $scope.goods_offer_date.start.getTime()/1000;
                        var end   = $scope.goods_offer_date.end.getTime()/1000 + 60*60*24;

                        var goods_in_range = function(item){
                            if((start < item.timestamp) && (item.timestamp < end)){
                                return true;
                            }
                            return false;
                        }

                        if(start < end){
                            $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers,goods_in_range);
                        }
                    }
                }else{
                    $scope.hide_calendar = true;

                }

                if(gf.interval > 0){
                    var now = new Date().getTime();
                    now = now/1000;

                    var in_interval = function(item){
                        
                        if(item.timestamp > (now - gf.interval)){
                            return true;
                        }
                        return false;
                    }
                    
                    $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers,in_interval);
                }

                if(gf.keywords != ''){
                    $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers,gf.keywords);
                }

                if(gf.country_keywords != ''){
                    $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers, {location : gf.country_keywords});
                }

                if(gf.city_keywords != ''){
                    $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers, {location : gf.city_keywords});
                }

                if(gf.offer_type != 'all'){
                    var condition = { offer_type: (gf.offer_type == 'sell') ? 1 : 0};
                    $scope.pf_goods_offers = $filter('filter')($scope.pf_goods_offers,condition);
                }

                $scope.f_goods_offers = $scope.pf_goods_offers;
            };

            //MY OFFERS FILTER

            $scope.myOffersView = 'currency'; // tab by default

            $scope.my_offers_filter = {
                offer_type: 'all', //all, in, out
                keywords: ''
            };

            $scope.myOffersFilterChange = function(){
                $scope.pf_my_currency_offers = angular.copy($scope.my_currency_offers);
                $scope.pf_my_goods_offers    = angular.copy($scope.my_goods_offers);

                var mof = $scope.my_offers_filter; 

                if(mof.keywords != ''){
                    $scope.pf_my_currency_offers = $filter('filter')($scope.pf_my_currency_offers,mof.keywords);
                    $scope.pf_my_goods_offers = $filter('filter')($scope.pf_my_goods_offers,mof.keywords);
                }

                if(mof.offer_type != 'all'){
                    var condition = { offer_type: (mof.offer_type == 'sell') ? 1 : 0};
                    $scope.pf_my_goods_offers = $filter('filter')($scope.pf_my_goods_offers,condition);

                    var condition = { offer_type: (mof.offer_type == 'sell') ? 2 : 3};
                    $scope.pf_my_currency_offers = $filter('filter')($scope.pf_my_currency_offers,condition);
                }

                $scope.f_my_goods_offers = $scope.pf_my_goods_offers;
                $scope.f_my_currency_offers = $scope.pf_my_currency_offers;
            };

            //FAVORITE OFFERS FILTER

            $scope.favOffersView = 'currency'; // tab by default

            $scope.fav_offers_filter = {
                offer_type: 'all', //all, in, out
                keywords: ''
            };

            $scope.favOffersFilterChange = function(){
                $scope.pf_fav_currency_offers = angular.copy($scope.fav_currency_offers);
                $scope.pf_fav_goods_offers    = angular.copy($scope.fav_goods_offers);

                var fof = $scope.fav_offers_filter; 

                if(fof.keywords != ''){
                    $scope.pf_fav_currency_offers = $filter('filter')($scope.pf_fav_currency_offers,fof.keywords);
                    $scope.pf_fav_goods_offers = $filter('filter')($scope.pf_fav_goods_offers,fof.keywords);
                }

                if(fof.offer_type != 'all'){
                    var condition = { offer_type: (fof.offer_type == 'sell') ? 1 : 0};
                    $scope.pf_fav_goods_offers = $filter('filter')($scope.pf_fav_goods_offers,condition);

                    var condition = { offer_type: (fof.offer_type == 'sell') ? 2 : 3};
                    $scope.pf_fav_currency_offers = $filter('filter')($scope.pf_fav_currency_offers,condition);
                }

                $scope.f_fav_goods_offers = $scope.pf_fav_goods_offers;
                $scope.f_fav_currency_offers = $scope.pf_fav_currency_offers;
            };

            
        }
    ]);

    module.controller('addOfferCtrl',['backend','$rootScope','$scope','informer','$routeParams','$filter','$location',
        function(backend,$rootScope,$scope,informer,$routeParams,$filter,$location){
            $scope.intervals = [1,3,5,14];

            $scope.offer_types = [
                {key : 0, value: 'Купить товар'},
                {key : 1, value: 'Продать товар'}
            ];

            $scope.offer = {
                expiration_time : $scope.intervals[3],
                is_standart : false,
                is_premium : true,
                fee_premium : '6.00',
                fee_standart : '1.00',
                location: {country : '', city: ''},
                contacts: {phone : '', email : ''},
                comment: ''
            };

            if($rootScope.safes.length){
                $scope.offer.wallet_id = $rootScope.safes[0].wallet_id;
            }

            if($location.path() == '/addOfferSell'){
                $scope.offer.offer_type = 1;
            }else{
                $scope.offer.offer_type = 0;
            }

            

            $scope.changePackage = function(is_premium){
                if(is_premium){
                    $scope.offer.is_standart = $scope.offer.is_premium ? false : true;
                }else{
                    $scope.offer.is_premium = $scope.offer.is_standart ? false : true;
                }
            };

            $scope.addOffer = function(offer){
                var o = angular.copy(offer);
                o.fee = o.is_premium ? o.fee_premium : o.fee_standart;
                o.location = o.location.country + ', ' + o.location.city;
                o.contacts = o.contacts.email + ', ' + o.contacts.phone;
                o.amount_etc = 1;
                o.payment_types = '';

                backend.pushOffer(
                    o.wallet_id, o.offer_type, o.amount_lui, o.target, o.location, 
                    o.contacts, o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types,
                    function(data){
                        informer.success('Спасибо. Заявка Добавлена');
                    }
                );
            };
        }
    ]);
    // Guilden offer
    module.controller('addGOfferCtrl',['backend','$rootScope','$scope','informer','$routeParams','$filter','$location','$timeout','market',
        function(backend,$rootScope,$scope,informer,$routeParams,$filter,$location,$timeout,market){
            $scope.intervals = [1,3,5,14];

            console.log();

            $scope.currencies = market.currencies;

            $scope.offer_types = [
                {key : 2, value: 'Покупка гульденов'},
                {key : 3, value: 'Продажа гульденов'}
            ];

            $scope.payment_types = market.paymentTypes;

            $scope.deal_details = [
                "всю сумму целиком",
                "возможно частями"
            ];


            $scope.offer = {
                expiration_time : $scope.intervals[3],
                is_standart : false,
                is_premium : true,
                fee_premium : '6.00',
                fee_standart : '1.00',
                location: {country : '', city: ''},
                contacts: {phone : '', email : ''},
                comment: '',
                currency: $scope.currencies[0].code,
                payment_types: [],
                deal_details: $scope.deal_details[0]
            };

            if($rootScope.safes.length){
                $scope.offer.wallet_id = $rootScope.safes[0].wallet_id;
            }

            if($location.path() == '/addGOfferSell'){
                $scope.offer.offer_type = 3;
            }else{
                $scope.offer.offer_type = 2;
            }

            $scope.changePackage = function(is_premium){
                if(is_premium){
                    $scope.offer.is_standart = $scope.offer.is_premium ? false : true;
                }else{
                    $scope.offer.is_premium = $scope.offer.is_standart ? false : true;
                }
            };

            $scope.recount = function(type){
                
                var toInt = function(value){
                    console.log(value);
                    console.log(parseInt(value));
                    console.log(angular.isNumber(parseInt(value)));
                    
                    if(angular.isNumber(parseInt(value))){
                        if(!isNaN(parseInt(value))){
                            value = parseInt(value);
                        }
                    }else{
                        value = 0;
                    }
                    console.log(value);
                    return value;
                }

                $timeout(function(){
                    switch(type){
                        case 'lui': // amoun lui changes
                            console.log('lui');
                            if(toInt($scope.offer.amount_lui) && toInt($scope.offer.amount_etc)){
                                console.log('1');
                                $scope.offer.rate = $scope.offer.amount_etc / $scope.offer.amount_lui;
                            }else if (toInt($scope.offer.rate)){
                                console.log('2');
                                $scope.offer.amount_etc = toInt($scope.offer.amount_lui) * $scope.offer.rate;
                            }
                            break;
                        case 'target':  // amoun etc changes
                            console.log('target');
                            if(toInt($scope.offer.amount_etc) && toInt($scope.offer.amount_lui)){
                                console.log('1');
                                $scope.offer.rate = $scope.offer.amount_etc / $scope.offer.amount_lui;
                            }else if (toInt($scope.offer.amount_etc) && toInt($scope.offer.rate)){
                                console.log('2');
                                $scope.offer.amount_lui = $scope.offer.amount_etc / $scope.offer.rate;
                            }
                            break;
                        case 'rate': // rate changes
                            console.log('rate');
                            if(toInt($scope.offer.rate) && toInt($scope.offer.amount_lui)){
                                console.log('1');
                                $scope.offer.amount_etc = $scope.offer.rate * $scope.offer.amount_lui;
                            }else if (toInt($scope.offer.rate) && toInt($scope.offer.amount_etc)){
                                console.log('2');
                                $scope.offer.amount_lui = $scope.offer.amount_etc / $scope.offer.rate;
                            }
                            break;
                    }
                });
                
                
            };

            $scope.addOffer = function(offer){
                
                var o = angular.copy(offer);
                
                o.fee = o.is_premium ? o.fee_premium : o.fee_standart;
                o.location = o.location.country + ', ' + o.location.city;
                o.contacts = o.contacts.email + ', ' + o.contacts.phone;
                if(o.payment_type_other) o.payment_types.push(o.payment_type_other);
                o.payment_types = o.payment_types.join(",");
                o.comment = o.comment + (o.comment?' ':'') + o.deal_details;
                o.target = o.currency;
                //informer.info(JSON.stringify(o));
                
                backend.pushOffer(
                    o.wallet_id, o.offer_type, o.amount_lui, o.target, o.location, o.contacts, 
                    o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types,
                    function(data){
                        informer.success('Спасибо. Заявка Добавлена');
                    }
                );
            };
        }
    ]);

}).call(this);