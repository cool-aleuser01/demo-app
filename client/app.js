if (Meteor.isClient) {

  var WALDO = 0;
  var MAP = 1;
  var appMode = WALDO;

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

    if (!host || !port) {
      host = Session.get("host");
      port = Session.get("port");
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

  var createCanvas = function(newhost, newport, newappmode) {
    // canvas = HuddleCanvas.create("orbiter.huddlelamp.org", 53084,
    var canvas = HuddleCanvas.create(newhost, newport, {
      scalingEnabled: (newappmode == WALDO) ? false : true,
      rotationEnabled: false,
      panningEnabled: (newappmode == WALDO) ? false : true,
      disableFlickPan: true,
      useTiles: false,
      showDebugBox: true,
      accStabilizerEnabled: true,
      accStabilizerThreshold: 0.07,
      backgroundImage: (newappmode == WALDO) ? "/waldogame.png" : "/hybrid.png",
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

      canvas = createCanvas(host, port, appMode);
    });
  };

  Template.connectionDialog.helpers({

    absoluteUrl: function() {
      var host = Session.get("host") ? Session.get("host") : "localhost";
      var port = Session.get("port") ? Session.get("port") : 1948;

      var parameters = "?host=" + host;
      parameters += "&port=" + port;
      return Meteor.absoluteUrl(parameters);
    },

    host: function() {
      return Session.get("host");
    },

    port: function() {
      return Session.get("port");
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
    }
  });

  Template.canvas.events({
    'touchstart #help-button-icon-div': function(e, tmpl) {
      canvas.disableInteraction();

      if (appMode==WALDO)
      {
        $('#waldohelp-dialog').modal({
          backdrop: false,
          keyboard: false,
          show: true
        });        
      }

      if (appMode==MAP)
      {
        $('#maphelp-dialog').modal({
          backdrop: false,
          keyboard: false,
          show: true
        });        
      }
    },

    'touchstart #change-button-icon-div': function(e, tmpl) {
      if (appMode==MAP) 
      { 
        appMode = WALDO;
      }
      else
      { 
        appMode = MAP;
      }
      canvas.settings.scalingEnabled = (appMode == WALDO) ? false : true;
      canvas.settings.panningEnabled = (appMode == WALDO) ? false : true;
      canvas.settings.backgroundImage = (appMode == WALDO) ? "/waldogame.png" : "/hybrid.png";
      window.alert("Was set to "+ ((appMode == WALDO) ? "WALDO" : "MAP") + ", background=" + 
        canvas.settings.backgroundImage);
    }
  });

  Template.waldohelpDialog.events({

    'touchstart .dismiss-waldohelp-dialog': function(e, tmpl) {
      $('#waldohelp-dialog').modal('hide'); 

      canvas.enableInteraction();
    }
  });

  Template.maphelpDialog.events({

    'touchstart .dismiss-maphelp-dialog': function(e, tmpl) {
      $('#maphelp-dialog').modal('hide'); 

      canvas.enableInteraction();
    }
  });

}
