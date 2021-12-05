const info = {counter: 100}

function doubleCounter(){
  console.log(info.counter * 2)
}

doubleCounter();
// 当有数据发生改变的时候，如果有地方有依赖，应该再次执行

info.counter ++;