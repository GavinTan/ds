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
    name: '欢迎',
    path: '/welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    name: '数据',
    path: '/data',
    icon: 'AccountBookOutlined',
    routes: [
      {
        name: '品种',
        icon: 'user',
        path: '/data/variety',
        access: 'user',
        component: './variety',
      },
      {
        name: '价格',
        path: '/data/price',
        access: 'user',
        component: './price',
      }
    ]
  },
  {
    name: '图表',
    path: '/charts',
    icon: 'LineChartOutlined',
    routes: [
      {
        name: '图表1',
        path: '/charts/chart1',
        access: 'user',
        component: './charts/chart1',
      },
      {
        name: '图表2',
        path: '/charts/chart2',
        access: 'user',
        component: './charts/chart2',
      },
      {
        name: '图表3',
        path: '/charts/chart3',
        access: 'user',
        component: './charts/chart3',
      },
      {
        name: '图表4',
        path: '/charts/chart4',
        access: 'user',
        component: './charts/chart4',
      },
      {
        name: '图表5',
        path: '/charts/chart5',
        access: 'user',
        component: './charts/chart5',
      },
    ]
  },
  {
    name: '用户',
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
