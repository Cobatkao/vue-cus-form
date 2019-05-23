import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/form",
      name: "form",
      component: () => import("./views/form.vue")
    },
    {
      path: "/about",
      name: "about",
      component: () => import("./views/About.vue")
    }
  ]
});
