// 依赖
class Dep {
  constructor() {
    // 给每个Dep一个集合. 里面的元素不会重复
    this.subscribers = new Set();
  }

  // addEffect(effect) {
  //   //往集合中添加元素，不是push，是add
  //   this.subscribers.add(effect)
  // }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  //通知所有subscribers执行
  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  // dep.addEffect(effect);
  activeEffect = effect;
  dep.depend();
  effect();
  activeEffect = null;
}


// Map({key:value}): key是一个字符串
// WeakMap({key(对象): value}): key是一个对象， 弱引用
const targetMap = new WeakMap();
function getDep(target, key) {
  // 1.根据对象取出对应的Map对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap)
  }

  // 2. 取出具体的dep对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep)
  }
  return dep;
}

// vue2 对 row 进行劫持传入的对象
function reactive(raw) {
  // Objecet拿到所有的key,然后遍历他
  Object.keys(raw).forEach(key => {
    const dep = getDep(raw, key);
    let value = raw[key]

    Object.defineProperty(raw, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newValue) {
        value = newValue;
        dep.notify();
      }
    })

  })
  return raw
}



// 上面👆是封装的响应式代码， 下面👇都是测试代码

const info = reactive({ counter: 100, name: "chen" });
info.name = '1232'

const foo = { height: 1.23 }

const dep = new Dep();

// watchEffect1
watchEffect(function () {
  console.log(info.counter * 2, info.name)
})

// watchEffect2
watchEffect(function () {
  console.log(info.counter * info.counter)
})

// watchEffect3
watchEffect(function () {
  console.log(info.counter + 10)
})

watchEffect(function () {
  console.log(foo.height)
})

// doubleCounter();
// powerCounter()
// 当有数据发生改变的时候，如果有地方有依赖，应该再次执行
// dep.addEffect(doubleCounter);
// dep.addEffect(powerCounter);

// 发生改变，直接调用dep.notify
info.counter++;
dep.notify()