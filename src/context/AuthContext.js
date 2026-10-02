import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

function mapUser(sessionUser) {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  return {
    id: sessionUser.id,
    email: sessionUser.email || "",
    name: meta.full_name || meta.name || sessionUser.email || "Usuário",
    avatar: meta.avatar_url || meta.picture || "",
  };
}

function paramsFromUrl(url) {
  const parsed = Linking.parse(url);
  const hash = url.includes("#") ? url.split("#")[1] : "";
  return { ...Object.fromEntries(new URLSearchParams(hash)), ...(parsed.queryParams || {}) };
}

function isLoopback(host) {
  return /^(localhost|127\.0\.0\.1)(:|$)/.test(host || "");
}

function googleRedirectUrl() {
  if (Platform.OS === "web") {
    return window.location.origin;
  }

  const host = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";
  if (host && !isLoopback(host)) {
    return `exp://${host}/--/google-auth`;
  }

  return Linking.createURL("google-auth");
}

async function createSessionFromUrl(url) {
  if (!url) return false;
  const params = paramsFromUrl(url);

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: String(params.access_token),
      refresh_token: String(params.refresh_token),
    });
    if (error) throw error;
    return true;
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(String(params.code));
    if (error) throw error;
    return true;
  }

  if (params.error_description || params.error) {
    throw new Error(decodeURIComponent(String(params.error_description || params.error).replace(/\+/g, " ")));
  }

  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applyUrl = (url) => {
      createSessionFromUrl(url).catch((error) => {
        if (mounted && (String(url).includes("access_token") || String(url).includes("error"))) {
          console.warn("Login Google:", error?.message || error);
        }
      });
    };

    if (Platform.OS === "web") {
      applyUrl(window.location.href);
    } else {
      Linking.getInitialURL().then((url) => {
        if (url) applyUrl(url);
      });
    }

    const linking = Linking.addEventListener("url", ({ url }) => applyUrl(url));

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(mapUser(data.session?.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      linking.remove();
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    const redirectTo = googleRedirectUrl();
    const queryParams = { access_type: "offline", prompt: "consent" };

    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams },
      });
      if (error) throw error;
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Não foi possível abrir o login.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success") {
      await createSessionFromUrl(result.url);
    }
  };

  const signOut = () => supabase.auth.signOut();

  const updateProfile = (name) => {
    setUser((current) => (current ? { ...current, name } : current));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
