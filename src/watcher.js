/**
 * watcher模块负责把compile模块和observer模块关联起来
 */
class Watcher {
    /**
     * 
     * @param {*} vm 当前的vue实例
     * @param {*} expr data中数据的名字
     * @param {*} cb 数据发生改变的回调
     */
    constructor (vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        // this表示就是新创建的watcher对象
        // 存储到Dep.target属性上
        Dep.target = this

        // 需要把expr的旧值存起来
        this.oldValue = this.getVmValue(vm, expr)

        // 清空Dep.target
        Dep.target = null
    }

    // 对外暴露的一个方法，这个方法用于更新页面
    update () {
        // 对比expr是否发生改变，如果发生改变，需要调用cb
        let oldValue = this.oldValue
        let newValue = this.getVmValue(this.vm, this.expr)

        if (oldValue !== newValue) {
            this.cb(newValue, oldValue)
        }
    }

    // 获取vm中的数据
    getVmValue (vm, expr) {
        let data = vm.$data
        expr.split('.').map(item => {
            data = data[item.trim()]
            // console.log(data)
        })
        return data
    }

}

/**
 * Dep对象用于管理所有的订阅者和通知这些订阅者
 */
class Dep {
    constructor () {
        // 用于管理订阅者
        this.subs = []
    }

    // 添加订阅者
    addSub (watcher) {
        this.subs.push(watcher)
    }

    // 通知
    notify () {
        // 遍历所有的订阅者，调用watcher的update方法
        this.subs.map(sub => {
            sub.update()
        })
    }
}