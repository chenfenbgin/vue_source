// 渲染器实现-----一、h函数的实现，自定义h函数
const h = (tag, props, children) => {
  //vnode就是一个 javascript对象， -> {}
  return {
    tag,
    props,
    children,
  };
};

// 渲染器实现-----二、创建、处理、挂载DOM元素
//     a、创建真实的DOM元素，
//     b、处理遍历props，
//     c、对第三个参数进行处理，传入的是子节点进行处理
const mount = (vnode, container) => {
  //vnode -> element， 把vnode转成真实的DOM元素，通过createElement就行了
  // a、创建出真实的元素，并且在vnode上保留真实的DOM：el，后面会使用到的
  const el = (vnode.el = document.createElement(vnode.tag));

  // b、处理props， 如果标签上有class等属性。
  // h("div", { class: "why" }, [
  //   h("h2", null, "当前计数: 100"),
  //   h("button", { onclick: function () {} }, "+1"),
  // ])
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];

      // 如果是传入函数，需要进行特殊处理， 对事件监听的判断
      if (key.startsWith("on")) {
        //以on开头的进行判断
        // onclick，截掉on，剩下Click,将其转成小写click，
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // c、处理children,我们只处理数组和字符串
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else {
      vnode.children.forEach((item) => {
        console.log("item", item);
        // d、直接使用递归调用
        mount(item, el);
      });
    }
  }

  // e. 将el挂载到container上
  container.appendChild(el);
};

// 渲染器实现-----三、patch
// 传进来的是两个vnode
const patch = (n1, n2) => {
  // 第一步：比较类型：当类型都不相同的时候，就是这么做的，直接移除DOM
  if (n1.tag !== n2.tag) {
    // n1.el是可以拿到当前这个元素的，因为之前我们把真实DOM保存到vnode里面了(在创建真实元素的时候)
    // 要想移除掉，需要拿到当前元素的父元素
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent);
  } else {
    // 比较类型：类型相同的时候
    // 1.取出element对象，并且在n2中进行保存
    const el = (n2.el = n1.el);

    // 2. 处理props, 当n1.props为空的时候，给它一个{}
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    // 2.1获取所有的newProps添加到el里面
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      // 只有当id里面的值不相同是，才设置key/value
      if (oldValue !== newValue) {
        if (key.startsWith("on")) {
          const value = oldProps[key];
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }

    // 2.2 删除旧的props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          const value = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.removeAttribute(key);
        }
      }
    }

    // 3. 处理children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];

    // 情况一： newChild本身就是一个String
    if (typeof newChildren === "string") {
      //边界情况（edge case)
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        } else {
          el.innerHTML = newChildren;
        }
      }
    } else {
      // 情况二： newChild本身就是一个数组
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach((item) => {
          mount(item, el);
        });
      } else {
        // 情况三：都是数组
        // oldChildren: [v1, v2, v3]
        // newChildren: [v1, v2, v3, v4, v5]
        //  1.前面有相同节点的元素进行patch操作
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }

        // 2. 添加操作： newChildren > oldChildren，
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el);
          });
        }

        // 3.移除操作： newChildren.length < oldChildren.length
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
