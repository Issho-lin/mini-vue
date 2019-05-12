/**
 * 定义一个专门用于解析模板内容的类
 */
class Compile {
    constructor (vm) {
        // console.log(vm)
        // new的Vue实例
        this.vm = vm
        // new Vue传递的选择器
        this.el = typeof vm.$el === 'string' ? document.querySelector(vm.$el) : vm.$el

        // 编译模板
        if (this.el) {
            // 1.el中所有的子节点都放入到内存中，fragment，避免回流和重绘
            let fragment = this.node2fragment(this.el)
            // 2.在内存中编译fragment
            this.compile(fragment)
            // 3.把fragment一次性的添加到页面
            this.el.appendChild(fragment)
        }
    }

    /* 核心方法 */
    node2fragment(node) {
        let fragment = document.createDocumentFragment()
        // 把el中所有的子节点挨个添加到文档碎片中
        let childNodes = node.childNodes
        this.toArray(childNodes).map(node => {
            // 把所有子节点添加到fragment中
            fragment.appendChild(node)
        })
        return fragment
    }

    /* 编译文档碎片（内存中）*/
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).map(node => {
            // 编译子节点
            if (this.isElementNode(node)) {
                // 如果是元素，需要解析指令
                this,this.complieElement(node)
                
            } else if (this.isTextNode(node)) {
                // 如果是文本节点，需要解析插值表达式
                this.compileText(node)
            }

            // 如果当前节点还有子节点，需要递归解析
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }
    /* 解析html标签 */
    complieElement(node) {
        // 1.获取到当前节点下的所有属性
        let attributes = node.attributes
        this.toArray(attributes).map(attr => {
            let expr = attr.value
            let type = attr.name.slice(2)
            if (this.isDirective(attr.name)) {
        // 2.解析vue的指令（所有v-开头的属性）
                // 解析v-on
                if (this.isEventDirective(type)) {
                    CompileUtil.eventHandler(node, this.vm, expr, type)
                } else {
                    CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
                }
            }

        })
    }
    /* 解析文本标签 */
    compileText(node) {
        // console.log(node)
        CompileUtil.mustache(node, this.vm)
    }

    /* 工具方法 */
    toArray(likeArray) {
        return [].slice.call(likeArray)
    }

    isElementNode(node) {
        // nodeType节点类型： 1-元素节点  3-文本节点
        return node.nodeType == 1
    }

    isTextNode(node) {
        return node.nodeType === 3
    }

    isDirective(attr) {
        return attr.startsWith('v-')
    }

    isEventDirective(type) {
        return type.split(':')[0] === 'on'
    }
}

let CompileUtil = {
    // 处理插值表达式
    mustache (node, vm) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            let expr = RegExp.$1
            node.textContent = txt.replace(reg, this.getVmValue(vm, expr.trim()))
            new Watcher(vm, expr, newValue => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    },
    // 处理v-text指令
    text (node, vm, expr) {
        node.textContent = this.getVmValue(vm, expr)
        // 通过watcher对象，监听expr的数据变化，执行回调函数
        window.watcher = new Watcher(vm, expr, newValue => {
            node.textContent = newValue
        })
    },
    // 处理v-html指令
    html (node, vm, expr) {
        node.innerHTML = this.getVmValue(vm, expr)
        new Watcher(vm, expr, newValue => {
            node.innerHTML = newValue
        })
    },
    model (node, vm, expr) {
        let self = this
        node.value = this.getVmValue(vm, expr)
        // 实现双向数据绑定
        node.addEventListener('input', function () {
            self.setVmValue(vm, expr, this.value)
        })
        new Watcher(vm, expr, newValue => {
            node.value = newValue
        })
    },
    eventHandler (node, vm, expr, type) {
        let eventType = type.split(':')[1]
        // console.log(eventType)
        let fn = vm.$methods && vm.$methods[expr]
        // console.log(fn)
        if (eventType && fn) {
            node.addEventListener(eventType, vm.$methods[expr].bind(vm))
        }
    },
    // 获取vm中的数据
    getVmValue (vm, expr) {
        let data = vm.$data
        expr.split('.').map(item => {
            data = data[item]
            // console.log(data)
        })
        return data
    },
    // 设置vm中的数据
    setVmValue (vm, expr, value) {
        let data = vm.$data
        let arr = expr.split('.')
        arr.map((item, index) => {
            if (index < arr.length - 1) {
                data = data[item]
            } else {
                data[item] = value
            }
        })
    }
}