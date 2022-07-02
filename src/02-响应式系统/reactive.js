// 依赖
class Dep {
  constructor() {
    // 1、给每个Dep一个集合. 里面的元素不会重复
    this.subscribers = new Set();
  }

  // addEffect(effect) {
  //   // 2、往集合中添加元素，不是push，是add
  //   this.subscribers.add(effect)
  // }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  // 3、通知所有subscribers执行
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}

let activeEffect = null;
function watchEffect(effect) {
  // dep.addEffect(effect);
  activeEffect = effect;
  dep.depend();
  effect(); //第一次就执行
  activeEffect = null;
}

const info = { counter: 100, name: "chem" };
const dep = new Dep();

// watchEffect1
watchEffect(function doubleCounter() {
  console.log(info.counter * 2, info.name);
});

// watchEffect2
watchEffect(function powerCounter() {
  console.log(info.counter * info.counter);
});

// watchEffect3
watchEffect(function powerCounter() {
  console.log(info.counter + info.counter, info.name);
});

// doubleCounter();
// powerCounter()
// 4、当有数据发生改变的时候，如果有地方有依赖，应该再次执行（缺陷1）
// dep.addEffect(doubleCounter);
// dep.addEffect(powerCounter);

// 发生改变，直接调用dep.notify
info.counter++;
dep.notify(); //（缺陷2：依赖需要自己调notify()）

info.name = "lisi";
dep.notify(); //（缺陷3:不应该依赖都收集到dep中）
