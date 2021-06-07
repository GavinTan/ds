export default [
  {
    path: '/account',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/account/login',
        component: './account/Login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/data',
    name: 'data',
    icon: 'crown',
    routes: [
      {
        name: 'variety',
        icon: 'user',
        path: '/data/variety',
        access: 'user',
        component: './variety',
      },
      {
        name: 'priceData',
        path: '/data/price',
        access: 'user',
        component: './priceData',
      }
    ]
  },
  {
    path: '/charts',
    name: 'chart',
    icon: 'crown',
    routes: [
      {
        name: 'chart1',
        icon: 'user',
        path: '/charts/chart1',
        access: 'user',
        component: './charts/chart1',
      },
      {
        name: 'chart2',
        icon: 'user',
        path: '/charts/chart2',
        access: 'user',
        component: './charts/chart2',
      },
      {
        name: 'chart3',
        icon: 'user',
        path: '/charts/chart3',
        access: 'user',
        component: './charts/chart3',
      },
      {
        name: 'chart4',
        icon: 'user',
        path: '/charts/chart4',
        access: 'user',
        component: './charts/chart4',
      },
    ]
  },
  {
    name: 'user',
    icon: 'user',
    path: '/user',
    access: 'admin',
    component: './user',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
