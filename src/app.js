import {
  ASSETS,
  DB,
  getActivityById,
  getCityById,
  getProvinceById,
} from "./data.js";

const APP = document.getElementById("app");

const AUTH_KEY = "community_map_auth_v1";

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  syncAuthUI();
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  syncAuthUI();
}

function isLoggedIn() {
  return !!readAuth()?.username;
}

function syncAuthUI() {
  const auth = readAuth();
  const userEl = document.getElementById("authUser");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnLogout = document.getElementById("btnLogout");

  if (auth?.username) {
    userEl.hidden = false;
    userEl.textContent = `你好，${auth.username}`;
    btnLogin.hidden = true;
    btnRegister.hidden = true;
    btnLogout.hidden = false;
  } else {
    userEl.hidden = true;
    userEl.textContent = "";
    btnLogin.hidden = false;
    btnRegister.hidden = false;
    btnLogout.hidden = true;
  }
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setPage(html) {
  APP.innerHTML = html;
}

function parseHash() {
  // #/province/guangdong/city/guangzhou/activity/gd-gz-001
  const raw = window.location.hash || "#/";
  const path = raw.replace(/^#/, "");
  const parts = path.split("/").filter(Boolean);
  return { raw, path, parts };
}

function goto(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

function heroStyle(url) {
  return `style="--hero:url('${esc(url)}')"`;
}

function renderHero({ title, desc, imageUrl, actionsHtml = "" }) {
  const safeUrl = imageUrl || ASSETS.homeHero;
  return `
    <section class="hero" ${heroStyle(safeUrl)}>
      <div class="heroOverlay">
        <div class="pill">地图可点省份 · 进入后可点城市</div>
        <div class="heroTitle">${esc(title)}</div>
        <div class="heroDesc">${esc(desc)}</div>
        <div class="heroActions">${actionsHtml}</div>
      </div>
    </section>
  `;
}

function mountHeroBackgrounds() {
  // 将 .hero::before 的背景图用 CSS 变量注入
  const styleId = "__hero_dynamic_style__";
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = `
    .hero{ }
    .hero::before{ background-image: var(--hero); }
  `;
}

function openModal({ title, bodyHtml, footerHtml = "" }) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.id = "__modal__";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${esc(title)}</div>
        <button class="btn btnSmall btnGhost" data-action="close">关闭</button>
      </div>
      <div class="modalBody">
        ${bodyHtml}
        ${footerHtml ? `<div style="margin-top:12px">${footerHtml}</div>` : ""}
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.action === "close") closeModal();
    if (t === overlay) closeModal();
  });
  document.body.appendChild(overlay);
}

function closeModal() {
  document.getElementById("__modal__")?.remove();
}

function openAuthModal(mode) {
  const isLogin = mode === "login";
  openModal({
    title: isLogin ? "登录" : "注册",
    bodyHtml: `
      <div id="authMsg"></div>
      <form id="authForm" class="formGrid">
        <div class="field">
          <label>用户名</label>
          <input name="username" placeholder="请输入用户名" autocomplete="username" required />
        </div>
        <div class="field">
          <label>密码</label>
          <input name="password" type="password" placeholder="请输入密码" autocomplete="${
            isLogin ? "current-password" : "new-password"
          }" required />
        </div>
        <div class="hint">
          这是演示版：账号信息仅保存在浏览器 <code>localStorage</code>，用于控制“报名”按钮是否可用。
        </div>
        <button class="btn btnPrimary" type="submit">${
          isLogin ? "登录" : "创建账号"
        }</button>
      </form>
    `,
  });

  const form = document.getElementById("authForm");
  const msg = document.getElementById("authMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "").trim();
    if (!username || !password) {
      msg.innerHTML = `<div class="error">请输入用户名与密码。</div>`;
      return;
    }

    // 演示：注册=直接写入；登录=只要有值就写入
    writeAuth({ username, password, ts: Date.now() });
    msg.innerHTML = `<div class="success">${
      isLogin ? "登录成功" : "注册成功"
    }，现在可以报名活动了。</div>`;
    setTimeout(() => closeModal(), 450);
  });
}

function provinceButtonsHtml() {
  const chips = DB.provinces
    .map(
      (p) => `
        <button class="chipBtn" data-goto="#/province/${esc(p.id)}">
          ${esc(p.name)}
        </button>
      `,
    )
    .join("");
  return `<div class="chips">${chips}</div>`;
}

function renderAbout() {
  setPage(`
    ${renderHero({
      title: "项目说明",
      desc: "这是一个可直接部署到 GitHub Pages 的纯静态网站。你可以在 src/data.js 中维护省市与活动数据，并替换 assets/ 下的背景图与封面图。",
      imageUrl: ASSETS.homeHero,
      actionsHtml: `<button class="btn btnPrimary" data-goto="#/">返回首页</button>`,
    })}
    <div style="height:14px"></div>
    <section class="panel">
      <div class="panelHeader">
        <div>
          <div class="panelTitle">你可以改哪些地方</div>
          <div class="panelSub">省、市、活动、报名人数、图片路径</div>
        </div>
      </div>
      <div class="panelBody">
        <div class="list">
          <div class="card">
            <div class="cardTitle">数据</div>
            <div class="cardMeta">编辑 <code>src/data.js</code> 的 <code>DB</code>。</div>
          </div>
          <div class="card">
            <div class="cardTitle">图片</div>
            <div class="cardMeta">把你的图片放到 <code>assets/</code> 并在 <code>src/data.js</code> 改路径即可。</div>
          </div>
          <div class="card">
            <div class="cardTitle">地图</div>
            <div class="cardMeta">首页使用 ECharts 的中国地图（省份可点）。省内地图将按需加载（若加载失败会自动降级为城市按钮列表）。</div>
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderHome() {
  setPage(`
    ${renderHero({
      title: "从地图开始发现社区活动",
      desc: "点击地图上的省份进入省页面；再点击城市按钮进入城市页面查看活动推荐。未登录可浏览详情，但不能报名。",
      imageUrl: ASSETS.homeHero,
      actionsHtml: `
        <button class="btn btnPrimary" data-goto="#/about">如何替换图片与数据</button>
        <button class="btn btnGhost" data-action="scrollToMap">去地图</button>
      `,
    })}

    <div style="height:14px"></div>

    <div class="grid2" id="homeMap">
      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">中国地图（点省份）</div>
            <div class="panelSub">点击省份后进入省详情页</div>
          </div>
          <div class="pill">提示：你也可用右侧按钮进入</div>
        </div>
        <div class="panelBody">
          <div id="chinaMap" class="mapBox"></div>
        </div>
      </section>

      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">省份按钮（可点）</div>
            <div class="panelSub">和地图同样功能，便于移动端</div>
          </div>
        </div>
        <div class="panelBody">
          ${provinceButtonsHtml()}
          <div style="height:12px"></div>
          <div class="hint">
            若你想要“点地图的省份后，省份后面可写社区活动/往届活动名称”，可在省详情页的头图区域自定义展示（已预留）。
          </div>
        </div>
      </section>
    </div>
  `);

  // 地图渲染
  initChinaMap();

  // 事件：滚动到地图
  APP.querySelector('[data-action="scrollToMap"]')?.addEventListener("click", () => {
    document.getElementById("homeMap")?.scrollIntoView({ behavior: "smooth" });
  });
}

function initChinaMap() {
  const el = document.getElementById("chinaMap");
  if (!el) return;
  const chart = echarts.init(el);
  const option = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    series: [
      {
        type: "map",
        map: "china",
        roam: true,
        emphasis: { label: { show: true, color: "#ffffff" } },
        label: { show: false, color: "rgba(255,255,255,0.75)" },
        itemStyle: {
          areaColor: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.18)",
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(124,58,237,0.35)",
            borderColor: "rgba(255,255,255,0.32)",
          },
          label: { show: true },
        },
        select: {
          itemStyle: {
            areaColor: "rgba(34,197,94,0.28)",
          },
          label: { show: true },
        },
        data: [],
      },
    ],
  };
  chart.setOption(option);

  // 点击省份 → 匹配 DB.provinces 的 name，找到对应 id 后跳转
  chart.on("click", (params) => {
    const provinceName = String(params?.name || "").trim();
    const found = DB.provinces.find((p) => p.name === provinceName);
    if (found) {
      goto(`#/province/${found.id}`);
      return;
    }
    // 找不到就给提示（例如 DB 中没配置该省）
    openModal({
      title: "未配置该省数据",
      bodyHtml: `
        <div class="hint">
          你点击的是：<code>${esc(provinceName)}</code><br/>
          目前 <code>src/data.js</code> 里没有配置这个省的数据。你可以新增一个省对象并设置 <code>id/name/cities</code>。
        </div>
      `,
      footerHtml: `<button class="btn btnPrimary" data-action="close">知道了</button>`,
    });
  });

  // 响应式
  window.addEventListener("resize", () => chart.resize());
}

// 省份地图：按需加载 ECharts 省级地图脚本（失败则降级为城市按钮）
const ECHARTS_PROVINCE_MAP_JS = {
  // 这里是“省份中文名 → jsdelivr 省地图脚本路径”的常见映射
  // 你需要更多省份就继续加：key 必须与 DB.provinces[].name 一致
  广东省: "https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/guangdong.js",
  四川省: "https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/sichuan.js",
  北京市: "https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/beijing.js",
  上海市: "https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/shanghai.js",
  浙江省: "https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/zhejiang.js",
};

function loadScriptOnce(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic="${CSS.escape(url)}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.dataset.dynamic = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(s);
  });
}

function normalizeProvinceMapName(provinceName) {
  // ECharts 省地图注册的 map name 通常与中文名一致（如 "广东" 或 "广东省" 取决于数据源）
  // 这里优先尝试去掉“省/市/自治区”等后缀，再回退原名
  return provinceName
    .replace(/(省|市|回族自治区|壮族自治区|维吾尔自治区|自治区|特别行政区)$/u, "");
}

function renderProvince(provinceId) {
  const p = getProvinceById(provinceId);
  if (!p) {
    setPage(`
      ${renderHero({
        title: "未找到该省",
        desc: "请检查 src/data.js 是否配置了该省的 id。",
        imageUrl: ASSETS.provinceHeroFallback,
        actionsHtml: `<button class="btn btnPrimary" data-goto="#/">回首页</button>`,
      })}
    `);
    return;
  }

  const heroImg = p.heroImage || ASSETS.provinceHeroFallback;
  const cities = p.cities
    .map(
      (c) => `
        <button class="chipBtn" data-goto="#/province/${esc(p.id)}/city/${esc(c.id)}">
          ${esc(c.name)}
        </button>
      `,
    )
    .join("");

  setPage(`
    ${renderHero({
      title: `${p.name} · 社区活动`,
      desc: "这里展示省内地图（如可加载）与城市入口。你也可以在这块区域加“往届活动名称/风貌照片”等内容。",
      imageUrl: heroImg,
      actionsHtml: `
        <button class="btn btnGhost" data-goto="#/">返回首页</button>
        <button class="btn btnPrimary" data-action="scrollToCities">去城市</button>
      `,
    })}

    <div style="height:14px"></div>

    <div class="grid2">
      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">${esc(p.name)}地图（可点）</div>
            <div class="panelSub">若省级地图脚本无法加载，会自动降级为“城市按钮列表”</div>
          </div>
          <div class="pill">省级地图：ECharts</div>
        </div>
        <div class="panelBody">
          <div id="provinceMap" class="mapBox"></div>
          <div id="provinceMapHint" class="hint" style="margin-top:10px"></div>
        </div>
      </section>

      <section class="panel" id="cityButtons">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">城市（可点）</div>
            <div class="panelSub">进入城市后查看活动推荐</div>
          </div>
        </div>
        <div class="panelBody">
          <div class="chips">${cities}</div>
        </div>
      </section>
    </div>
  `);

  APP.querySelector('[data-action="scrollToCities"]')?.addEventListener("click", () => {
    document.getElementById("cityButtons")?.scrollIntoView({ behavior: "smooth" });
  });

  initProvinceMap(p);
}

async function initProvinceMap(province) {
  const el = document.getElementById("provinceMap");
  const hint = document.getElementById("provinceMapHint");
  if (!el || !hint) return;

  const scriptUrl = ECHARTS_PROVINCE_MAP_JS[province.name];
  if (!scriptUrl) {
    hint.innerHTML = `未配置 <code>${esc(province.name)}</code> 的省级地图脚本。你可在 <code>src/app.js</code> 的 <code>ECHARTS_PROVINCE_MAP_JS</code> 中添加映射。`;
    el.style.display = "none";
    return;
  }

  try {
    await loadScriptOnce(scriptUrl);
  } catch {
    hint.innerHTML = `省级地图脚本加载失败，已降级为城市按钮列表（不影响功能）。`;
    el.style.display = "none";
    return;
  }

  hint.innerHTML = `提示：你也可以直接点右侧城市按钮进入。`;
  const chart = echarts.init(el);
  const mapName = normalizeProvinceMapName(province.name);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    series: [
      {
        type: "map",
        map: mapName,
        roam: true,
        label: { show: false, color: "rgba(255,255,255,0.78)" },
        itemStyle: {
          areaColor: "rgba(255,255,255,0.07)",
          borderColor: "rgba(255,255,255,0.16)",
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: "rgba(124,58,237,0.30)" },
        },
      },
    ],
  });

  chart.on("click", (params) => {
    const name = String(params?.name || "").trim();
    // 省内地图点到的是地级市/区县，演示版：尝试匹配城市中文名
    const city = province.cities.find((c) => c.name.includes(name) || name.includes(c.name));
    if (city) goto(`#/province/${province.id}/city/${city.id}`);
  });

  window.addEventListener("resize", () => chart.resize());
}

function renderCity(provinceId, cityId) {
  const p = getProvinceById(provinceId);
  const c = getCityById(provinceId, cityId);
  if (!p || !c) {
    setPage(`
      ${renderHero({
        title: "未找到该城市",
        desc: "请检查 src/data.js 是否配置了该城市的 id。",
        imageUrl: ASSETS.cityHeroFallback,
        actionsHtml: `<button class="btn btnPrimary" data-goto="#/">回首页</button>`,
      })}
    `);
    return;
  }

  const heroImg = c.heroImage || ASSETS.cityHeroFallback;
  const list = c.activities
    .map((a) => {
      const quota = `${a.signedUp}/${a.planned}`;
      return `
        <div class="card">
          <div class="cardTop">
            <div>
              <div class="cardTitle">${esc(a.title)}</div>
              <div class="cardMeta">${esc(a.community)} · ${esc(a.location)}</div>
              <div class="cardMeta">时间：${esc(a.date)} · 报名：${esc(quota)}</div>
            </div>
            <div class="pill">推荐</div>
          </div>
          <div class="cardActions">
            <button class="btn btnPrimary" data-goto="#/province/${esc(p.id)}/city/${esc(
        c.id,
      )}/activity/${esc(a.id)}">查看详情</button>
            <button class="btn btnGhost" data-action="quickSignup" data-activity="${esc(
              a.id,
            )}">一键报名</button>
          </div>
        </div>
      `;
    })
    .join("");

  setPage(`
    ${renderHero({
      title: `${c.name} · 活动推荐`,
      desc: "上面是城市背景图；下面是社区活动推荐列表。点进活动详情可查看介绍并报名（需登录）。",
      imageUrl: heroImg,
      actionsHtml: `
        <button class="btn btnGhost" data-goto="#/province/${esc(p.id)}">返回${esc(
          p.name,
        )}</button>
        <button class="btn btnPrimary" data-goto="#/">回首页</button>
      `,
    })}

    <div style="height:14px"></div>

    <section class="panel">
      <div class="panelHeader">
        <div>
          <div class="panelTitle">活动推荐</div>
          <div class="panelSub">包含社区名称、地点、计划报名人数与已报名人数</div>
        </div>
        <div class="pill">${esc(c.activities.length)} 个活动</div>
      </div>
      <div class="panelBody">
        <div class="list">${list || `<div class="hint">暂无活动，你可以在 <code>src/data.js</code> 给该城市添加 activities。</div>`}</div>
      </div>
    </section>
  `);

  // 一键报名（演示）
  APP.querySelectorAll('[data-action="quickSignup"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const activityId = btn.getAttribute("data-activity");
      if (!isLoggedIn()) {
        openModal({
          title: "需要登录才能报名",
          bodyHtml: `<div class="hint">你可以先浏览活动，但报名需要登录/注册。</div>`,
          footerHtml: `
            <button class="btn btnPrimary" data-action="login">去登录</button>
            <button class="btn btnGhost" data-action="register">去注册</button>
          `,
        });
        const m = document.getElementById("__modal__");
        m?.addEventListener("click", (e) => {
          const t = e.target;
          if (t?.dataset?.action === "login") openAuthModal("login");
          if (t?.dataset?.action === "register") openAuthModal("register");
        });
        return;
      }
      goto(`#/province/${p.id}/city/${c.id}/activity/${activityId}`);
    });
  });
}

function renderActivity(provinceId, cityId, activityId) {
  const p = getProvinceById(provinceId);
  const c = getCityById(provinceId, cityId);
  const a = getActivityById(provinceId, cityId, activityId);
  if (!p || !c || !a) {
    setPage(`
      ${renderHero({
        title: "未找到该活动",
        desc: "请检查 src/data.js 是否配置了该活动 id。",
        imageUrl: ASSETS.activityHeroFallback,
        actionsHtml: `<button class="btn btnPrimary" data-goto="#/">回首页</button>`,
      })}
    `);
    return;
  }

  const heroImg = a.coverImage || ASSETS.activityHeroFallback;
  const quota = `${a.signedUp}/${a.planned}`;
  const canSignup = isLoggedIn();

  setPage(`
    ${renderHero({
      title: a.title,
      desc: `${a.community} · ${a.location} · ${a.date} · 报名 ${quota}`,
      imageUrl: heroImg,
      actionsHtml: `
        <button class="btn btnGhost" data-goto="#/province/${esc(p.id)}/city/${esc(
        c.id,
      )}">返回${esc(c.name)}</button>
        <button class="btn ${canSignup ? "btnPrimary" : "btnGhost"}" data-action="signup">${
          canSignup ? "报名参加" : "登录后报名"
        }</button>
      `,
    })}

    <div style="height:14px"></div>

    <section class="panel">
      <div class="panelHeader">
        <div>
          <div class="panelTitle">活动详情</div>
          <div class="panelSub">未登录可以查看，但不能报名</div>
        </div>
        <div class="pill">${canSignup ? "已登录" : "未登录"}</div>
      </div>
      <div class="panelBody">
        <div class="card">
          <div class="cardTitle">介绍</div>
          <div class="cardMeta" style="margin-top:8px; line-height:1.7; color: rgba(255,255,255,0.82)">
            ${esc(a.detail)}
          </div>
          <div style="height:10px"></div>
          <div class="cardMeta">计划报名人数：${esc(a.planned)} · 已报名人数：${esc(a.signedUp)}</div>
          <div class="cardActions">
            <button class="btn btnPrimary" data-action="signup">报名参加</button>
            <button class="btn btnGhost" data-goto="#/province/${esc(p.id)}">返回${esc(
        p.name,
      )}</button>
          </div>
        </div>
      </div>
    </section>
  `);

  APP.querySelectorAll('[data-action="signup"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        openModal({
          title: "需要登录才能报名",
          bodyHtml: `<div class="hint">你可以先了解这个活动，但报名参加需要登录/注册。</div>`,
          footerHtml: `
            <button class="btn btnPrimary" data-action="login">去登录</button>
            <button class="btn btnGhost" data-action="register">去注册</button>
          `,
        });
        const m = document.getElementById("__modal__");
        m?.addEventListener("click", (e) => {
          const t = e.target;
          if (t?.dataset?.action === "login") openAuthModal("login");
          if (t?.dataset?.action === "register") openAuthModal("register");
        });
        return;
      }

      // 演示报名：仅提示成功（真实项目这里应调用后端）
      openModal({
        title: "报名成功（演示）",
        bodyHtml: `<div class="success">你已报名：<b>${esc(a.title)}</b></div>
          <div class="hint" style="margin-top:10px">这是演示版，没有真实后端，因此不会真的更改“已报名人数”。需要的话我也可以帮你加一个简易的后端（如 Node/Express 或 Firebase）。</div>`,
        footerHtml: `<button class="btn btnPrimary" data-action="close">完成</button>`,
      });
    });
  });
}

function router() {
  mountHeroBackgrounds();
  syncAuthUI();
  const { parts } = parseHash();

  // routes:
  // /                 home
  // /about            about
  // /province/:pid
  // /province/:pid/city/:cid
  // /province/:pid/city/:cid/activity/:aid
  if (parts.length === 0) {
    renderHome();
    return;
  }
  if (parts[0] === "about") {
    renderAbout();
    return;
  }
  if (parts[0] === "province" && parts[1]) {
    const pid = parts[1];
    if (parts[2] === "city" && parts[3]) {
      const cid = parts[3];
      if (parts[4] === "activity" && parts[5]) {
        renderActivity(pid, cid, parts[5]);
        return;
      }
      renderCity(pid, cid);
      return;
    }
    renderProvince(pid);
    return;
  }

  // fallback
  renderHome();
}

function wireGlobalClicks() {
  // data-goto 跳转
  document.body.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const to = t.getAttribute("data-goto");
    if (to) {
      goto(to.replace(/^#/, "#"));
      return;
    }
  });

  // 顶部登录/注册/退出
  document.getElementById("btnLogin")?.addEventListener("click", () => openAuthModal("login"));
  document
    .getElementById("btnRegister")
    ?.addEventListener("click", () => openAuthModal("register"));
  document.getElementById("btnLogout")?.addEventListener("click", () => clearAuth());
}

// boot
wireGlobalClicks();
window.addEventListener("hashchange", router);
router();

