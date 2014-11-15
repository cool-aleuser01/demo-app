if (Meteor.isClient) {

  var AppModes = {
    Waldo: {
      key: "waldo",
      name: "Where is Waldo?"
    },
    Map: {
      key: "map",
      name: "Humanitarian Map"
    }
  };

  var appModes = _.map(AppModes, function(value, key) {
    return {
      key: value.key,
      value: value.name
    };
  });

  Session.setDefault("appModes", appModes);

  // make canvas accessible outside of the createCanvas function
  var canvas;

  /**
   * Get url parameter, e.g., http://localhost:3000/?id=3 -> id = 3
   *
   * @name The parameter name.
   */
  var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  /**
   * Connects to Huddle Engine using
   *
   * 1) host and port url parameter if set
   * 2) host and port from session if set
   * 3) shows a connection dialog
   */
  var connect = function() {
    var host = getParameterByName("host");
    var port = parseInt(getParameterByName("port"));
    var appMode = getParameterByName("appMode");

    if (!host || !port) {
      host = Session.get("host");
      port = Session.get("port");
      appMode = Session.get("appMode");
    }

    if (host && port) {
      canvas = createCanvas(host, port, appMode);
    }
    else {
      $('#connection-dialog').modal({
        backdrop: false,
        keyboard: false,
        show: true
      });
    }
  };

  var createCanvas = function(host, port, appMode) {
    if (appMode === undefined)
      appMode = AppModes.Waldo.key;

    // canvas = HuddleCanvas.create("orbiter.huddlelamp.org", 53084,
    var canvas = HuddleCanvas.create(host, port, {
      scalingEnabled: (appMode == AppModes.Waldo.key) ? false : true,
      rotationEnabled: true,
      panningEnabled: (appMode == AppModes.Waldo.key) ? false : true,
      disableFlickPan: true,
      useTiles: false,
      showDebugBox: true,
      accStabilizerEnabled: true,
      accStabilizerThreshold: 0.07,
      backgroundImage: (appMode == AppModes.Waldo.key) ? "/waldogame.png" : "/hybrid.png",
      layers: ["ui-layer"]
    });

    return canvas;
  };



  /**
   * Do connect after main application rendered.
   */
  Template.main.rendered = function() {
    // do connect to Huddle Engine, otherwise show connection dialog
    connect();
  }

  /**
   * Render the connection dialog.
   */
  Template.connectionDialog.rendered = function() {
    $('#connection-dialog').on('hidden.bs.modal', function (e) {
      var host = $('#client-host').val();
      var port = parseInt($('#client-port').val());
      var appMode = $('#app-mode').val();

      canvas = createCanvas(host, port, appMode);
    });
  };

  Template.connectionDialog.helpers({

    absoluteUrl: function() {
      var host = Session.get("host") ? Session.get("host") : "localhost";
      var port = Session.get("port") ? Session.get("port") : 1948;
      var appMode = Session.get("appMode") ? Session.get("appMode") : AppModes.Waldo.key;

      var parameters = "?host=" + host;
      parameters += "&port=" + port;
      parameters += "&appMode=" + appMode;
      return Meteor.absoluteUrl(parameters);
    },

    host: function() {
      return Session.get("host");
    },

    port: function() {
      return Session.get("port");
    },

    appModes: function() {
      return Session.get("appModes");
    }
  });

  Template.connectionDialog.events({

    'keyup #client-host': function(e, tmpl) {
      var host = $('#client-host').val();
      Session.set("host", host);
    },

    'keyup #client-port': function(e, tmpl) {
      try {
        var port = parseInt($('#client-port').val());
        Session.set("port", port);
      }
      catch (err) {
        // ignore err
      }
    },

    'change #app-mode': function(e, tmpl) {
      var appMode = $('#app-mode').val();
      Session.set("appMode", appMode);
    }
  });

  // Legend button
  Template.canvas.events({
    'touchstart #waldo-button-icon-div': function(e, tmpl) {
      canvas.disableInteraction();

      $('#waldo-dialog').modal({
        backdrop: false,
        keyboard: false,
        show: true
      });
    }
  });

  Template.waldoDialog.events({

    'touchstart .dismiss-waldo-dialog': function(e, tmpl) {
      $('#waldo-dialog').modal('hide');

      canvas.enableInteraction();
    }
  });
}
