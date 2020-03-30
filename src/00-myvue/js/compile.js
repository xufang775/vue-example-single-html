class Compile{
  constructor(el,vm){
    this.$vm = vm;
    this.$el = document.querySelector(el);
    
    if(this.$el){
      // 提取宿主中模板内容到Fragment标签，dom操作会提高效率
      this.$fragment = this.node2Fragment(this.$el)
      // console.log(this.$fragment);
      // 编译模板内容，同时进行依赖收集
      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment)
      // console.log(this.$fragment);
      
    }
  }

  node2Fragment(el){
    const fragment = document.createDocumentFragment();
    let child;
    while(child = el.firstChild){
      fragment.appendChild(child);
    }
    return fragment;
  }
  compile(el){
    const childNodes = el.childNodes;
    // console.log(Array.from(childNodes));
    
    Array.from(childNodes).forEach(node =>{
      // console.log(node);
      
      // 判断节点类型
      if(node.nodeType === 1){
        // element节点
        // console.log('编译元素节点'+node.nodeName);
        this.compileElement(node)
      } else if(this.isInterpolation(node)){
        // 插值表达式
        // console.log('编译插值文本'+node.textContent);
        this.compileText(node);
      }
      // 递归子节点
      if(node.childNodes && node.childNodes.length>0){
        this.compile(node)
      }
    })
  }
  isInterpolation(node){
    let res = node.nodeType === 3 
    && /\{\{(.*)\}\}/.test(node.textContent);
    return res;
  }
  isDirective(attr){
    return attr.indexOf('x-') === 0;
  }
  isEvent(attr){
    return attr.indexOf('@') === 0;
  }
  compileText(node){
    // console.log(RegExp.$1)
    node.textContent = this.$vm[RegExp.$1] // RegExp.$1:name
    // console.log(node.textContent);
    this.update(node,this.$vm,RegExp.$1,'text')
  }
  compileElement(node){
    // <p x-text="name"></p>
    let nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr =>{
      const attrName = attr.name;
      const exp = attr.value;
      if(this.isDirective(attrName)){
        const dir = attrName.substring(2);
        this[dir] && this[dir](node,this.$vm,exp)
      }
      if(this.isEvent(attrName)){
        const dir = attrName.substring(1);
        this.eventHandler(node,this.$vm,exp,dir)
      }
    })
  }
  update(node,vm,exp,dir){
    let updateFn = this[dir+'Updater']
    updateFn && updateFn(node,vm[exp])
    // 要做依赖收集
    new Watcher(vm,exp,function(value){
      updateFn && updateFn(node,value)
    })
  }
  // x-text指令解析
  text(node,vm,exp){
    this.update(node,vm,exp,'text')
  }
  // x-html指令解析
  html(node,vm,exp){
    this.update(node,vm,exp,'html')
  }
  // x-model指令解析
  model(node,vm,exp){
    // data -> view
    this.update(node,vm,exp,'model')
    // view -> data
    node.addEventListener('input',(e)=>{
      vm[exp] = e.target.value;
    })
  }

  // 订阅者的回调函数-文本解析（插值文本）
  // x-text 指令
  textUpdater(node,val){
    node.textContent = val;
  }
  // x-html指令属性解析
  htmlUpdater(node,value){
    node.innerHTML = value
  }
  // x-model指令属性
  modelUpdater(node,value){
    node.value = value;
  }
  // 
  eventHandler(node,vm,exp,dir){
    const fn = vm.$options.methods && vm.$options.methods[exp];
    if(dir && fn){
      node.addEventListener(dir,fn.bind(vm))
    }
  }
}