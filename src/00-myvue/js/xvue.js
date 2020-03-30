/**
new XVue({

}) 
*/

class XVue{
  constructor(options){
    this.$options = options;

    //处理data选项
    this.$data = options.data;
    // 响应化
    this.observe(this.$data)

    // this --> vue实例
    new Compile(options.el,this);

    // new Watcher();
    // this.$data.test;
  }

  observe(data){
    if( !data || typeof data !== 'object'){
      return;
    }
    // 遍历对象
    Object.keys(data).forEach((key)=>{
      this.defineReactive(data,key,data[key])
      // 代理到 vm 上
      this.proxyData(key)
    })
  }
  proxyData(key){
    Object.defineProperty(this,key,{
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key] = newVal;
      }
    })
  }

  defineReactive(obj,key,val){
    const dep = new Dep();
    Object.defineProperty(obj,key,{
      get(){
        // 将Dep.target添加到dep中
        Dep.tagart && dep.addDep(Dep.tagart)
        // console.log(dep.deps);
        
        // console.log("读取属性");
        return val;
      },
      set(newVal){
        if(newVal != val){
          val = newVal;
          // console.log(`${key}更新了，新值:${newVal}`)
          dep.notify();
        }
      }
    })
  }
}

class Dep{
  constructor(){
    this.deps = [];
  }
  addDep(dep){
    this.deps.push(dep)
  }
  notify(){
    console.log(this.deps);
    this.deps.forEach(dep=>dep.update())
  }
}

class Watcher{
  constructor(vm,key,cb){
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.tagart = this;
    // 读取vm[key]属性，则触发 key属性的 get函数。
    // 添加 watcher 到 dep
    this.vm[key];   
    Dep.tagart = null;
  }
  update(){
    console.log('属性更新了');
    
    this.cb.call(this.vm,this.vm[this.key]);
  }
}