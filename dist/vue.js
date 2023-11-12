(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    // const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

    // 对模板进行编译
    function parseHTML(html) {
      // html最开始一定是<
      // 最终需要转化成一颗抽象语法树
      function start(tag, attrs) {
        console.log(tag, attrs, "开始");
      }
      function chars(text) {
        console.log(text, '文本');
      }
      function end(tag) {
        console.log(tag, '结束');
      }
      function advance(n) {
        html = html.substring(n);
      }
      function parseStartTag() {
        var start = html.match(startTagOpen);
        if (start) {
          var match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length);
          // console.log(match,html);
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] || true
            });
          }
          // 存在>时，要把>删掉
          if (_end) {
            advance(_end[0].length);
          }
          return match;
        }
        // 如果不是开始标签的结束就一直匹配

        return false;
      }
      while (html) {
        // 如果textEnd为0，说明是一个开始标签
        // 如果textEnd>0,说明是文本的介绍位置
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            // 解析到开始标签
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }
        // 截取文本的内容
        if (textEnd > 0) {
          var text = html.substring(0, textEnd);
          if (text) {
            chars(text);
            advance(text.length);
          }
        }
      }
      console.log(html);
    }
    function compileToFunction(template) {
      // 1、将template转为ast语法书
      // debugger
      parseHTML(template);
      // 2、生产render方法（render方法返回的就是虚拟DOM）
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }

    // 重写数组中的部分方法

    var oldArrayProto = Array.prototype;

    // newArrayProto.__proto__ = oldArrayProto
    var newArrayProto = Object.create(oldArrayProto);
    var methods = [
    // 找到所有变异方法
    'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // 重写数组方法
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法 函数的劫持 切片编程 

        // 需要对新增的数据进行劫持
        var inserted;
        var ob = this.__ob__;
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        // 对新增的属性进行观测
        if (inserted) {
          ob.observeArray(inserted);
        }
        return result;
      };
    });

    var ObServer = /*#__PURE__*/function () {
      function ObServer(data) {
        _classCallCheck(this, ObServer);
        // 给劫持的数据加一个标识，同时也是为了让重写的数组方法能调用observeArray方法
        Object.defineProperty(data, '__ob__', {
          value: this,
          enumerable: false // 将__ob__变成不可枚举
        });
        // 需要判断是不是数组
        if (Array.isArray(data)) {
          // 重写数组中的7个变异方法
          // 观测数组里的每一个值，然后进行劫持
          data.__proto__ = newArrayProto;
          this.observeArray(data);
        } else {
          this.walk(data);
        }
      }
      _createClass(ObServer, [{
        key: "walk",
        value: function walk(data) {
          // debugger
          // let textData = data
          // 循环对象，对属性进行劫持 重新定义属性
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          data.forEach(function (item) {
            return observe(item);
          });
        }
      }]);
      return ObServer;
    }();
    function defineReactive(target, key, value) {
      // 属性劫持
      observe(value);
      Object.defineProperty(target, key, {
        get: function get() {
          console.log('key', key);
          return value;
        },
        set: function set(newValue) {
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
        }
      });
    }
    function observe(data) {
      // 对对象进行劫持，先判断data的类型
      if (_typeof(data) !== 'object' || data === null) {
        return;
      }

      // 判断是否被劫持过
      if (data.__ob__ instanceof ObServer) {
        return data.__ob__;
      }
      return new ObServer(data);
    }

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
    }
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[target][key];
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }
    function initData(vm) {
      var data = vm.$options.data;
      data = typeof data === 'function' ? data.call(vm) : data;
      vm._data = data;
      // 对数据进行劫持
      observe(data);

      // 将vm._data用vm来代理
      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        // 初始化
        // vm.$options 获取用户的options
        var vm = this;
        vm.$options = options;

        // 初始化状态
        initState(vm);
        if (options.el) {
          vm.$mount(options.el);
        }
      };
      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;
        if (!ops.render) {
          // 先判断是否有render函数
          var template; // 没有render判断是否有template，没有template就采用外部的template
          if (!ops.template && el) {
            template = el.outerHTML;
          } else {
            if (el) {
              template = ops.template; // 如果有el则采用模板内容
            }
          }

          console.log(template);
          // 写了template就采用写的template
          if (template) {
            // 对模板进行编译
            var render = compileToFunction(template);
            ops.render = render;
          }
        }
        ops.render;
      };
    }

    function Vue(options) {
      //options是用户的选项
      this._init(options);
    }
    initMixin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
