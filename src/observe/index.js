import { newArrayProto } from "./array"

class ObServer{
    constructor(data) {
        // 给劫持的数据加一个标识，同时也是为了让重写的数组方法能调用observeArray方法
        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable:false // 将__ob__变成不可枚举
        })
        // 需要判断是不是数组
        if(Array.isArray(data)) {
            // 重写数组中的7个变异方法
            // 观测数组里的每一个值，然后进行劫持
            data.__proto__ = newArrayProto
            this.observeArray(data)
        }else {
            this.walk(data)
        }
    }
    walk(data) {
        // debugger
        // let textData = data
        // 循环对象，对属性进行劫持 重新定义属性
        Object.keys(data).forEach(key=> defineReactive(data,key,data[key]))
    }
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}
export function defineReactive(target,key,value) { // 属性劫持
    observe(value)
    Object.defineProperty(target,key, {
        get() {
            console.log('key',key)
            return value
        },
        set(newValue) {
            if(newValue === value) return
            observe(newValue)
            value = newValue
        }
    })
}
export function observe(data) {
    // 对对象进行劫持，先判断data的类型
    if(typeof data !== 'object' || data === null) {
        return
    }

    // 判断是否被劫持过
    if(data.__ob__ instanceof ObServer) {
        return data.__ob__
    }
    return new ObServer(data); 
}