// 依赖
class Dep {
  constructor() {
    // 给每个Dep一个集合. 里面的元素不会重复
    this.subscribers = new Set();
  }

  addEffect(effect) {
    //往集合中添加元素，不是push，是add
    this.subscribers.add(effect)
  }

  //通知所有subscribers执行
  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}


const info = { counter: 100 }
const dep = new Dep();

function doubleCounter() {
  console.log(info.counter * 2)
}

function powerCounter() {
  console.log(info.counter * info.counter)
}

// doubleCounter();
// powerCounter()
// 当有数据发生改变的时候，如果有地方有依赖，应该再次执行
dep.addEffect(doubleCounter);
dep.addEffect(powerCounter);

// 发生改变，直接调用dep.notify
info.counter++;
dep.notify()