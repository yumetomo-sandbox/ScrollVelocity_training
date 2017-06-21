var $ = require('jquery');
var _ = require('underscore');
var velocity = require('velocity-animate');
require('velocity-animate/velocity.ui');

/**
 * スクロール位置に応じてvelocity.jsを発火させるクラス
 * パラメータはマークアップで行う
 * マークアップできるパラメータは以下
 * data-effect プロパティーまたはエフェクト名
 * data-easing イージング
 * data-duration アニメーション時間
 * data-delay 遅延時間
 * data-bias 発火位置のバイアス値
 * data-target 発火基準となるDOM(オプション)
 *
 * @example
 * new ScrollVelocity('.scrollVelocity');
 * <div class="scrollVelocity"
 *      data-effect='{"scale":[1, 0]}'
 *      data-easing="[250, 18]"
 *      data-duration="500"
 *      ata-delay="1600"
 *      data-bias="-1000">
 * <div class="scrollVelocity"
 *      data-effect='transition.transition.bounceLeftIn'
 *      data-easing="[250, 18]"
 *      data-duration="500"
 *      data-delay="1600"
 *      data-bias="-1000"
 *      data-target=".wrapper">
 */
/**
 * @param {String} selector 領域のセレクター
 * @param {Number} threshold 発火位置
 */
function ScrollVelocity(selector, threshold) {

  var _this = this;

  selector = selector || '.scrollVelocity';
  threshold = threshold || 400;

  this.$elements = $(selector);
  this.elements = [];
  this.length = this.$elements.length;
  this.shownCount = 0;
  this.windowHeight = $(window).height();
  this.threshold = threshold;

  // offsetは取れるよう不可視状態にする
  _.each(this.$elements, function(_element) {
    var element = _element;
    element.style.opacity = 0;
  });

  $(window).on('load', function() {
    _this.start();
  });
}

/**
 * パラメータを格納後、監視を開始する
 */
ScrollVelocity.prototype.start = function () {

  var _this = this;

  // パラメータを格納する
  _.each(this.$elements, function (_element) {
    var element = _element;
    var $this = $(element);
    var $target = $this.data('target') && $($this.data('target'));
    element.isShown = false;
    element.delay = $this.data('delay') || 0;
    element.duration = $this.data('duration') || 800;
    element.easing = $this.data('easing') || [250, 20];
    element.bias = ($target ? Number($target.data('bias')) : Number($this.data('bias'))) || 0;
    element.property = $this.data('effect') || 'fadeIn';
    element.offsetY = $target ? $target.offset().top : $this.offset().top;
    _this.elements.push(element);
  });

  this.scrollChecker();
  this.bind();
};

/**
 * 監視を開始する
 */
ScrollVelocity.prototype.bind = function () {

  var _this = this;

  $(window)
    .on('resize.ScrollVelocity', function () {
      _this.resize();
    })
    .on('scroll.ScrollVelocity', function () {
      _this.scrollChecker();
    });
};

/**
 * ウィンドウリサイズ時の処理
 */
ScrollVelocity.prototype.resize = function () {
  this.windowHeight = $(window).height();

  _.each(this.elements, function (_element) {
    var element = _element;
    var $this = $(element);
    var $target = $this.data('target') && $($this.data('target'));
    element.offsetY = $target ? $target.offset().top : $this.offset().top;
  });
};

/**
 * スクロール時に実行する
 */
ScrollVelocity.prototype.scrollChecker = function () {

  var _this = this;

  var scrollOffset = $(window).scrollTop();
  var threshold = (scrollOffset + this.windowHeight) - this.threshold;

  if (!this.allShown) {

    _.each(this.elements, function (_element) {

      var element = _element;

      // 位置を確認して表示する
      if (!element.isShown && threshold > element.offsetY - element.bias) {

        element.isShown = true;
        element.style.display = 'none';

        var willMoveOpacity = _.isObject(element.property)
          && Object.prototype.hasOwnProperty.call(element.property, 'opacity');

        velocity(element, element.property, {
          display: 'block',
          delay: element.delay,
          easing: element.easing,
          duration: element.duration,
          begin: function () {
            $(element).trigger('scrollVelocityBegin');
            if (!willMoveOpacity) element.style.opacity = 1;
          },
          complete: function () {
            $(element).trigger('scrollVelocityComplete');
          }
        });

        _this.shownCount += 1;

        // 全部表示したら、リスナーを止める
        if (_this.shownCount === _this.length) {
          _this.allShown = true;
          $(window).off('scroll.ScrollVelocity resize.ScrollVelocity');
        }
      }
    });
  }
};

module.exports = ScrollVelocity;
