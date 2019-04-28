/**
 * 定义一个专门用于解析模板内容的类
 */
class Compile {
    constructor (vm) {
        console.log(vm)
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
            // 如果是元素，需要解析指令
            if (this.isElementNode(node) == 1) {
                
            } else {
            // 如果是文本节点，需要解析插值表达式
            }
        })
    }

    /* 工具方法 */
    toArray(likeArray) {
        return [].slice.call(likeArray)
    }

    isElementNode(node) {
        // nodeType节点类型： 1-元素节点  3-文本节点
        return node.nodeType == 1
    }
}