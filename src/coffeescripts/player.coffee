'use strict';
class PlayerContext
  constructor: () ->

  getPlayer: (vjs, url) ->
    srcTyp = vjs.currentType().replace /video\//, ""

    switch srcTyp
      when "youtube"
        return new YoutubePlayer(vjs, url)
      else
        throw error


class AbstractPlayer
  constructor: (@vjs, @url) ->
    this.init()
    if typeof CommentManager isnt "undefined"
      @ccm = new CommentManager(@pvChatBoard)
      @ccm.display = true
      @ccm.init()
      @ccm.clear()
    if window
      window.addEventListener 'resize', () -> @ccm.setBounds()
    CommentLoader(@danmakuSrc, @ccm);


  init: () ->
    @id
    @srcId
    @srcTyp
    @danmakuSrc = this.vjs.options().tracks[0].src;

    @pvChatBoard = document.createElement('div');
    @pvChatBoard.className = 'pv-chatboard';
    @vjs.el().insertBefore @pvChatBoard, @vjs.el().getElementsByClassName('vjs-poster')[0];

    @rendered = false
    _this = this
    @vjs.on 'ready', () ->
      if !_this.rendered
        pvDanmakuCtrlBtn = document.createElement('div')
        pvDanmakuCtrlBtn.className = 'vjs-danmaku-control vjs-menu-button vjs-control'

        pvDanmakuMenuBtn = document.createElement('div')
        pvDanmakuMenuBtn.className = 'vjs-danmaku-menu-button vjs-menu-button vjs-control'

        pvDanmakuMenuItmBtn = document.createElement('span')

        pvDanmakuMenuItmIBtn = document.createElement('i')
        pvDanmakuMenuItmIBtn.className = 'fa fa-comments-o fa-2x'
        pvDanmakuMenuItmIBtn.style.lineHeight = 1.3
        pvDanmakuMenuItmIBtn.setAttribute('display', "true");

        pvDanmakuMenuItmIBtn.addEventListener 'click', () ->
          attr = this.getAttribute('display')
          if attr == "true"
            _this.ccm.display = false;
            _this.ccm.clear()
            _this.ccm.stopTimer()
            this.setAttribute('display', "false")
          else
            _this.ccm.display = true;
            _this.ccm.startTimer()
            this.setAttribute('display', "true")


        pvDanmakuMenuItmBtn.appendChild pvDanmakuMenuItmIBtn
        pvDanmakuMenuBtn.appendChild pvDanmakuMenuItmBtn
        pvDanmakuCtrlBtn.appendChild pvDanmakuMenuBtn
        _this.vjs.el().getElementsByClassName('vjs-control-bar')[0].appendChild pvDanmakuCtrlBtn

        sbttl = _this.vjs.el().getElementsByClassName('vjs-subtitles-button')[0]
        sbttl.parentElement.removeChild sbttl

        _this.rendered = true
    return


class YoutubePlayer extends AbstractPlayer
  constructor: (@vjs, @url) ->
    @lastPosition = 0
    this.bind()
    super @vjs, @url

  bind: () ->
    _this = this
    @vjs.on 'play', () -> _this.ccm.startTimer()
    @vjs.on 'pause', () -> _this.ccm.stopTimer()
    @vjs.on 'waiting', () -> _this.ccm.stopTimer()
    @vjs.on 'playing', () -> _this.ccm.startTimer()
    @vjs.on 'seeked', () -> _this.ccm.clear()
    @vjs.on 'progress', () ->
      if _this.lastPosition is _this.vjs.currentTime()
        _this.vjs.hasStalled = true
        _this.ccm.stopTimer()
      else
        _this.lastPosition = _this.vjs.currentTime()
    @vjs.on 'timeupdate', () ->
      if _this.ccm.display is false
        return
      if _this.vjs.hasStalled
        _this.ccm.startTimer()
        _this.vjs.hasStalled = false
      _this.ccm.time(Math.floor(_this.vjs.currentTime() * 1000))
    @vjs.on 'ratechange', () ->
      if _this.ccm.def.globalScale?
        if _this.vjs.playbackRate isnt 0
            _this.ccm.def.globalScale = (1/_this.vjs.playbackRate)
            _this.ccm.rescale()
    @vjs.on 'ready', () ->
