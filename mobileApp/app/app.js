import Vue from "nativescript-vue";
import Home from "./components/Home";
import Store from "./store/index"


new Vue({
    store :Store,
    render: h => h('frame', [h(Home)])
}).$start();
