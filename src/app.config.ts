export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/plants/index',
    'pages/calendar/index',
    'pages/records/index',
    'pages/statistics/index',
    'pages/plant-detail/index',
    'pages/add-plant/index',
    'pages/add-task/index',
    'pages/add-record/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#22C55E',
    navigationBarTitleText: '绿意',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0FDF4'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#22C55E',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/plants/index',
        text: '植物'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '日历'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      }
    ]
  }
})
