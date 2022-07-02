// 依赖
class Dep {
  constructor() {
    // 1.给每个Dep一个集合. 里面的元素不会重复
    this.subscribers = new Set();
  }

  // addEffect(effect) {
  //   // 2.往集合中添加元素，不是push，是add
  //   this.subscribers.add(effect)
  // }

  // 6、封装depend()
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  // 3.通知所有subscribers执行
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}

// 5、封装watchEffect
let activeEffect = null;
function watchEffect(effect) {
  // dep.addEffect(effect);
  activeEffect = effect;
  // dep.depend();
  effect();
  activeEffect = null;
}

// 8、返回dep对象
// Map({key:value}): 要求key是一个字符串
// WeakMap({key(对象): value}): 要求key是一个对象，这个对象是弱引用，弱引用的好处设置为空，垃圾回收机制会回收掉
const targetMap = new WeakMap();
function getDep(target, key) {
  // 1.根据target对象取出对应的Map对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 2. 根据key(比如counter,name)取出具体的dep对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

// 7、 vue2 对 row 进行劫持传入的对象
function reactive(raw) {
  // Objecet拿到所有的key,然后遍历它
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key);
    let value = raw[key];

    Object.defineProperty(raw, key, {
      // 获取数据使用get,只要调用watchEffect,里面使用了info.name,就会来到这里
      get() {
        dep.depend();
        return value;
      },
      // 设置数据使用set
      set(newValue) {
        value = newValue;
        dep.notify();
      },
    });
  });
  return raw;
}

// 上面👆是封装的响应式代码， 下面👇都是测试代码

const info = reactive({ counter: 100, name: "chen" });
// info.name = "feng";

const foo = { height: 1.23 };

// const dep = new Dep();

// watchEffect1
watchEffect(function () {
  console.log("1:", info.counter * 2, info.name);
});

// watchEffect2
watchEffect(function () {
  console.log("2:", info.counter * info.counter);
});

// watchEffect3
watchEffect(function () {
  console.log("3:", info.counter + 10);
});

watchEffect(function () {
  console.log("4:", foo.height);
});

// doubleCounter();
// powerCounter()
// 4、当有数据发生改变的时候，如果有地方有依赖，应该再次执行
// dep.addEffect(doubleCounter);
// dep.addEffect(powerCounter);

// 发生改变，直接调用dep.notify
info.counter++;
info.name = "xiu";
// dep.notify();
