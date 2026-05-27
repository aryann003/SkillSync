import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, MessageSquare, Heart, LogOut, User, PlusCircle, Home, Globe2, RefreshCw } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function SkillSyncFrontend() {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || "");
  const [activeTab, setActiveTab] = useState("feed");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [profileForm, setProfileForm] = useState({ bio: "", skills: "", interests: "", profession: "" });
  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [communityForm, setCommunityForm] = useState({ name: "", description: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [communityResults, setCommunityResults] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);

  const isLoggedIn = Boolean(accessToken);

  function saveTokens(data) {
    if (data.access) {
      setAccessToken(data.access);
      localStorage.setItem("accessToken", data.access);
    }
    if (data.refresh) {
      setRefreshToken(data.refresh);
      localStorage.setItem("refreshToken", data.refresh);
    }
  }

  function logout() {
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setProfile(null);
    setPosts([]);
    setCommunities([]);
    setMessage("Logged out successfully.");
  }

  async function apiCall(endpoint, options = {}) {
    setLoading(true);
    setMessage("");

    try {
      const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = typeof data === "string" ? data : data.detail || data.error || JSON.stringify(data);
        throw new Error(errorMessage || "Request failed");
      }

      return data;
    } catch (error) {
      setMessage(error.message || "Something went wrong");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function registerUser(e) {
    e.preventDefault();
    const data = await apiCall("/register/", {
      method: "POST",
      body: JSON.stringify(registerForm),
    });
    setMessage(data.message || "Registration successful. You can login now.");
    setRegisterForm({ username: "", email: "", password: "" });
  }

  async function loginUser(e) {
    e.preventDefault();
    const data = await apiCall("/token/", {
      method: "POST",
      body: JSON.stringify(loginForm),
    });
    saveTokens(data);
    setMessage("Login successful.");
    setActiveTab("feed");
  }

  async function loadProfile() {
    const data = await apiCall("/profile/");
    setProfile(data);
    setProfileForm({
      bio: data.bio || "",
      skills: data.skills || "",
      interests: data.interests || "",
      profession: data.profession || "",
    });
  }

  async function updateProfile(e) {
    e.preventDefault();
    const data = await apiCall("/profile/update/", {
      method: "PATCH",
      body: JSON.stringify(profileForm),
    });
    setProfile(data);
    setMessage("Profile updated successfully.");
  }

  async function loadPosts() {
    const data = await apiCall("/posts/");
    setPosts(Array.isArray(data) ? data : []);
  }

  async function createPost(e) {
    e.preventDefault();
    const data = await apiCall("/posts/create/", {
      method: "POST",
      body: JSON.stringify(postForm),
    });
    setMessage(data.message || "Post created successfully.");
    setPostForm({ title: "", content: "" });
    await loadPosts();
  }

  async function likePost(id) {
    const data = await apiCall(`/posts/like/${id}/`, { method: "POST" });
    setMessage(data.message || "Post liked.");
    await loadPosts();
  }

  async function loadCommunities() {
    const data = await apiCall("/communities/");
    setCommunities(Array.isArray(data) ? data : []);
  }

  async function createCommunity(e) {
    e.preventDefault();
    const data = await apiCall("/communities/create/", {
      method: "POST",
      body: JSON.stringify(communityForm),
    });
    setMessage(data.message || "Community created successfully.");
    setCommunityForm({ name: "", description: "" });
    await loadCommunities();
  }

  async function joinCommunity(id) {
    const data = await apiCall(`/communities/join/${id}/`, { method: "POST" });
    setMessage(data.message || "Community joined.");
    await loadCommunities();
  }

  async function runSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMessage("Search query is required.");
      return;
    }

    const [users, communitiesData] = await Promise.all([
      apiCall(`/search/users/?q=${encodeURIComponent(searchQuery.trim())}`),
      apiCall(`/communities/search/?q=${encodeURIComponent(searchQuery.trim())}`),
    ]);

    setUserResults(Array.isArray(users) ? users : []);
    setCommunityResults(Array.isArray(communitiesData) ? communitiesData : []);
  }

  async function loadRecommendations() {
    const [users, communitiesData] = await Promise.all([
      apiCall("/recommend/users/"),
      apiCall("/communities/recommend/"),
    ]);

    setRecommendedUsers(Array.isArray(users) ? users : users.data || []);
    setRecommendedCommunities(Array.isArray(communitiesData) ? communitiesData : communitiesData.data || []);
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    loadPosts().catch(() => {});
    loadCommunities().catch(() => {});
    loadProfile().catch(() => {});
  }, [isLoggedIn]);

  const navItems = useMemo(() => [
    { id: "feed", label: "Feed", icon: Home },
    { id: "profile", label: "Profile", icon: User },
    { id: "communities", label: "Communities", icon: Users },
    { id: "search", label: "Search", icon: Search },
    { id: "recommend", label: "Recommend", icon: Globe2 },
  ], []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SkillSync</h1>
            <p className="text-sm text-slate-500">Connect through skills, interests, and learning journeys</p>
          </div>

          {isLoggedIn && (
            <button onClick={logout} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        {loading && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <RefreshCw size={16} className="animate-spin" /> Loading...
          </div>
        )}

        {!isLoggedIn ? (
          <AuthScreen
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerUser={registerUser}
            loginUser={loginUser}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
            <aside className="h-fit rounded-3xl border bg-white p-3 shadow-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const selected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "feed") loadPosts().catch(() => {});
                      if (item.id === "communities") loadCommunities().catch(() => {});
                      if (item.id === "profile") loadProfile().catch(() => {});
                      if (item.id === "recommend") loadRecommendations().catch(() => {});
                    }}
                    className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${selected ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <Icon size={18} /> {item.label}
                  </button>
                );
              })}
            </aside>

            <section>
              {activeTab === "feed" && (
                <FeedTab postForm={postForm} setPostForm={setPostForm} createPost={createPost} posts={posts} likePost={likePost} />
              )}

              {activeTab === "profile" && (
                <ProfileTab profile={profile} profileForm={profileForm} setProfileForm={setProfileForm} updateProfile={updateProfile} />
              )}

              {activeTab === "communities" && (
                <CommunitiesTab communityForm={communityForm} setCommunityForm={setCommunityForm} createCommunity={createCommunity} communities={communities} joinCommunity={joinCommunity} />
              )}

              {activeTab === "search" && (
                <SearchTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} runSearch={runSearch} userResults={userResults} communityResults={communityResults} />
              )}

              {activeTab === "recommend" && (
                <RecommendTab recommendedUsers={recommendedUsers} recommendedCommunities={recommendedCommunities} loadRecommendations={loadRecommendations} />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function AuthScreen({ registerForm, setRegisterForm, loginForm, setLoginForm, registerUser, loginUser }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold">Create account</h2>
        <p className="mb-6 text-sm text-slate-500">Register a new SkillSync user.</p>
        <form onSubmit={registerUser} className="space-y-4">
          <Input label="Username" value={registerForm.username} onChange={(v) => setRegisterForm({ ...registerForm, username: v })} />
          <Input label="Email" type="email" value={registerForm.email} onChange={(v) => setRegisterForm({ ...registerForm, email: v })} />
          <Input label="Password" type="password" value={registerForm.password} onChange={(v) => setRegisterForm({ ...registerForm, password: v })} />
          <PrimaryButton>Register</PrimaryButton>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold">Login</h2>
        <p className="mb-6 text-sm text-slate-500">Login with JWT authentication.</p>
        <form onSubmit={loginUser} className="space-y-4">
          <Input label="Username" value={loginForm.username} onChange={(v) => setLoginForm({ ...loginForm, username: v })} />
          <Input label="Password" type="password" value={loginForm.password} onChange={(v) => setLoginForm({ ...loginForm, password: v })} />
          <PrimaryButton>Login</PrimaryButton>
        </form>
      </motion.div>
    </div>
  );
}

function FeedTab({ postForm, setPostForm, createPost, posts, likePost }) {
  return (
    <div className="space-y-6">
      <Card title="Create Post" subtitle="Share your learning update, project progress, or question.">
        <form onSubmit={createPost} className="space-y-4">
          <Input label="Title" value={postForm.title} onChange={(v) => setPostForm({ ...postForm, title: v })} />
          <Textarea label="Content" value={postForm.content} onChange={(v) => setPostForm({ ...postForm, content: v })} />
          <PrimaryButton icon={<PlusCircle size={17} />}>Create Post</PrimaryButton>
        </form>
      </Card>

      <div className="grid gap-4">
        {posts.length === 0 ? <EmptyState text="No posts found." /> : posts.map((post) => (
          <Card key={post.id} title={post.title || "Untitled Post"} subtitle={`Post ID: ${post.id}`}>
            <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <button onClick={() => likePost(post.id)} className="flex items-center gap-2 rounded-xl border px-3 py-2 font-semibold hover:bg-slate-50">
                <Heart size={16} /> Like
              </button>
              <span>{post.like_count ?? 0} likes</span>
              <span>{post.comment_count ?? 0} comments</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile, profileForm, setProfileForm, updateProfile }) {
  return (
    <div className="space-y-6">
      <Card title="My Profile" subtitle="Keep your learning identity updated for better recommendations.">
        {profile && (
          <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p><b>Profile ID:</b> {profile.id}</p>
            <p><b>User:</b> {profile.user}</p>
          </div>
        )}
        <form onSubmit={updateProfile} className="space-y-4">
          <Textarea label="Bio" value={profileForm.bio} onChange={(v) => setProfileForm({ ...profileForm, bio: v })} />
          <Input label="Skills" value={profileForm.skills} onChange={(v) => setProfileForm({ ...profileForm, skills: v })} placeholder="Django, Python, REST API" />
          <Input label="Interests" value={profileForm.interests} onChange={(v) => setProfileForm({ ...profileForm, interests: v })} placeholder="Backend, DSA, Open Source" />
          <Input label="Profession" value={profileForm.profession} onChange={(v) => setProfileForm({ ...profileForm, profession: v })} placeholder="Student / Backend Developer" />
          <PrimaryButton>Update Profile</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}

function CommunitiesTab({ communityForm, setCommunityForm, createCommunity, communities, joinCommunity }) {
  return (
    <div className="space-y-6">
      <Card title="Create Community" subtitle="Create a learning group around a skill, goal, or topic.">
        <form onSubmit={createCommunity} className="space-y-4">
          <Input label="Community Name" value={communityForm.name} onChange={(v) => setCommunityForm({ ...communityForm, name: v })} />
          <Textarea label="Description" value={communityForm.description} onChange={(v) => setCommunityForm({ ...communityForm, description: v })} />
          <PrimaryButton icon={<Users size={17} />}>Create Community</PrimaryButton>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {communities.length === 0 ? <EmptyState text="No communities found." /> : communities.map((community) => (
          <Card key={community.id} title={community.name} subtitle={`Community ID: ${community.id}`}>
            <p className="mb-4 text-sm leading-6 text-slate-700">{community.description || "No description added."}</p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{community.member_count ?? 0} members</span>
              <button onClick={() => joinCommunity(community.id)} className="rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-700">
                Join
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SearchTab({ searchQuery, setSearchQuery, runSearch, userResults, communityResults }) {
  return (
    <div className="space-y-6">
      <Card title="Search" subtitle="Find users and communities by interests, skills, profession, name, or description.">
        <form onSubmit={runSearch} className="flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Django, Python, Backend..."
          />
          <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
            <Search size={17} /> Search
          </button>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Users" subtitle={`${userResults.length} result(s)`}>
          <ResultList items={userResults} type="user" />
        </Card>
        <Card title="Communities" subtitle={`${communityResults.length} result(s)`}>
          <ResultList items={communityResults} type="community" />
        </Card>
      </div>
    </div>
  );
}

function RecommendTab({ recommendedUsers, recommendedCommunities, loadRecommendations }) {
  return (
    <div className="space-y-6">
      <Card title="Recommendations" subtitle="Suggested users and communities based on your profile data.">
        <button onClick={loadRecommendations} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
          Refresh Recommendations
        </button>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recommended Users" subtitle={`${recommendedUsers.length} suggestion(s)`}>
          <ResultList items={recommendedUsers} type="user" />
        </Card>
        <Card title="Recommended Communities" subtitle={`${recommendedCommunities.length} suggestion(s)`}>
          <ResultList items={recommendedCommunities} type="community" />
        </Card>
      </div>
    </div>
  );
}

function ResultList({ items, type }) {
  if (!items || items.length === 0) return <EmptyState text="No results yet." />;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${type}-${item.id}`} className="rounded-2xl border bg-slate-50 p-4">
          <h4 className="font-bold text-slate-900">{type === "user" ? item.user?.username || item.username || `Profile ${item.id}` : item.name}</h4>
          <p className="mt-1 text-sm text-slate-600">{type === "user" ? item.bio || item.profession || "No profile details." : item.description || "No description."}</p>
          {type === "user" && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              {item.skills && <span className="rounded-full bg-white px-3 py-1">{item.skills}</span>}
              {item.interests && <span className="rounded-full bg-white px-3 py-1">{item.interests}</span>}
              {item.profession && <span className="rounded-full bg-white px-3 py-1">{item.profession}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-28 w-full resize-y rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function PrimaryButton({ children, icon }) {
  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
      {icon} {children}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500">
      <MessageSquare className="mx-auto mb-2" size={22} />
      {text}
    </div>
  );
}
