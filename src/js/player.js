'use strict';
var AbstractPlayer, PlayerContext, YoutubePlayer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PlayerContext = (function() {
  function PlayerContext() {}

  PlayerContext.prototype.getPlayer = function(vjs, url) {
    var srcTyp;
    srcTyp = vjs.currentType().replace(/video\//, "");
    switch (srcTyp) {
      case "youtube":
        return new YoutubePlayer(vjs, url);
      default:
        throw error;
    }
  };

  return PlayerContext;

})();

AbstractPlayer = (function() {
  function AbstractPlayer(vjs, url) {
    this.vjs = vjs;
    this.url = url;
    this.init();
    if (typeof CommentManager !== "undefined") {
      this.ccm = new CommentManager(this.pvChatBoard);
      this.ccm.display = true;
      this.ccm.init();
      this.ccm.clear();
    }
    if (window) {
      window.addEventListener('resize', function() {
        return this.ccm.setBounds();
      });
    }
    CommentLoader(this.danmakuSrc, this.ccm);
  }

  AbstractPlayer.prototype.init = function() {
    var _this;
    this.id;
    this.srcId;
    this.srcTyp;
    this.danmakuSrc = this.vjs.options().tracks[0].src;
    this.pvChatBoard = document.createElement('div');
    this.pvChatBoard.className = 'pv-chatboard';
    this.vjs.el().insertBefore(this.pvChatBoard, this.vjs.el().getElementsByClassName('vjs-poster')[0]);
    this.rendered = false;
    _this = this;
    this.vjs.on('ready', function() {
      var pvDanmakuCtrlBtn, pvDanmakuMenuBtn, pvDanmakuMenuItmBtn, pvDanmakuMenuItmIBtn, sbttl;
      if (!_this.rendered) {
        pvDanmakuCtrlBtn = document.createElement('div');
        pvDanmakuCtrlBtn.className = 'vjs-danmaku-control vjs-menu-button vjs-control';
        pvDanmakuMenuBtn = document.createElement('div');
        pvDanmakuMenuBtn.className = 'vjs-danmaku-menu-button vjs-menu-button vjs-control';
        pvDanmakuMenuItmBtn = document.createElement('span');
        pvDanmakuMenuItmIBtn = document.createElement('i');
        pvDanmakuMenuItmIBtn.className = 'fa fa-comments-o fa-2x';
        pvDanmakuMenuItmIBtn.style.lineHeight = 1.3;
        pvDanmakuMenuItmIBtn.setAttribute('display', "true");
        pvDanmakuMenuItmIBtn.addEventListener('click', function() {
          var attr;
          attr = this.getAttribute('display');
          if (attr === "true") {
            _this.ccm.display = false;
            _this.ccm.clear();
            _this.ccm.stopTimer();
            return this.setAttribute('display', "false");
          } else {
            _this.ccm.display = true;
            _this.ccm.startTimer();
            return this.setAttribute('display', "true");
          }
        });
        pvDanmakuMenuItmBtn.appendChild(pvDanmakuMenuItmIBtn);
        pvDanmakuMenuBtn.appendChild(pvDanmakuMenuItmBtn);
        pvDanmakuCtrlBtn.appendChild(pvDanmakuMenuBtn);
        _this.vjs.el().getElementsByClassName('vjs-control-bar')[0].appendChild(pvDanmakuCtrlBtn);
        sbttl = _this.vjs.el().getElementsByClassName('vjs-subtitles-button')[0];
        sbttl.parentElement.removeChild(sbttl);
        return _this.rendered = true;
      }
    });
  };

  return AbstractPlayer;

})();

YoutubePlayer = (function(_super) {
  __extends(YoutubePlayer, _super);

  function YoutubePlayer(vjs, url) {
    this.vjs = vjs;
    this.url = url;
    this.lastPosition = 0;
    this.bind();
    YoutubePlayer.__super__.constructor.call(this, this.vjs, this.url);
  }

  YoutubePlayer.prototype.bind = function() {
    var _this;
    _this = this;
    this.vjs.on('play', function() {
      return _this.ccm.startTimer();
    });
    this.vjs.on('pause', function() {
      return _this.ccm.stopTimer();
    });
    this.vjs.on('waiting', function() {
      return _this.ccm.stopTimer();
    });
    this.vjs.on('playing', function() {
      return _this.ccm.startTimer();
    });
    this.vjs.on('seeked', function() {
      return _this.ccm.clear();
    });
    this.vjs.on('progress', function() {
      if (_this.lastPosition === _this.vjs.currentTime()) {
        _this.vjs.hasStalled = true;
        return _this.ccm.stopTimer();
      } else {
        return _this.lastPosition = _this.vjs.currentTime();
      }
    });
    this.vjs.on('timeupdate', function() {
      if (_this.ccm.display === false) {
        return;
      }
      if (_this.vjs.hasStalled) {
        _this.ccm.startTimer();
        _this.vjs.hasStalled = false;
      }
      return _this.ccm.time(Math.floor(_this.vjs.currentTime() * 1000));
    });
    this.vjs.on('ratechange', function() {
      if (_this.ccm.def.globalScale != null) {
        if (_this.vjs.playbackRate !== 0) {
          _this.ccm.def.globalScale = 1 / _this.vjs.playbackRate;
          return _this.ccm.rescale();
        }
      }
    });
    return this.vjs.on('ready', function() {});
  };

  return YoutubePlayer;

})(AbstractPlayer);
