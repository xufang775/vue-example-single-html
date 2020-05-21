# Vue-Router笔记

1. 我们可以在任何组件内通过 this.$router 访问路由器，也可以通过 this.$route 访问当前路由。

2. 当<router-link>对应的路由匹配成功，将自动设置class属性值 .router-link-active 。

3. 你可以在一个路由中设置多段“路径参数”，对应的值都会设置到 $route.params 中。
|模式|匹配路径|$route.params|
|/user/:username|/user/evan|{username:'evan'}|
|/user/:username/post/:post_id|/user/evan/post/123|{username:'evan',post_id:'123'}