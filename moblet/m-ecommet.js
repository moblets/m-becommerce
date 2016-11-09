/* eslint no-undef: [0]*/
module.exports = {
  title: "mEcommet",
  style: "m-ecommet.less",
  template: 'm-ecommet.html',
  i18n: {
    pt: "lang/pt-BR.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $rootScope,
    $filter,
    $timeout,
    $state,
    $stateParams,
    $mDataLoader,
    $http
  ) {
    var dataLoadOptions;
    var list = {
      /**
       * Set the view and update the needed parameters
       * @param  {object} data Data received from Moblets backend
       * @param  {boolean} more If called by "more" function, it will add the
       * data to the items array
       */
      setView: function(data, more) {
        if (isDefined(data)) {
          $scope.error = false;
          $scope.emptyData = false;
          $scope.listStyle = data.listStyle;
          $scope.itemStyle = data.itemStyle;

          $scope.isCard = data.listStyle === "layout-2";
          $scope.isList = data.listStyle === "layout-1";

          // If it was called from the "more" function, concatenate the items
          $scope.items = (more) ? $scope.items.concat(data.items) : data.items;

          // Set "noContent" if the items lenght = 0
          $scope.noContent = $scope.items === undefined ||
                             $scope.items.length === 0;

          // set empty itens if no content
          if ($scope.noContent) {
            $scope.items = [];
          }

          // Check if the page is loading the list or a detail
          $scope.isDetail = list.isDetail();

          // Disable the "more" function if the API don't have more items
          $scope.more = (data.hasMoreItems) ? list.more : undefined;
        } else {
          $scope.error = true;
          $scope.emptyData = true;
        }

        // Broadcast complete refresh and infinite scroll
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');

        // If the view is showing the detail, call showDetail
        if ($scope.items.length === 1) {
          $scope.isDetail = true;
          list.showDetail(0);
        } else if ($scope.isDetail) {
          list.showDetail();
        }

        // Remove the loading animation
        $scope.isLoading = false;
      },
      /**
       * Check if the view is showing a detail or the list. The function checks
       * if $stateParams.detail is set.
       * @return {boolean} True if the view must show a detail.
       */
      isDetail: function() {
        return $stateParams.detail !== "";
      },
      /**
       * Show the detail getting the index from $stateParams.detail. Set "item"
       * to the selected detail
       */
      showDetail: function(detailIndex) {
        if (isDefined($stateParams.detail) && $stateParams.detail !== "") {
          var itemIndex = _.findIndex($scope.items, function(item) {
            return item.id.toString() === $stateParams.detail;
          });
          if (itemIndex === -1) {
            dataLoadOptions = {
              offset: $scope.items === undefined ? 0 : $scope.items.length,
              items: 25,
              cache: false
            };
            list.load(false, function() {
              list.showDetail();
            });
          } else {
            $scope.detail = $scope.items[itemIndex];
          }
        } else if (isDefined(detailIndex)) {
          $scope.detail = $scope.items[detailIndex];
        }
      },
      /**
       * Load data from the Moblets backend:
       * - show the page loader if it's called by init (sets showLoader to true)
       * - Use $mDataLoader.load to get the moblet data from Moblets backend.
       * 	 The parameters passed to $mDataLoader.load are:
       * 	 - $scope.moblet - the moblet created in the init function
       * 	 - false - A boolean that sets if you want to load data from the
       * 	   device storage or from the Moblets API
       * 	 - dataLoadOptions - An object with parameters for pagination
       * @param  {boolean} showLoader Boolean to determine if the page loader
       * is active
       * @param {function} callback Callback
       */
      loadMainPage: function(showLoader, callback) {
        $scope.isLoading = showLoader || false;
        // mDataLoader also saves the response in the local cache. It will be
        // used by the "showDetail" function
        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            list.setView(data);
            if (typeof callback === 'function') {
              callback();
            }
          }
        );
      },
      /**
       * Initiate the list moblet:
       * - put the list.load function in the $scope
       * - run list.load function
       */
      init: function() {
        $scope.isLoading = true;
				                                                                                dataLoadOptions = {
  cache: ($stateParams.detail !== "")
};
        $mDataLoader.load($scope.moblet, {cache: false})
          .then(function(ecommetData) {
            if (_.isEmpty(ecommetData)) {
              $scope.emptyData = true;
              $scope.isLoading = false;
            } else {
              $scope.emptyData = false;
              // Put the ecommetData from the feed in the $scope object
              $scope.ecommetData = ecommetData;

              loadMainPage();
            }
          }
				);
      }
    };
    // var listItem = {
    //   goTo: function(detail) {
    //     $stateParams.detail = detail.id;
    //     $state.go('pages', $stateParams);
    //   }
    // };
    list.init();
  }
};
