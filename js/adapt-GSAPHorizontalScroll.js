import Adapt from 'core/js/adapt';

class GSAPHorizontalScroll extends Backbone.Controller {
  initialize() {
    this.listenTo(Adapt, 'app:dataReady', this.onDataReady);
  }

  static get courseConfig() {
    return Adapt.course.get('_GSAPHorizontalScroll');
  }

  isEnabled() {
    return !(!GSAPHorizontalScroll.courseConfig || !GSAPHorizontalScroll.courseConfig._isEnabled);
  }

  onDataReady() {
    if (!this.isEnabled()) {
      return;
    }
    this.listenTo(Adapt, 'GSAP:ready', this.setupUpEventListeners);
  }

  setupUpEventListeners() {
    const modelTypes = ['article', 'block'];

    const modelEventNames = modelTypes.concat(['']).join('View:postRender ');

    this.listenTo(Adapt, modelEventNames, this.onViewRender);
  }

  onViewRender(view) {
    const model = view.model;

    const gsapHorizontalScroll = model.get('_GSAPHorizontalScroll');
    if (!gsapHorizontalScroll || !gsapHorizontalScroll._isEnabled) {
      return;
    }
    const $selector = view.$el.find(gsapHorizontalScroll.selector);
    const $horizontalScroll = view.$el.find(gsapHorizontalScroll.horizontalScroll);

    if ($selector.length) {
      $selector.addClass('has-gsaphorizontalscroll');
      const resizeObserver = new ResizeObserver(() => {
        Adapt.GSAP.ScrollTrigger.refresh();
      });
      this.listenToOnce(model, 'change:_isReady', () => {
        if (model.get('_isReady')) {
          this.setupHorizontalScroll($selector, $horizontalScroll);

          resizeObserver.observe($horizontalScroll[0]);
        }
      });
      this.listenTo(view, 'remove', () => {
        this.stopListening(model);
        resizeObserver.disconnect();
      });
    }
  }

  setupHorizontalScroll($view, $el) {
    const viewEl = $view[0];
    const el = $el[0];

    let scrollAmount = null;

    const getScrollAmount = () => {
      if (scrollAmount !== null) return scrollAmount;
      const viewWidth = el.scrollWidth;
      scrollAmount = -(viewWidth - window.innerWidth + window.innerWidth / 2);
      return scrollAmount;
    };
    const tween = Adapt.GSAP.lib.to(el, {
      x: getScrollAmount,
      duration: 3,
      ease: 'none'
    });

    Adapt.GSAP.ScrollTrigger.create({
      trigger: viewEl,
      start: 'top 10%',
      end: () => `+=${getScrollAmount() * -1}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true,
      markers: false
    });
  }
}

export default new GSAPHorizontalScroll();
