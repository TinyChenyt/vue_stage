import { compileToFunction } from "./compiler"
import { initState } from "./state"

export function initMixin(Vue) {
    Vue.prototype._init = function(options) { // 初始化
        // vm.$options 获取用户的options
        const vm = this
        vm.$options = options 

        // 初始化状态
        initState(vm)

        if(options.el) {
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function(el) {
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options
        if(!ops.render) { // 先判断是否有render函数
            let template; // 没有render判断是否有template，没有template就采用外部的template
            if(!ops.template && el) {
                template = el.outerHTML
            }else {
                if(el) {
                    template = ops.template // 如果有el则采用模板内容
                }
            }
            console.log(template);
            // 写了template就采用写的template
            if(template) {
                // 对模板进行编译
                const render = compileToFunction(template)
                ops.render = render
            }
        }

        ops.render;
    }
}

