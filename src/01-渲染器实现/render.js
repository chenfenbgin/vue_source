const h = (tag, props, children) => {
  //vnode就是一个 javascript对象， -> {}
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  //vnode -> element
  // 1.创建出真实的原生，并且在vnode上保留el
  const el = vnode.el = document.createElement(vnode.tag)

  // 2.处理props 
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];

      // 如果是传入函数，需要进行特殊处理， 对事件监听的判断
      if (key.startsWith("on")) {
        // onclick，截掉on，剩下方法
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }

    }
  }

  // 3.处理children,我们只处理数组和字符串
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(item => {
        console.log('item', item)
        // 直接使用递归调用
        mount(item, el);
      })
    }
  }

  // 4. 将el挂载到container上
  container.appendChild(el);
}


// 传进来的是两个vnode
const patch = (n1, n2) => {

  // 当类型都不相同的时候，就是这么做的
  if (n1.tag !== n2.tag) {
    // n1.el是可以拿到当前那个元素的，要想移除掉，需要拿到当前元素的父元素
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {

    // 1.取出element对象，并且在n2中进行保存
    const el = n2.el = n1.el

    // 2. 处理props, 当n1.props为空的时候，给它一个{}
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    // 2.1获取所有的newProps添加到el里面
    for (const key of newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (oldValue !== newValue) {
        if (key.startsWith("on")) {
          const value = oldProps[key]
          el.addEventListener(key.slice(2).toLowerCase(), value)
        } else {
          el.setAttribute(key, newValue)

        }
      }
    }

    // 2.2 删除旧的props
    for (const key of oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          const value = oldProps[key]
          el.removeEventListener(key.slice(2).toLowerCase(), value)
        } else {
          el.removeAttribute(key)
        }
      }
    }


    // 3. 处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    // 情况一： newChild本身就是一个String
    if (typeof newChildren === "string") {
      //边界情况（edge case)
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        } else {
          el.innerHTML = newChildren;
        }
      }
    } else {
      // 情况二： newChild本身就是一个数组
      if (typeof oldChildren === "string") {
        el.innerHTML = ""
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // oldChildren: [v1, v2, v3]
        // newChildren: [v1, v2, v3, v4, v5]
        //  1.前面有相同节点的元素进行patch操作
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // 2. newChildren > oldChildren
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        // 3. newChildren.length < oldChildren.length
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }

    }

  }
}