import { createRouter, createWebHistory } from "vue-router";

// import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/pidgin-hole",
      component: () => import("../views/PidginHole.vue"),
    },
    {
      path: "/",
      component: () => import("../views/SignIn.vue"),
    },
    {
      path: "/pidgpal-spotlight",
      component: () => import("../views/PidgpalSpotlight.vue"),
    },
  ],
});

export default router;
// {
//   path: "/pidgpal-spotlight/:palname",
//   name: "pidgpal-spotlight",
//   component: () => import("../views/PidgpalSpotlight.vue"),
// },
