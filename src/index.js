import React, { Component } from 'react'
import PropTypes from 'prop-types'

import BScroll from 'better-scroll'
import Loading from './loading/loading'
import Bubble from './bubble/bubble'
import './style.css';


class Scroll extends Component {

  static defaultProps = {
    probeType: 3,
    click: true,
    startY: 0,
    scrollY: true,
    scrollX: false,
    freeScroll: true,
    scrollbar: false,
    pullDownRefresh: ()=>{},
    pullUpLoad: ()=>{},
    bounce: true,
    preventDefaultException: {
      className: /(^|\s)originEvent(\s|$)/,
      tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|TABLE)$/,
    },
    eventPassthrough: '',
    isPullUpTipHide: false,
    disabled: false,
    stopPropagation: true,
    noMore:false,
  };

  static propTypes = {
    children: PropTypes.any,
    probeType: PropTypes.number,
    startY: PropTypes.number,
    click: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
    scrollY: PropTypes.bool,
    scrollX: PropTypes.bool,
    freeScroll: PropTypes.bool,
    scrollbar: PropTypes.bool,
    pullDownRefresh:PropTypes.func,
    pullUpLoad: PropTypes.func,
    doScroll: PropTypes.func,
    doScrollStart: PropTypes.func,
    doScrollEnd: PropTypes.func,
    preventDefaultException: PropTypes.object,
    eventPassthrough: PropTypes.string,
    isPullUpTipHide: PropTypes.bool,
    bounce: PropTypes.bool,
    disabled: PropTypes.bool,
    stopPropagation: PropTypes.bool,
    noMore: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);

    this.scroll = null; // scroll 实例

    this.isRebounding = false; //反弹
    this.pullDownInitTop = -50;

    this.state = {
      isPullUpLoad: false,
      beforePullDown: true,
      pulling: false, //下拉获取数据中
      pullDownErr: false, //下拉获取数据失败
      pullUpErr:false, //上拉获取数据失败
      pullDownStyle: {
        top: `${this.pullDownInitTop}px`,
      },
      bubbleY: 0,
    }

  }

  componentDidMount() {
    this.initScroll()
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      if (!this.state.pulling) {
        this.scroll.refresh()
      }
      if (prevProps.disabled !== this.props.disabled) {
        this.props.disabled ? this.scroll.disable() : this.scroll.enable();
      }
    }
  }

  componentWillUnmount() {
    this.scroll.stop();
    this.scroll.destroy();
    this.scroll = null;
    clearTimeout(this.TimerA);
    clearTimeout(this.TimerB);
  }

  initScroll() {
    let { probeType, click, startY, scrollY, scrollX, freeScroll, scrollbar, pullDownRefresh, pullUpLoad, preventDefaultException, eventPassthrough, bounce,stopPropagation } = this.props;

    this.options = {
      probeType,
      click,
      startY,
      scrollY,
      freeScroll,
      scrollX,
      scrollbar,
      pullDownRefresh: !! pullDownRefresh,
      pullUpLoad: !! pullUpLoad,
      preventDefaultException,
      eventPassthrough,
      bounce: bounce,
      stopPropagation:stopPropagation,
    };
    let wrapper = this.refs.$dom;
    this.scroll = new BScroll(wrapper, this.options);
    this.initEvents();
  }

  initEvents() {
    if (this.options.pullUpLoad) {  //上拉事件
      this._initPullUpLoad()
    }
    if (this.options.pullDownRefresh) { //下拉事件
      this._initPullDownRefresh()
    }
    if (this.props.doScrollStart) {
      this.scroll.on('scrollStart', (pos) => {
        this.props.doScrollStart(pos)
      })
    }
    if (this.props.doScroll) {
      this.scroll.on('scroll', (pos) => {
        this.props.doScroll(pos)
      })
    }
    if (this.props.doScrollEnd) {
      this.scroll.on('scrollEnd', (pos) => {
        this.props.doScrollEnd(pos)
      })
    }
    if (this.props.disabled) {
      this.scroll.disable()
    }
  }


  getScrollObj = () => {
    return this.scroll
  };

  //下拉刷新
  _initPullDownRefresh() {
    this.scroll.on('pullingDown', () => { //开始刷新
      this.setState({
        beforePullDown: false,
        pulling: true,
      });

      this.props.pullDownRefresh()
        .then(() => {
          if (!this.scroll)return;
          this.setState({
            pulling: false,
            pullDownErr: false
          });
        })
        .catch(()=>{
          this.setState({
            pulling: false,
            pullDownErr: true
          });
        })
        .finally(()=>{
          this._reboundPullDown()//反弹
            .then(()=>{
              this._afterPullDown()
            })
        })
    });

    this.scroll.on('scroll', (pos) => {
      const { beforePullDown } = this.state;

      if (pos.y < 0) {
        return
      }

      if (beforePullDown) {
        this.setState({
          bubbleY: Math.max(0, pos.y + this.pullDownInitTop),
          pullDownStyle: {
            top: `${Math.min(pos.y + this.pullDownInitTop, 10)}px`,
          },
        })
      } else {
        this.setState({
          bubbleY: 0,
        })
      }

      if (this.isRebounding) {
        this.setState({
          pullDownStyle: {
            top: `${10 - (50 - pos.y)}px`,
          },
        })
      }
    })
  }

  //反弹
  _reboundPullDown = () => {
    let { stopTime = 600 } = this.options.pullDownRefresh;

    return new Promise((resolve) => {
      this.TimerA = setTimeout(() => {
        this.isRebounding = true;
        this.scroll.finishPullDown();
        resolve()
      }, stopTime)
    })
  };

  _afterPullDown() {
    this.TimerB = setTimeout(() => {
      this.setState({
        beforePullDown: true,
        pullDownErr: false,
        pullDownStyle: {
          top: `${this.pullDownInitTop}px`,
        },
      });
      this.isRebounding = false;
      this.scroll.refresh()
    }, this.scroll.options.bounceTime)
  }

  //上拉加载
  _initPullUpLoad = () => {
    this.scroll.on('pullingUp', () => {
      this.setState({
        isPullUpLoad: true,
        pullUpErr: false
      });

      this.props.pullUpLoad()
        .catch(() => {
          if (!this.scroll) { return }
          this.setState({
            pullUpErr: true
          })
        })
        .finally(()=>{
          if (!this.scroll) { return }
          this.setState({
            isPullUpLoad: false,
          });
          this.scroll.finishPullUp();
          this.scroll.refresh()
        })
    })
  };

  //上拉加载render
  renderPullUpLoad() {
    let { pullUpLoad, isPullUpTipHide, noMore } = this.props;
    const { pullUpErr } = this.state;
    if (pullUpLoad && isPullUpTipHide) {
      return ''
    }

    if (pullUpLoad && this.state.isPullUpLoad) {
      return (
        <div className="b-pullup-wrapper">
          <div className="after-trigger" style={{ lineHeight: '.32rem' }}>
            <i className="loading-icon"/>
            <span style={{ color: '#999999', fontSize: '.28rem' }}> 加载中...</span>
          </div>
        </div>
      )
    }
    if (pullUpLoad && !this.state.isPullUpLoad) {
      return (
        <div className="b-pullup-wrapper">
          <div className="before-trigger">
            <span style={{ color: '#999999', fontSize: '.28rem' }}>{ pullUpErr ? '加载失败' : noMore ? '我是有底线的' : '加载完成' }</span>
          </div>
        </div>
      )

    }
  }

  //下拉刷新render
  renderPullUpDown() {
    let { pullDownRefresh } = this.props;
    let { beforePullDown, pulling, pullDownErr, pullDownStyle } = this.state;

    if (pullDownRefresh && beforePullDown) {
      return (
        <div className="b-pulldown-wrapper" style={pullDownStyle} >
          <div className="before-trigger">
            <Bubble y={this.state.bubbleY}/>
          </div>
        </div>

      )
    }

    if (pullDownRefresh && !beforePullDown && pulling) {
      return (
        <div className="b-pulldown-wrapper" style={pullDownStyle}>
          <div className="after-trigger">
            <div className="loading">
              <Loading/>
            </div>
          </div>
        </div>
      )
    }

    if (pullDownRefresh && !beforePullDown && !pulling) {
      return (
        <div className="b-pulldown-wrapper" style={pullDownStyle}>
          <div className="after-trigger">
            <div><span
              style={{ fontSize: '.24rem' }}>{pullDownErr ? '刷新失败' :'刷新完成'}</span>
            </div>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="b-wrapper" ref="$dom">
        <div className="b-scroll-content">
          {this.props.children}
          {this.renderPullUpLoad()}
        </div>
        {this.renderPullUpDown()}
      </div>
    )
  }
}

export default Scroll
