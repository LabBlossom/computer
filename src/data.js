export const ASSETS = {
  homeHero: "./assets/home.jpg",
  provinceHeroFallback: "./assets/province.jpg",
  cityHeroFallback: "./assets/city.jpg",
  activityHeroFallback: "./assets/activity.jpg",
};

// 你可以在这里替换/新增省、市、活动与背景图（图片放 assets/，直接改路径即可）
export const DB = {
  provinces: [
    {
      id: "guangdong",
      name: "广东省",
      heroImage: "./assets/province-guangdong.jpg",
      cities: [
        {
          id: "guangzhou",
          name: "广州市",
          heroImage: "./assets/city-guangzhou.jpg",
          activities: [
            {
              id: "gd-gz-001",
              title: "周末社区健走活动",
              community: "天河社区",
              location: "广州市·天河公园南门集合",
              planned: 120,
              signedUp: 68,
              date: "2026-04-20 09:00",
              coverImage: "./assets/activity-walk.jpg",
              detail:
                "适合全龄段参与的轻量运动活动，提供补给与志愿者引导。可携带家人朋友一起报名。",
            },
            {
              id: "gd-gz-002",
              title: "旧物交换·绿色生活集市",
              community: "海珠社区",
              location: "广州市·海珠广场",
              planned: 200,
              signedUp: 143,
              date: "2026-04-26 14:00",
              coverImage: "./assets/activity-market.jpg",
              detail:
                "带上你闲置但完好的物品来交换，倡导低碳生活。现场也有社区公益摊位。",
            },
          ],
        },
        {
          id: "shenzhen",
          name: "深圳市",
          heroImage: "./assets/city-shenzhen.jpg",
          activities: [
            {
              id: "gd-sz-001",
              title: "社区亲子科学小实验",
              community: "南山社区",
              location: "深圳市·南山文化中心",
              planned: 80,
              signedUp: 55,
              date: "2026-04-19 10:00",
              coverImage: "./assets/activity-science.jpg",
              detail:
                "面向 6-12 岁亲子家庭，小朋友可在指导下完成 3 个安全有趣的小实验。",
            },
          ],
        },
      ],
    },
    {
      id: "sichuan",
      name: "四川省",
      heroImage: "./assets/province-sichuan.jpg",
      cities: [
        {
          id: "chengdu",
          name: "成都市",
          heroImage: "./assets/city-chengdu.jpg",
          activities: [
            {
              id: "sc-cd-001",
              title: "社区读书会·春日主题",
              community: "锦江社区",
              location: "成都市·锦江图书馆",
              planned: 60,
              signedUp: 21,
              date: "2026-04-23 19:30",
              coverImage: "./assets/activity-book.jpg",
              detail:
                "主题分享+自由讨论，欢迎带上你喜欢的书。现场提供茶水与阅读角。",
            },
          ],
        },
      ],
    },
  ],
};

export function getProvinceById(provinceId) {
  return DB.provinces.find((p) => p.id === provinceId) || null;
}

export function getCityById(provinceId, cityId) {
  const p = getProvinceById(provinceId);
  if (!p) return null;
  return p.cities.find((c) => c.id === cityId) || null;
}

export function getActivityById(provinceId, cityId, activityId) {
  const c = getCityById(provinceId, cityId);
  if (!c) return null;
  return c.activities.find((a) => a.id === activityId) || null;
}

