// 重写数组中的部分方法

let oldArrayProto = Array.prototype

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods  = [
    // 找到所有变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => {
    newArrayProto[method] = function(...args) { // 重写数组方法
        const result = oldArrayProto[method].call(this,...args) // 内部调用原来的方法 函数的劫持 切片编程 

        // 需要对新增的数据进行劫持
        let inserted;
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
            default:
                break;
        }
        // 对新增的属性进行观测
        if(inserted) {
            ob.observeArray(inserted)
        }
        return result
    }
})
