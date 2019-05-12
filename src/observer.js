/**
 * Observer用于给data中所有的数据添加getter和setter
 */
class Observer {
    constructor(data) {
        this.data = data

        this.walk(data)
    }
    /* 核心方法 */
    /* 遍历data中所有的数据，添加getter和setter方法 */
    walk (data) {
        if (!data || typeof data !== 'object') {
            return
        }

        Object.keys(data).map(key => {
            // 给data对象的key设置getter和setter
            this.defineReactive(data, key, data[key])
            // 如果data[key]是一个复杂类型，则递归处理
            this.walk(data[key])
        })
    }

    /**
     *  定义响应式数据（数据劫持）
     *  data中的每一个数据都应该维护一个dep对象，dep保存了所有的订阅了该数据的订阅者
     */
    defineReactive (obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                // 如果Dep.target中有watcher对象，存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set (newValue) {
                if (value === newValue) return 
                value = newValue
                // 如果新设置的值也是一个对象，要对这个对象做劫持
                that.walk(newValue)

                // 发布通知，让所有订阅者更新内容 
                dep.notify()
            }
        })
    }
}