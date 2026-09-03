/* eslint-disable */
// 学生档案管理系统 - Supabase 后端版
// 通过 Babel Standalone 在浏览器里直接运行

const { useState, useEffect, useMemo, useCallback, Fragment } = React;
const {
  Layout, Button, Input, InputNumber, Select, DatePicker, Tabs,
  Tag, Empty, message, Modal, ConfigProvider, Popconfirm,
  Space, Tooltip, Result, Spin, Form,
} = antd;
const { Header, Content } = Layout;
const { TabPane } = Tabs;

/* ===================== Supabase 配置 ===================== */
// 部署前已配置（用户提供的真实凭据）
// VERSION: v7-CDN-FIX
console.log("[学生档案] Loading app.js VERSION v7-CDN-FIX");
const SUPABASE_URL = "https://rxuyheypyjonjaupqoux.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dXloZXlweWpvbmphdXBxb3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDE1OTUsImV4cCI6MjEwMzk3NzU5NX0.9aRpZdtPbgo5B7ZcHJqD4QRqcVA9XbaDFGHNw_ISXfA";

let supabase = null;
if (typeof window !== "undefined") {
  console.log("[学生档案] window.supabase 类型:", typeof window.supabase);
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[学生档案] Supabase client 初始化成功");
  } else {
    console.error("[学生档案] 严重错误：window.supabase 未加载，请检查 CDN 链接是否可访问");
  }
}

/* ===================== 工具函数 ===================== */

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const formatDate = (ts) => {
  if (!ts) return "-";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const formatShortDate = (ts) => {
  if (!ts) return "-";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatMonth = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${y} 年 ${parseInt(m, 10)} 月`;
};

const newStudent = (name = "新学生") => {
  const now = Date.now();
  return {
    id: uuid(),
    name,
    age: 10,
    grade: "",
    subjects: [],
    startDate: now,
    avatar: "",
    weeklyRecords: [],
    monthlyAnalysis: [],
    nextMonthPlan: { plan: "", goals: [] },
    upcomingPlans: [],
    createdAt: now,
    updatedAt: now,
  };
};

const buildSample = () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: uuid(),
      name: "示例同学",
      age: 11,
      grade: "五年级",
      subjects: ["C++ 基础", "算法入门"],
      startDate: now - 90 * day,
      avatar: "",
      weeklyRecords: [
        {
          id: uuid(),
          weekLabel: "第 1 周",
          startDate: now - 14 * day,
          endDate: now - 8 * day,
          content: "学习 C++ 变量、数据类型、输入输出，完成 5 道基础练习题。",
          achievements: "能独立写出 Hello World 程序，理解整型与浮点型区别。",
        },
        {
          id: uuid(),
          weekLabel: "第 2 周",
          startDate: now - 7 * day,
          endDate: now - 1 * day,
          content: "学习分支语句 if/else，循环语句 for/while。",
          achievements: "完成 8 道条件判断题，掌握 for 循环累加。",
        },
      ],
      monthlyAnalysis: [
        {
          id: uuid(),
          month: (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          })(),
          analysis:
            "本月学生整体学习态度认真，作业完成度高。基础语法掌握扎实，但逻辑思维训练仍需加强，建议下个月增加算法题练习。",
        },
      ],
      nextMonthPlan: {
        plan:
          "1. 系统学习数组、字符串相关题目\n2. 每天完成 2 道算法题\n3. 周末进行一次小测，检验学习效果\n4. 准备 GESP 一级考试",
        goals: [
          "完成 30 道数组基础题",
          "通过 GESP 一级模拟测试",
          "能独立讲解自己的解题思路",
        ],
      },
      upcomingPlans: [
        { id: uuid(), type: "exam", name: "GESP 一级", date: now + 30 * day, level: "入门级", notes: "C++ 基础语法、流程控制" },
        { id: uuid(), type: "competition", name: "校内编程挑战赛", date: now + 60 * day, level: "校级", notes: "面向五六年级，3 道题 90 分钟" },
        { id: uuid(), type: "exam", name: "GESP 二级", date: now + 90 * day, level: "初级", notes: "数组、函数基础" },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
};

/* ===================== 路由 ===================== */

const useHashRoute = () => {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
};

const navigate = (path) => {
  window.location.hash = path;
};

/* ===================== 数据 API（封装 Supabase） ===================== */

const api = {
  async listStudents() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("students")
      .select("id, data, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({ ...row.data, _dbId: row.id, _updated_at: row.updated_at }));
  },

  async upsertStudent(student) {
    if (!supabase) throw new Error("Supabase 未配置");
    const payload = {
      id: student.id,
      data: student,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("students").upsert(payload, { onConflict: "id" });
    if (error) throw error;
  },

  async deleteStudent(id) {
    if (!supabase) throw new Error("Supabase 未配置");
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
  },

  async getMyOrg() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("org_id, display_name, organizations(id, name, invite_code)")
      .eq("id", user.id)
      .single();
    if (pErr) throw pErr;
    return { user, profile };
  },
};

/* ===================== 登录 / 注册页 ===================== */

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!supabase) {
      message.error("Supabase 尚未配置，请联系管理员");
      return;
    }
    if (!email || !password) {
      message.warning("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message.success("登录成功");
      } else {
        // 注册
        const meta = { display_name: displayName || email.split("@")[0] };
        if (inviteCode.trim()) {
          meta.invite_code = inviteCode.trim().toUpperCase();
        } else {
          meta.org_name = orgName.trim() || `${displayName || email.split("@")[0]} 的机构`;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: meta },
        });
        if (error) throw error;
        message.success("注册成功！请检查邮箱完成验证（如未配置邮件可暂时跳过）");
      }
    } catch (e) {
      message.error(e.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 40,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, color: "#1f2937", textAlign: "center" }}>
          📚 学生档案管理系统
        </h1>
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: 8, marginBottom: 32 }}>
          {mode === "login" ? "登录你的账号" : "创建账号（首次注册会成为机构管理员）"}
        </p>

        <Form layout="vertical">
          <Form.Item label="邮箱">
            <Input
              size="large"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="密码（至少 6 位）">
            <Input.Password
              size="large"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={submit}
            />
          </Form.Item>

          {mode === "register" && (
            <>
              <Form.Item label="你的姓名">
                <Input
                  size="large"
                  placeholder="例如：李老师"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    邀请码{" "}
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                      （已有机构？填这个加入；不填则创建新机构）
                    </span>
                  </span>
                }
              >
                <Input
                  size="large"
                  placeholder="例如：A1B2C3（6 位字符）"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </Form.Item>
              {!inviteCode.trim() && (
                <Form.Item label="新机构名称">
                  <Input
                    size="large"
                    placeholder="例如：阳光编程教室"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </Form.Item>
              )}
            </>
          )}

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={submit}
            style={{ marginTop: 8 }}
          >
            {mode === "login" ? "登录" : "注册"}
          </Button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

/* ===================== 配置未就绪提示页 ===================== */

const NotConfiguredPage = () => {
  const supabaseLoaded = typeof window !== "undefined" && !!window.supabase;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fef3c7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          maxWidth: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ margin: 0, color: "#92400e" }}>⚠️ 网站加载异常</h2>
        <p style={{ color: "#6b7280", lineHeight: 1.8 }}>
          {supabaseLoaded
            ? "Supabase 已加载但配置未生效，请检查 app.js 顶部的 SUPABASE_URL 和 KEY。"
            : "Supabase 库（supabase-js）没加载成功。请检查网络或 CDN 链接。"}
        </p>
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, fontSize: 12, fontFamily: "monospace", color: "#374151", marginTop: 12 }}>
          <div>window.supabase: {String(supabaseLoaded)}</div>
          <div>SUPABASE_URL: {SUPABASE_URL}</div>
          <div>KEY 前 20 位: {SUPABASE_ANON_KEY.substring(0, 20)}...</div>
        </div>
        <p style={{ color: "#6b7280", lineHeight: 1.8, marginTop: 16, fontSize: 13 }}>
          💡 打开浏览器 <strong>F12 → Console</strong> 看具体错误，把截图发给我。
        </p>
      </div>
    </div>
  );
};

/* ===================== 学生列表页 ===================== */

const StudentListPage = ({ students, onCreate, onOpen, onDelete, onExport }) => {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(k) ||
        (s.grade || "").toLowerCase().includes(k) ||
        (s.subjects || []).some((sub) => sub.toLowerCase().includes(k))
    );
  }, [students, keyword]);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input.Search
            placeholder="搜索姓名 / 年级 / 科目"
            allowClear
            style={{ width: 320 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={setKeyword}
          />
          <span className="muted">共 {students.length} 位学生</span>
        </Space>
        <Button type="primary" size="large" onClick={onCreate}>
          + 新建学生档案
        </Button>
      </div>

      {students.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "60px 0",
            textAlign: "center",
          }}
        >
          <Empty
            description="还没有学生档案，点击下方按钮开始创建"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" size="large" onClick={onCreate} style={{ marginTop: 16 }}>
            创建第一个档案
          </Button>
          <div style={{ marginTop: 12 }}>
            <Button type="link" onClick={() => onCreate(true)}>
              或加载示例数据
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((s) => (
            <div
              className="student-card"
              key={s.id}
              onClick={() => onOpen(s.id)}
            >
              <div className="name">{s.name}</div>
              <div className="meta">
                {s.age ? `${s.age} 岁` : ""} {s.grade ? `· ${s.grade}` : ""}
              </div>
              <div className="subjects">
                {(s.subjects || []).slice(0, 4).map((sub) => (
                  <Tag color="purple" key={sub}>{sub}</Tag>
                ))}
                {s.subjects && s.subjects.length > 4 ? (
                  <Tag>+{s.subjects.length - 4}</Tag>
                ) : null}
              </div>
              <div className="footer">
                <span className="updated">更新于 {formatShortDate(s.updatedAt)}</span>
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="导出 PDF">
                    <Button size="small" type="text" onClick={() => onExport(s.id)}>
                      📄
                    </Button>
                  </Tooltip>
                  <Popconfirm
                    title="确认删除该学生档案？"
                    okText="删除"
                    cancelText="取消"
                    okType="danger"
                    onConfirm={() => onDelete(s.id)}
                  >
                    <Button size="small" type="text" danger>🗑</Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===================== 详情页各 Section ===================== */

const BasicInfoSection = ({ student, onChange }) => (
  <div className="section-card">
    <div className="section-title">基础信息</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      <div>
        <div className="muted" style={{ marginBottom: 6 }}>姓名 *</div>
        <Input value={student.name} placeholder="例如：张小明"
          onChange={(e) => onChange({ ...student, name: e.target.value })} />
      </div>
      <div>
        <div className="muted" style={{ marginBottom: 6 }}>年龄</div>
        <InputNumber min={3} max={99} value={student.age} style={{ width: "100%" }}
          onChange={(v) => onChange({ ...student, age: v })} />
      </div>
      <div>
        <div className="muted" style={{ marginBottom: 6 }}>年级</div>
        <Input value={student.grade} placeholder="例如：五年级 / 初二"
          onChange={(e) => onChange({ ...student, grade: e.target.value })} />
      </div>
      <div>
        <div className="muted" style={{ marginBottom: 6 }}>入学日期</div>
        <DatePicker style={{ width: "100%" }}
          value={student.startDate ? window.dayjs(student.startDate) : null}
          onChange={(d) => onChange({ ...student, startDate: d ? d.valueOf() : null })} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div className="muted" style={{ marginBottom: 6 }}>学习的编程科目</div>
        <Select mode="tags" style={{ width: "100%" }}
          placeholder="例如：C++ 基础、Python 入门、算法（输入后回车添加）"
          value={student.subjects || []}
          onChange={(v) => onChange({ ...student, subjects: v || [] })} />
      </div>
    </div>
  </div>
);

const WeeklySection = ({ student, onChange }) => {
  const addWeek = () => {
    onChange({
      ...student,
      weeklyRecords: [
        ...(student.weeklyRecords || []),
        { id: uuid(), weekLabel: `第 ${(student.weeklyRecords?.length || 0) + 1} 周`,
          startDate: null, endDate: null, content: "", achievements: "" },
      ],
    });
  };
  const updateWeek = (idx, patch) => onChange({
    ...student,
    weeklyRecords: (student.weeklyRecords || []).map((r, i) => i === idx ? { ...r, ...patch } : r),
  });
  const removeWeek = (idx) => onChange({
    ...student,
    weeklyRecords: (student.weeklyRecords || []).filter((_, i) => i !== idx),
  });
  return (
    <div className="section-card">
      <div className="section-title">
        <span>每周学习内容与成果</span>
        <Button type="primary" onClick={addWeek}>+ 添加周记录</Button>
      </div>
      {(!student.weeklyRecords || student.weeklyRecords.length === 0) ? (
        <Empty description="还没有周记录，点击右上角添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : student.weeklyRecords.map((w, idx) => (
        <div className="week-item" key={w.id}>
          <div className="week-header">
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Input style={{ width: 140 }} value={w.weekLabel} placeholder="周次标签"
                onChange={(e) => updateWeek(idx, { weekLabel: e.target.value })} />
              <span className="muted">起</span>
              <DatePicker value={w.startDate ? window.dayjs(w.startDate) : null}
                onChange={(d) => updateWeek(idx, { startDate: d ? d.valueOf() : null })} />
              <span className="muted">止</span>
              <DatePicker value={w.endDate ? window.dayjs(w.endDate) : null}
                onChange={(d) => updateWeek(idx, { endDate: d ? d.valueOf() : null })} />
            </div>
            <Popconfirm title="删除该周记录？" okText="删除" cancelText="取消" okType="danger"
              onConfirm={() => removeWeek(idx)}>
              <Button danger size="small">删除</Button>
            </Popconfirm>
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="muted" style={{ marginBottom: 4 }}>本周学习内容</div>
            <Input.TextArea rows={3} value={w.content}
              placeholder="例：学习 C++ for 循环，完成 5 道基础题"
              onChange={(e) => updateWeek(idx, { content: e.target.value })} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="muted" style={{ marginBottom: 4 }}>学习成果</div>
            <Input.TextArea rows={3} value={w.achievements}
              placeholder="例：能独立完成 1-100 累加，掌握 for 循环用法"
              onChange={(e) => updateWeek(idx, { achievements: e.target.value })} />
          </div>
        </div>
      ))}
    </div>
  );
};

const MonthlySection = ({ student, onChange }) => {
  const addMonth = () => {
    const d = new Date();
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    onChange({
      ...student,
      monthlyAnalysis: [...(student.monthlyAnalysis || []), { id: uuid(), month, analysis: "" }],
    });
  };
  const updateMonth = (idx, patch) => onChange({
    ...student,
    monthlyAnalysis: (student.monthlyAnalysis || []).map((r, i) => i === idx ? { ...r, ...patch } : r),
  });
  const removeMonth = (idx) => onChange({
    ...student,
    monthlyAnalysis: (student.monthlyAnalysis || []).filter((_, i) => i !== idx),
  });
  return (
    <div className="section-card">
      <div className="section-title">
        <span>每月学习情况分析</span>
        <Button type="primary" onClick={addMonth}>+ 添加月份分析</Button>
      </div>
      {(!student.monthlyAnalysis || student.monthlyAnalysis.length === 0) ? (
        <Empty description="还没有月度分析，点击右上角添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : student.monthlyAnalysis.map((m, idx) => (
        <div className="month-item" key={m.id}>
          <div className="month-header">
            <DatePicker picker="month" value={m.month ? window.dayjs(m.month, "YYYY-MM") : null}
              format="YYYY 年 MM 月"
              onChange={(d) => updateMonth(idx, { month: d ? d.format("YYYY-MM") : "" })} />
            <Popconfirm title="删除该月分析？" okText="删除" cancelText="取消" okType="danger"
              onConfirm={() => removeMonth(idx)}>
              <Button danger size="small">删除</Button>
            </Popconfirm>
          </div>
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>学习情况分析</div>
            <Input.TextArea rows={5} value={m.analysis}
              placeholder="例：本月学生整体学习态度认真，基础语法掌握扎实……"
              onChange={(e) => updateMonth(idx, { analysis: e.target.value })} />
          </div>
        </div>
      ))}
    </div>
  );
};

const NextMonthSection = ({ student, onChange }) => {
  const plan = student.nextMonthPlan || { plan: "", goals: [] };
  const updatePlan = (patch) => onChange({ ...student, nextMonthPlan: { ...plan, ...patch } });
  return (
    <div className="section-card">
      <div className="section-title">下个月学习规划</div>
      <div>
        <div className="muted" style={{ marginBottom: 6 }}>规划详情</div>
        <Input.TextArea rows={6} value={plan.plan}
          placeholder="下个月计划学习的内容、节奏、复习安排……"
          onChange={(e) => updatePlan({ plan: e.target.value })} />
      </div>
      <div style={{ marginTop: 16 }}>
        <div className="muted" style={{ marginBottom: 6 }}>目标清单（每行一个）</div>
        <Select mode="tags" style={{ width: "100%" }}
          placeholder="输入目标后回车添加" value={plan.goals || []}
          onChange={(v) => updatePlan({ goals: v || [] })} />
      </div>
    </div>
  );
};

const UpcomingSection = ({ student, onChange }) => {
  const addEvent = () => onChange({
    ...student,
    upcomingPlans: [...(student.upcomingPlans || []),
      { id: uuid(), type: "exam", name: "", date: null, level: "", notes: "" }],
  });
  const updateEvent = (idx, patch) => onChange({
    ...student,
    upcomingPlans: (student.upcomingPlans || []).map((r, i) => i === idx ? { ...r, ...patch } : r),
  });
  const removeEvent = (idx) => onChange({
    ...student,
    upcomingPlans: (student.upcomingPlans || []).filter((_, i) => i !== idx),
  });

  const now = Date.now();
  const threeMonthsLater = now + 1000 * 60 * 60 * 24 * 95;
  const events = (student.upcomingPlans || []).filter((e) => {
    if (!e.date) return true;
    const t = typeof e.date === "number" ? e.date : new Date(e.date).getTime();
    return t >= now - 1000 * 60 * 60 * 24 && t <= threeMonthsLater;
  });

  return (
    <div className="section-card">
      <div className="section-title">
        <span>近三个月考试 / 比赛规划</span>
        <Button type="primary" onClick={addEvent}>+ 添加考试/比赛</Button>
      </div>
      {events.length === 0 ? (
        <Empty description="还没有近三个月的考试/比赛规划" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : events.map((ev) => {
        const idx = student.upcomingPlans.findIndex((x) => x.id === ev.id);
        return (
          <div className="plan-item" key={ev.id}>
            <div className="plan-header">
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Select style={{ width: 120 }} value={ev.type}
                  onChange={(v) => updateEvent(idx, { type: v })}
                  options={[{ value: "exam", label: "考试" }, { value: "competition", label: "比赛" }]} />
                <Input style={{ width: 240 }} value={ev.name} placeholder="名称，例如：GESP 一级"
                  onChange={(e) => updateEvent(idx, { name: e.target.value })} />
                <DatePicker value={ev.date ? window.dayjs(ev.date) : null}
                  onChange={(d) => updateEvent(idx, { date: d ? d.valueOf() : null })} />
                <Input style={{ width: 160 }} value={ev.level} placeholder="级别，例如：入门级"
                  onChange={(e) => updateEvent(idx, { level: e.target.value })} />
              </div>
              <Popconfirm title="删除该条记录？" okText="删除" cancelText="取消" okType="danger"
                onConfirm={() => removeEvent(idx)}>
                <Button danger size="small">删除</Button>
              </Popconfirm>
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="muted" style={{ marginBottom: 4 }}>备考/备赛备注</div>
              <Input.TextArea rows={2} value={ev.notes} placeholder="复习重点、目标分数等"
                onChange={(e) => updateEvent(idx, { notes: e.target.value })} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ===================== PDF 报告模板 ===================== */

const ReportDocument = ({ student }) => {
  const subjects = (student.subjects || []).join("、") || "—";
  const today = new Date();
  const todayStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

  return (
    <div id="pdf-report-root">
      <div className="pdf-page">
        <div className="pdf-cover">
          <div style={{ fontSize: 14, opacity: 0.85, letterSpacing: 4, marginBottom: 16 }}>STUDENT PORTRAIT</div>
          <div className="pdf-title">学 习 档 案 报 告</div>
          <div className="pdf-subtitle">Student Learning Portfolio Report</div>
          <div className="pdf-name">{student.name || "未命名"}</div>
          <div className="pdf-meta">
            <div className="pdf-meta-row">年龄：{student.age || "—"} 岁</div>
            <div className="pdf-meta-row">年级：{student.grade || "—"}</div>
            <div className="pdf-meta-row">学习科目：{subjects}</div>
            <div className="pdf-meta-row">入学日期：{formatShortDate(student.startDate)}</div>
          </div>
          <div style={{ marginTop: 80, fontSize: 12, opacity: 0.7 }}>报告生成日期：{todayStr}</div>
        </div>
      </div>

      <div className="pdf-page">
        <div className="pdf-section-title first">一、基本信息</div>
        <table className="pdf-info-table">
          <tbody>
            <tr><td className="label">姓名</td><td>{student.name || "—"}</td>
              <td className="label">年龄</td><td>{student.age || "—"}</td></tr>
            <tr><td className="label">年级</td><td>{student.grade || "—"}</td>
              <td className="label">入学日期</td><td>{formatShortDate(student.startDate)}</td></tr>
            <tr><td className="label">学习科目</td><td colSpan={3}>{subjects}</td></tr>
          </tbody>
        </table>
        <div className="pdf-section-title">二、每周学习内容与成果</div>
        {(!student.weeklyRecords || student.weeklyRecords.length === 0) ? (
          <div className="pdf-empty">暂无周记录</div>
        ) : student.weeklyRecords.map((w) => (
          <div className="pdf-week-block" key={w.id}>
            <div className="title">
              {w.weekLabel || "周次"}
              <span style={{ fontWeight: 400, fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
                {formatShortDate(w.startDate)} ~ {formatShortDate(w.endDate)}
              </span>
            </div>
            <div className="row"><b>学习内容：</b>{w.content || "—"}</div>
            <div className="row"><b>学习成果：</b>{w.achievements || "—"}</div>
          </div>
        ))}
        <div className="pdf-footer">学生档案管理系统</div>
      </div>

      <div className="pdf-page">
        <div className="pdf-section-title first">三、每月学习情况分析</div>
        {(!student.monthlyAnalysis || student.monthlyAnalysis.length === 0) ? (
          <div className="pdf-empty">暂无月度分析</div>
        ) : student.monthlyAnalysis.map((m) => (
          <div className="pdf-month-block" key={m.id}>
            <div className="title">{formatMonth(m.month)}</div>
            <div className="row">{m.analysis || "—"}</div>
          </div>
        ))}
        <div className="pdf-section-title">四、下个月学习规划</div>
        <div className="pdf-plan-text">{student.nextMonthPlan?.plan || "（未填写）"}</div>
        {(student.nextMonthPlan?.goals || []).length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#4f46e5" }}>🎯 目标清单</div>
            <ul className="pdf-goals-list">
              {student.nextMonthPlan.goals.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </>
        )}
        <div className="pdf-footer">学生档案管理系统</div>
      </div>

      <div className="pdf-page">
        <div className="pdf-section-title first">五、近三个月考试 / 比赛规划</div>
        {(() => {
          const now = Date.now();
          const threeMonthsLater = now + 1000 * 60 * 60 * 24 * 95;
          const events = (student.upcomingPlans || []).filter((e) => {
            if (!e.date) return true;
            const t = typeof e.date === "number" ? e.date : new Date(e.date).getTime();
            return t >= now - 1000 * 60 * 60 * 24 && t <= threeMonthsLater;
          });
          if (events.length === 0) return <div className="pdf-empty">暂无近三个月内的考试/比赛规划</div>;
          return (
            <table className="pdf-events-table">
              <thead>
                <tr><th style={{ width: 70 }}>类型</th><th>名称</th>
                  <th style={{ width: 100 }}>日期</th><th style={{ width: 90 }}>级别</th><th>备注</th></tr>
              </thead>
              <tbody>
                {events.sort((a, b) => (a.date || 0) - (b.date || 0)).map((e) => (
                  <tr key={e.id}>
                    <td><span className={`event-type-tag ${e.type}`}>{e.type === "exam" ? "考试" : "比赛"}</span></td>
                    <td>{e.name || "—"}</td>
                    <td>{formatShortDate(e.date)}</td>
                    <td>{e.level || "—"}</td>
                    <td>{e.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
        <div className="pdf-section-title">六、综合评语</div>
        <div className="pdf-plan-text">
          {`该生学习科目：${(student.subjects || []).join("、") || "—"}。\n近 ${(student.weeklyRecords || []).length} 周共记录 ${(student.weeklyRecords || []).length} 条学习内容，请结合月度和下月规划持续跟进。`}
        </div>
        <div className="pdf-footer">学生档案管理系统 · 报告结束</div>
      </div>
    </div>
  );
};

/* ===================== PDF 导出 ===================== */

const exportToPDF = async (student) => {
  const root = document.getElementById("pdf-report-root");
  if (!root) {
    message.error("未找到 PDF 模板，请重试");
    return;
  }
  const loading = message.loading("正在生成 PDF，请稍候...", 0);
  try {
    root.classList.add("pdf-rendering");
    root.offsetHeight;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 80));

    const canvas = await window.html2canvas(root, {
      scale: 2, useCORS: true, backgroundColor: "#ffffff",
      windowWidth: 794, width: 794, scrollX: 0, scrollY: 0,
    });
    root.classList.remove("pdf-rendering");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const ratio = canvas.width / imgWidth;
    const pageHeightPx = pageHeight * ratio;
    let renderedHeight = 0;

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const pageImg = pageCanvas.toDataURL("image/jpeg", 0.92);
      if (renderedHeight > 0) pdf.addPage();
      const drawHeight = sliceHeight / ratio;
      pdf.addImage(pageImg, "JPEG", 0, 0, imgWidth, drawHeight);
      renderedHeight += sliceHeight;
    }

    const safeName = (student.name || "student").replace(/[\\/:*?"<>|]/g, "_");
    pdf.save(`${safeName}_学习档案_${formatShortDate(Date.now())}.pdf`);
    loading();
    message.success("PDF 已生成，开始下载");
  } catch (e) {
    console.error(e);
    root.classList.remove("pdf-rendering");
    loading();
    message.error("生成 PDF 失败：" + (e?.message || "未知错误"));
  }
};

/* ===================== 详情页 ===================== */

const StudentDetailPage = ({ student, onBack, onChange, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);

  // 自动保存：学生变更后 800ms 防抖写入 Supabase
  useEffect(() => {
    if (!supabase) return;
    setSaving(true);
    const t = setTimeout(async () => {
      try {
        await api.upsertStudent(student);
        setSavedTick((n) => n + 1);
      } catch (e) {
        message.error("保存失败：" + e.message);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [student]);

  return (
    <div>
      <div className="detail-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button onClick={onBack}>← 返回</Button>
          <div className="name-block">
            <div className="name">{student.name || "未命名学生"}</div>
            <div className="info">
              {student.age ? `${student.age} 岁` : ""}{" "}
              {student.grade ? `· ${student.grade}` : ""}{" "}
              {(student.subjects || []).length > 0 ? `· ${(student.subjects || []).join("、")}` : ""}{" "}
              · <span style={{ color: saving ? "#f59e0b" : "#10b981" }}>
                {saving ? "保存中…" : savedTick > 0 ? "已同步到云端" : "未保存"}
              </span>
            </div>
          </div>
        </div>
        <Space>
          <Button type="primary" size="large" onClick={() => exportToPDF(student)}>
            📄 导出 PDF 学习报告
          </Button>
          <Popconfirm
            title="确认删除该学生档案？"
            description="删除后所有协作者都将看不到，且无法恢复"
            okText="删除" cancelText="取消" okType="danger"
            onConfirm={onDelete}
          >
            <Button danger size="large">删除档案</Button>
          </Popconfirm>
        </Space>
      </div>

      <Tabs defaultActiveKey="basic" type="card" size="large">
        <TabPane tab="基础信息" key="basic"><BasicInfoSection student={student} onChange={onChange} /></TabPane>
        <TabPane tab="每周学习" key="weekly"><WeeklySection student={student} onChange={onChange} /></TabPane>
        <TabPane tab="月度分析" key="monthly"><MonthlySection student={student} onChange={onChange} /></TabPane>
        <TabPane tab="下月规划" key="plan"><NextMonthSection student={student} onChange={onChange} /></TabPane>
        <TabPane tab="考试/比赛" key="upcoming"><UpcomingSection student={student} onChange={onChange} /></TabPane>
      </Tabs>
    </div>
  );
};

/* ===================== 根组件 ===================== */

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [org, setOrg] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useHashRoute();

  // 监听 auth 状态
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadOrgAndStudents(session.user.id);
      } else {
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadOrgAndStudents(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setOrg(null);
        setStudents([]);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const loadOrgAndStudents = async (userId) => {
    try {
      setLoading(true);
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("id, email, display_name, org_id, organizations(id, name, invite_code)")
        .eq("id", userId)
        .single();
      if (pErr) {
        // profile 不存在，可能是新注册 trigger 还没跑完
        console.warn("profile not found", pErr);
        setLoading(false);
        return;
      }
      setProfile(prof);
      setOrg(prof.organizations);
      const list = await api.listStudents();
      setStudents(list);
    } catch (e) {
      message.error("加载数据失败：" + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("#/");
  };

  const handleCreate = async (withSample = false) => {
    const created = withSample ? buildSample() : [newStudent(`学生 ${students.length + 1}`)];
    try {
      for (const s of created) {
        await api.upsertStudent(s);
      }
      const list = await api.listStudents();
      setStudents(list);
      if (withSample) {
        message.success("已加载示例数据");
      } else {
        navigate(`#/student/${created[0].id}`);
      }
    } catch (e) {
      message.error("创建失败：" + e.message);
    }
  };

  const handleUpdate = async (next) => {
    setStudents(students.map((s) => (s.id === next.id ? next : s)));
    try {
      await api.upsertStudent(next);
    } catch (e) {
      message.error("保存失败：" + e.message);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "确认删除该学生档案？",
      content: "删除后所有协作者都将看不到，且无法恢复。",
      okText: "删除", cancelText: "取消", okType: "danger",
      onOk: async () => {
        try {
          await api.deleteStudent(id);
          setStudents(students.filter((s) => s.id !== id));
          message.success("已删除");
          navigate("#/");
        } catch (e) {
          message.error("删除失败：" + e.message);
        }
      },
    });
  };

  const handleExport = useCallback(
    (id) => {
      const s = students.find((x) => x.id === id);
      if (s) exportToPDF(s);
    },
    [students]
  );

  if (!supabase) return <NotConfiguredPage />;
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" tip="加载中…" />
      </div>
    );
  }
  if (!user) return <AuthPage />;

  // 路由
  const matchStudent = route.match(/^#\/student\/([\w-]+)$/);

  return (
    <Layout>
      <Header className="app-header">
        <h1>📚 学生档案管理系统</h1>
        <Space size="middle">
          {org && (
            <Tooltip title={`邀请码：${org.invite_code}（点击复制，其他老师可以用这个加入你的机构）`}>
              <span
                className="header-tip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigator.clipboard?.writeText(org.invite_code);
                  message.success(`邀请码 ${org.invite_code} 已复制`);
                }}
              >
                🏫 {org.name} · 邀请码 {org.invite_code}
              </span>
            </Tooltip>
          )}
          <span className="header-tip">{profile?.display_name || user.email}</span>
          <Button size="small" onClick={handleSignOut}>退出</Button>
        </Space>
      </Header>
      <Content className="app-content">
        {matchStudent ? (() => {
          const id = matchStudent[1];
          const current = students.find((s) => s.id === id);
          if (!current) {
            return (
              <Result
                status="404" title="未找到该学生" subTitle="可能已被删除"
                extra={<Button type="primary" onClick={() => navigate("#/")}>返回列表</Button>}
              />
            );
          }
          return (
            <>
              <StudentDetailPage
                student={current}
                onBack={() => navigate("#/")}
                onChange={handleUpdate}
                onDelete={() => handleDelete(current.id)}
              />
              <ReportDocument student={current} />
            </>
          );
        })() : (
          <StudentListPage
            students={students}
            onCreate={handleCreate}
            onOpen={(id) => navigate(`#/student/${id}`)}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        )}
      </Content>
    </Layout>
  );
};

/* ===================== 挂载 ===================== */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#4f46e5",
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
