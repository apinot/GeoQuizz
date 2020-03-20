import Vue from "nativescript-vue";
import Home from "./components/Home";
import Store from "./store/index"
import Connection from "./components/Connection/Connection";


new Vue({
    store :Store,
    render: h => h('frame', [h(Connection)])
}).$start();
